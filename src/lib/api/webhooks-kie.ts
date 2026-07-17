/**
 * POST /api/webhooks/kie — kie.ai task-completion callback.
 *
 * kie.ai POSTs a JSON payload containing a taskId and a state. We:
 *   1. Verify the taskId matches a row in run_node_executions.
 *   2. On success: download the result, re-host on R2, write an asset
 *      row, mark the execution succeeded, debit any post-run credits
 *      (e.g. 1m-tokens-io LLM cost) and roll up the run.
 *   3. On failure: mark the execution failed and refund any upfront
 *      credit debit so failed runs don't charge the user.
 *
 * Signature verification is a no-op for now (kie.ai's docs say it's
 * optional). The DB lookup IS the auth — unknown taskIds are rejected.
 */

import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/lib/db";
import { extractTaskId, verifyTaskId, type WebhookPayload } from "@/lib/kie-api/webhook";
import { getFreshDownloadUrl, getTaskDetail, parseResultJson } from "@/lib/kie-api/common";
import { buildAssetKey, downloadToBuffer, putObject } from "@/lib/storage/r2";
import { refundGeneration } from "@/lib/credits";
import { HttpError, toJsonResponse } from "./auth";

export type WebhookInput = WebhookPayload | Record<string, unknown>;

export type WebhookResponse = {
  ok: boolean;
  taskId: string | null;
  action: "no-op" | "asset-created" | "execution-failed" | "rejected" | "ignored";
  reason?: string;
  assetId?: number;
  runNodeExecutionId?: number;
};

export const kieWebhook = createServerFn({ method: "POST" })
  .validator((data: WebhookInput): WebhookInput => {
    // The kie.ai callback has no stable schema, so we accept anything
    // object-shaped and let the handler figure out the taskId.
    if (!data || typeof data !== "object") {
      throw new HttpError(400, "Invalid body");
    }
    return data;
  })
  .handler(async ({ data }) => {
    try {
      return await handleWebhook(data);
    } catch (err) {
      if (err instanceof HttpError) {
        // For webhooks we always return 200 unless the request itself
        // is malformed — kie.ai will retry on 5xx. Surface the error
        // in the body so it shows up in kie.ai's logs.
        return {
          ok: false,
          taskId: extractTaskId(data),
          action: "rejected" as const,
          reason: err.message,
        } satisfies WebhookResponse;
      }
      throw toJsonResponse(err);
    }
  });

async function handleWebhook(body: WebhookInput): Promise<WebhookResponse> {
  const taskId = extractTaskId(body);
  if (!taskId) {
    return { ok: false, taskId: null, action: "rejected", reason: "missing taskId" };
  }

  // Authoritative state comes from kie.ai (the webhook payload's `state`
  // can lag). We use recordInfo as the source of truth.
  let info;
  try {
    info = await getTaskDetail(taskId);
  } catch (err) {
    return {
      ok: false,
      taskId,
      action: "rejected",
      reason: err instanceof Error ? err.message : "kie.ai lookup failed",
    };
  }

  const verification = await verifyTaskId(taskId);
  if (!verification.ok) {
    return { ok: false, taskId, action: "rejected", reason: verification.reason };
  }

  if (info.state === "success") {
    return await handleSuccess(taskId, info, verification);
  }
  if (info.state === "fail") {
    return await handleFailure(taskId, info, verification);
  }
  // waiting/queuing/generating — kie.ai is being noisy. Acknowledge so
  // it stops retrying, but don't change DB state.
  return { ok: true, taskId, action: "no-op", reason: `state=${info.state}` };
}

