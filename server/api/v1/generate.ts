/**
 * POST /v1/generate — Start a media or audio generation task.
 *
 * Authentication: Bearer API key (cx_...) in Authorization header.
 */

import { defineEventHandler, getHeader, readBody, setResponseStatus } from "h3";
import { sql } from "@/lib/db";
import { createTask, buildCallbackUrl } from "@/lib/kie-api/client";
import { getActiveModelBySlug } from "@/lib/api/shared";
import { ensureSufficientCredits, recordTransaction, refundGeneration } from "@/lib/credits";
import { sha256Hex } from "../../../src/lib/utils/crypto";
import { errorContext, logger } from "../../../src/lib/logger";
import {
  checkRateLimit,
  getRemainingRequests,
  getResetTime,
  RATE_LIMITS,
} from "../../../src/lib/rate-limit";

export default defineEventHandler(async (event) => {
  let runId: number | null = null;
  let nodeExecutionId: number | null = null;
  let userId: number | null = null;
  let chargedAmount = 0;

  try {
    const auth = getHeader(event, "authorization");
    if (!auth?.startsWith("Bearer cx_")) {
      setResponseStatus(event, 401);
      return { error: "Invalid API key format. Use: Authorization: Bearer cx_..." };
    }
    const token = auth.slice(7);
    const keyHash = await sha256Hex(token);
    const keyRows = (await sql`
      SELECT id, user_id FROM api_keys
      WHERE key_hash = ${keyHash} AND status = 'active'
      LIMIT 1
    `) as { id: number; user_id: number }[];
    if (keyRows.length === 0) {
      setResponseStatus(event, 401);
      return { error: "Invalid or inactive API key" };
    }
    userId = keyRows[0].user_id;

    const rlKey = `api:generate:${userId}`;
    if (!checkRateLimit(rlKey, RATE_LIMITS.generation)) {
      setResponseStatus(event, 429);
      return { error: "Rate limit exceeded" };
    }
    const remaining = getRemainingRequests(rlKey, RATE_LIMITS.generation);
    const resetMs = getResetTime(rlKey);
    event.node?.res?.setHeader("X-RateLimit-Limit", String(RATE_LIMITS.generation.limit));
    event.node?.res?.setHeader("X-RateLimit-Remaining", String(remaining));
    event.node?.res?.setHeader("X-RateLimit-Reset", String(Math.ceil(resetMs / 1000)));

    const body = (await readBody(event)) as Record<string, unknown> | undefined;
    const modelSlug = typeof body?.model === "string" ? body.model.trim() : "";
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const resolution = typeof body?.resolution === "string" ? body.resolution : undefined;
    if (!modelSlug) {
      setResponseStatus(event, 400);
      return { error: "model is required" };
    }
    if (!prompt) {
      setResponseStatus(event, 400);
      return { error: "prompt is required" };
    }
    if (prompt.length > 10000) {
      setResponseStatus(event, 400);
      return { error: "prompt too long (max 10000 characters)" };
    }

    const model = await getActiveModelBySlug(modelSlug);
    if (!model) {
      setResponseStatus(event, 404);
      return { error: `Model '${modelSlug}' not found or inactive` };
    }
    const cost = Number(model.cortexia_price_usd ?? 0);
    if (!Number.isFinite(cost) || cost <= 0) {
      setResponseStatus(event, 503);
      return { error: "Model pricing is unavailable" };
    }
    chargedAmount = cost;

    const balance = await ensureSufficientCredits(userId, cost);
    if (!balance.ok) {
      setResponseStatus(event, 402);
      return {
        error: "Insufficient credits",
        balance: balance.balance,
        required: balance.required,
      };
    }

    const input: Record<string, unknown> = { prompt };
    if (resolution) input.resolution = resolution;

    const workflow = (await sql`
      INSERT INTO workflows (user_id, name, status)
      VALUES (${userId}, ${`API · ${model.name}`}, 'running')
      RETURNING id
    `) as { id: number }[];
    const workflowId = workflow[0].id;
    const node = (await sql`
      INSERT INTO workflow_nodes (workflow_id, type, model_slug, config, canvas_x, canvas_y)
      VALUES (${workflowId}, 'model', ${model.slug}, ${JSON.stringify(input)}::jsonb, '0', '0')
      RETURNING id
    `) as { id: number }[];
    const run = (await sql`
      INSERT INTO runs (workflow_id, user_id, status, total_cost_usd)
      VALUES (${workflowId}, ${userId}, 'running', ${cost})
      RETURNING id
    `) as { id: number }[];
    runId = run[0].id;
    const execution = (await sql`
      INSERT INTO run_node_executions
        (run_id, workflow_node_id, status, input_params, started_at, cost_usd)
      VALUES
        (${runId}, ${node[0].id}, 'submitting', ${JSON.stringify(input)}::jsonb, NOW(), ${cost})
      RETURNING id
    `) as { id: number }[];
    nodeExecutionId = execution[0].id;

    await recordTransaction({
      userId,
      amount: -cost,
      type: "usage",
      reference: `run:${runId}/exec:${nodeExecutionId}`,
    });

    const callback = (() => {
      try {
        return buildCallbackUrl();
      } catch {
        return undefined;
      }
    })();
    const taskResult = await createTask({
      model: model.kie_endpoint,
      input,
      ...(callback ? { callBackUrl: callback } : {}),
    });
    await sql`
      UPDATE run_node_executions
      SET status = 'queued', kie_task_id = ${taskResult.taskId}
      WHERE id = ${nodeExecutionId} AND status = 'submitting'
    `;

    return {
      id: `gen_${nodeExecutionId}`,
      object: "generation",
      status: "processing",
      model: modelSlug,
      created_at: new Date().toISOString(),
    };
  } catch (err) {
    if (userId != null && runId != null && nodeExecutionId != null && chargedAmount > 0) {
      try {
        await refundGeneration({ userId, amount: chargedAmount, runId, nodeExecutionId });
      } catch (refundError) {
        logger.error("api.generate.refund_failed", {
          runId,
          nodeExecutionId,
          ...errorContext(refundError),
        });
      }
      await sql`
        UPDATE run_node_executions
        SET status = 'failed', completed_at = NOW(), error_message = ${err instanceof Error ? err.message.slice(0, 2000) : "Generation submission failed"}
        WHERE id = ${nodeExecutionId} AND status IN ('submitting', 'queued')
      `.catch((updateError) =>
        logger.error("api.generate.execution_mark_failed", {
          nodeExecutionId,
          ...errorContext(updateError),
        }),
      );
      await sql`
        UPDATE runs SET status = 'failed', completed_at = NOW()
        WHERE id = ${runId} AND status = 'running'
      `.catch((updateError) =>
        logger.error("api.generate.run_mark_failed", { runId, ...errorContext(updateError) }),
      );
    }
    logger.error("api.generate.submission_failed", {
      runId,
      nodeExecutionId,
      userId,
      ...errorContext(err),
    });
    setResponseStatus(event, 500);
    return { error: "Internal server error" };
  }
});
