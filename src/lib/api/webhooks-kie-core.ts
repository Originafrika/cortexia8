/**
 * kie.ai webhook handler — pure logic, no TanStack Start dependency.
 *
 * Imported by both:
 *   - server/api/webhooks/kie.ts (Nitro raw handler — avoids createServerFn)
 *   - src/lib/api/webhooks-kie.ts (TanStack Start createServerFn wrapper)
 *   - src/lib/api/generation-status.ts (inline fallback polling)
 */

import { sql } from "@/lib/db";
import { extractTaskId, verifyTaskId, type WebhookPayload } from "@/lib/kie-api/webhook";
import { getFreshDownloadUrl, getTaskDetail, parseResultJson } from "@/lib/kie-api/common";
import { buildAssetKey, downloadToBuffer, putObject } from "@/lib/storage/r2";
import { refundGeneration } from "@/lib/credits";

export type WebhookInput = WebhookPayload | Record<string, unknown>;

export type WebhookResponse = {
  ok: boolean;
  taskId: string | null;
  action: "no-op" | "asset-created" | "execution-failed" | "rejected" | "ignored";
  reason?: string;
  assetId?: number;
  runNodeExecutionId?: number;
};

export async function handleWebhook(body: WebhookInput): Promise<WebhookResponse> {
  const taskId = extractTaskId(body);
  if (!taskId) {
    return { ok: false, taskId: null, action: "rejected", reason: "missing taskId" };
  }

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
  return { ok: true, taskId, action: "no-op", reason: `state=${info.state}` };
}

async function handleSuccess(
  taskId: string,
  info: Awaited<ReturnType<typeof getTaskDetail>>,
  verification: {
    ok: true;
    runNodeExecutionId: number;
    userId: number | null;
    modelSlug: string;
    category: string;
  },
): Promise<WebhookResponse> {
  const { resultUrls, resultObject } = parseResultJson(info.resultJson);

  if (resultUrls.length === 0) {
    const textContent = resultObject
      ? ((resultObject.content as string) ??
        (resultObject.text as string) ??
        (resultObject.choices as { message?: { content?: string } }[])?.[0]?.message?.content ??
        JSON.stringify(resultObject))
      : null;

    const updated = (await sql`
      UPDATE run_node_executions
      SET status = 'succeeded', completed_at = NOW(), text_result = ${textContent}
      WHERE id = ${verification.runNodeExecutionId}
        AND status NOT IN ('succeeded', 'failed')
      RETURNING id
    `) as { id: number }[];
    if (updated.length === 0) {
      return {
        ok: true,
        taskId,
        action: "no-op",
        runNodeExecutionId: verification.runNodeExecutionId,
        reason: "execution already terminal",
      };
    }
    await maybeFinalizeRun(verification.runNodeExecutionId);
    return {
      ok: true,
      taskId,
      action: "no-op",
      runNodeExecutionId: verification.runNodeExecutionId,
      reason: "text-only result stored in text_result",
    };
  }

  const current = (await sql`
    SELECT status, output_asset_id FROM run_node_executions
    WHERE id = ${verification.runNodeExecutionId}
    LIMIT 1
  `) as { status: string; output_asset_id: number | null }[];
  if (current[0]?.status === "succeeded" || current[0]?.status === "failed") {
    return {
      ok: true,
      taskId,
      action: "no-op",
      runNodeExecutionId: verification.runNodeExecutionId,
      reason: "execution already terminal",
    };
  }

  const sourceUrl = await getFreshDownloadUrl(resultUrls[0]);
  const exec = (await sql`
    SELECT run_id, cost_usd::text AS cost_usd FROM run_node_executions
    WHERE id = ${verification.runNodeExecutionId} LIMIT 1
  `) as { run_id: number; cost_usd: string }[];
  const runId = exec[0]?.run_id ?? 0;

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
    const put = await putObject({ key, body, contentType });
    storageUrl = put.url;
    previewUrl = put.url;
  } catch (err) {
    console.warn(`[kie-webhook] R2 upload failed for ${taskId}:`, err);
  }

  const asset = (await sql`
    INSERT INTO assets
      (user_id, run_node_execution_id, model_slug, type, storage_url, preview_url, metadata)
    VALUES
      (${verification.userId}, ${verification.runNodeExecutionId}, ${verification.modelSlug},
       ${verification.category},
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

  const updatedExec = (await sql`
    UPDATE run_node_executions
    SET status = 'succeeded', completed_at = NOW(), output_asset_id = ${asset[0].id}
    WHERE id = ${verification.runNodeExecutionId}
      AND status NOT IN ('succeeded', 'failed')
    RETURNING id
  `) as { id: number }[];
  if (updatedExec.length === 0) {
    await sql`DELETE FROM assets WHERE id = ${asset[0].id}`;
    return {
      ok: true,
      taskId,
      action: "no-op",
      runNodeExecutionId: verification.runNodeExecutionId,
      reason: "execution already terminal",
    };
  }

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
  verification: {
    ok: true;
    runNodeExecutionId: number;
    userId: number | null;
    modelSlug: string;
    category: string;
  },
): Promise<WebhookResponse> {
  const errorMessage = (info.failMsg ?? info.failCode ?? "kie.ai reported failure").slice(0, 2000);
  const claimed = (await sql`
    UPDATE run_node_executions
    SET status = 'failed', completed_at = NOW(), error_message = ${errorMessage}
    WHERE id = ${verification.runNodeExecutionId}
      AND status NOT IN ('succeeded', 'failed')
    RETURNING run_id, cost_usd::text AS cost_usd
  `) as { run_id: number; cost_usd: string }[];
  if (claimed.length === 0) {
    return {
      ok: true,
      taskId,
      action: "no-op",
      runNodeExecutionId: verification.runNodeExecutionId,
      reason: "execution already terminal",
    };
  }

  const cost = Number(claimed[0].cost_usd ?? 0);
  if (verification.userId != null && cost > 0) {
    await refundGeneration({
      userId: verification.userId,
      amount: cost,
      runId: claimed[0].run_id,
      nodeExecutionId: verification.runNodeExecutionId,
    });
  }

  await maybeFinalizeRun(verification.runNodeExecutionId);

  return {
    ok: true,
    taskId,
    action: "execution-failed",
    runNodeExecutionId: verification.runNodeExecutionId,
  };
}

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
  if (s.done < s.total) return;

  const finalStatus = s.failed === s.total ? "failed" : s.failed > 0 ? "partial" : "succeeded";
  await sql`
    UPDATE runs
    SET status = ${finalStatus}, completed_at = NOW()
    WHERE id = ${runId}
  `;
}