async function handleSuccess(
  taskId: string,
  info: Awaited<ReturnType<typeof getTaskDetail>>,
  verification: { ok: true; runNodeExecutionId: number; userId: number | null; modelSlug: string },
): Promise<WebhookResponse> {
  const { resultUrls, resultObject } = parseResultJson(info.resultJson);

  if (resultUrls.length === 0) {
    // Some models (e.g. LLMs) return text in resultObject. We still
    // record a successful run but no media asset.
    await sql`
      UPDATE run_node_executions
      SET status = 'succeeded', completed_at = NOW(),
          cost_usd = COALESCE(${info.creditsConsumed ?? 0}::numeric, 0)
      WHERE id = ${verification.runNodeExecutionId}
    `;
    await maybeFinalizeRun(verification.runNodeExecutionId);
    return {
      ok: true,
      taskId,
      action: "no-op",
      runNodeExecutionId: verification.runNodeExecutionId,
      reason: "no media urls (text-only result)",
    };
  }

  // Take the first URL for the asset. Multi-URL models (Seedance with
  // return_last_frame) would need an extra column; for MVP we store the
  // primary.
  const sourceUrl = await getFreshDownloadUrl(resultUrls[0]);
  const exec = (await sql`
    SELECT run_id, cost_usd::text AS cost_usd FROM run_node_executions
    WHERE id = ${verification.runNodeExecutionId} LIMIT 1
  `) as { run_id: number; cost_usd: string }[];
  const runId = exec[0]?.run_id ?? 0;

  // Best-effort R2 re-host. If R2 isn't configured we fall through to
  // the passthrough URL; the asset still gets a row.
  const key = buildAssetKey({
    userId: verification.userId,
    runId,
    nodeExecutionId: verification.runNodeExecutionId,
    sourceUrl,
  });
  let storageUrl = sourceUrl;
  let previewUrl: string | null = null;
  try {
    const { body, contentType } = await downloadToBuffer(sourceUrl);
    const put = await putObject({
      key,
      body,
      contentType,
    });
    storageUrl = put.url;
    previewUrl = put.url;
  } catch (err) {
    // Keep the upstream URL; the asset row still records metadata.
    console.warn(`[kie-webhook] R2 upload failed for ${taskId}:`, err);
  }

  // Persist the asset + mark the execution succeeded.
  const asset = (await sql`
    INSERT INTO assets
      (user_id, run_node_execution_id, model_slug, type, storage_url, preview_url, metadata)
    VALUES
      (${verification.userId}, ${verification.runNodeExecutionId}, ${verification.modelSlug},
       ${categoryToAssetType(verification.modelSlug)},
       ${storageUrl}, ${previewUrl},
       ${JSON.stringify({
         kieTaskId: taskId,
         resultUrls,
         resultObject: resultObject ?? null,
         costTimeMs: info.costTime ?? null,
         creditsConsumed: info.creditsConsumed ?? null,
       })}::jsonb)
    RETURNING id
  `) as { id: number }[];

  await sql`
    UPDATE run_node_executions
    SET status = 'succeeded', completed_at = NOW(),
        output_asset_id = ${asset[0].id},
        cost_usd = COALESCE(${info.creditsConsumed ?? 0}::numeric, 0)
    WHERE id = ${verification.runNodeExecutionId}
  `;

  await maybeFinalizeRun(verification.runNodeExecutionId);

  return {
    ok: true,
    taskId,
    action: "asset-created",
    assetId: asset[0].id,
    runNodeExecutionId: verification.runNodeExecutionId,
  };
}

async function handleFailure(
  taskId: string,
  info: Awaited<ReturnType<typeof getTaskDetail>>,
  verification: { ok: true; runNodeExecutionId: number; userId: number | null; modelSlug: string },
): Promise<WebhookResponse> {
  // Refund any upfront debit. The reference is `run:N/node:M` or
  // `run:N/exec:M` depending on the entry point.
  if (verification.userId != null) {
    const exec = (await sql`
      SELECT run_id, cost_usd::text AS cost_usd FROM run_node_executions
      WHERE id = ${verification.runNodeExecutionId} LIMIT 1
    `) as { run_id: number; cost_usd: string }[];
    const cost = Number(exec[0]?.cost_usd ?? 0);
    if (cost > 0) {
      await refundGeneration({
        userId: verification.userId,
        amount: cost,
        runId: exec[0].run_id,
        nodeExecutionId: verification.runNodeExecutionId,
      });
    }
  }

  await sql`
    UPDATE run_node_executions
    SET status = 'failed', completed_at = NOW(),
        error_message = ${(info.failMsg ?? info.failCode ?? "kie.ai reported failure").slice(0, 2000)}
    WHERE id = ${verification.runNodeExecutionId}
  `;
  await maybeFinalizeRun(verification.runNodeExecutionId);

  return {
    ok: true,
    taskId,
    action: "execution-failed",
    runNodeExecutionId: verification.runNodeExecutionId,
  };
}

/** If every execution in the run is done, mark the run succeeded/failed. */
async function maybeFinalizeRun(runNodeExecutionId: number) {
  const runRow = (await sql`
    SELECT run_id FROM run_node_executions WHERE id = ${runNodeExecutionId} LIMIT 1
  `) as { run_id: number }[];
  if (runRow.length === 0) return;
  const runId = runRow[0].run_id;

  const stats = (await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
      COUNT(*) FILTER (WHERE status IN ('succeeded', 'failed'))::int AS done
    FROM run_node_executions
    WHERE run_id = ${runId}
  `) as { total: number; failed: number; done: number }[];
  if (stats.length === 0) return;
  const s = stats[0];
  if (s.done < s.total) return; // not finished yet

  const finalStatus = s.failed === s.total ? "failed" : s.failed > 0 ? "partial" : "succeeded";
  await sql`
    UPDATE runs
    SET status = ${finalStatus}, completed_at = NOW()
    WHERE id = ${runId}
  `;
}

/** Map a model slug to the asset.type we store. Looks at the model row. */
async function categoryToAssetType(modelSlug: string): Promise<string> {
  const rows = (await sql`
    SELECT category FROM models WHERE slug = ${modelSlug} LIMIT 1
  `) as { category: string }[];
  return rows[0]?.category ?? "text";
}
