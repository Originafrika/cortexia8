/**
 * GET /v1/generations/:id — Check generation status and retrieve result.
 *
 * Authentication: Bearer API key (cx_...) in Authorization header.
 */

import { defineEventHandler, getHeader, getRouterParam, setResponseStatus } from "h3";
import { sql } from "@/lib/db";
import { sha256Hex } from "../../../../src/lib/utils/crypto";
import {
  checkRateLimit,
  getRemainingRequests,
  getResetTime,
  RATE_LIMITS,
} from "../../../../src/lib/rate-limit";

export default defineEventHandler(async (event) => {
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
    const userId = keyRows[0].user_id;
    await sql`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${keyRows[0].id}`.catch(
      () => undefined,
    );

    const rlKey = `api:status:${userId}`;
    if (!checkRateLimit(rlKey, RATE_LIMITS.statusPolling)) {
      setResponseStatus(event, 429);
      return { error: "Rate limit exceeded" };
    }
    const remaining = getRemainingRequests(rlKey, RATE_LIMITS.statusPolling);
    const resetMs = getResetTime(rlKey);
    event.node?.res?.setHeader("X-RateLimit-Limit", String(RATE_LIMITS.statusPolling.limit));
    event.node?.res?.setHeader("X-RateLimit-Remaining", String(remaining));
    event.node?.res?.setHeader("X-RateLimit-Reset", String(Math.ceil(resetMs / 1000)));

    const id = getRouterParam(event, "id") ?? "";
    const match = /^gen_(\d+)$/.exec(id);
    if (!match) {
      setResponseStatus(event, 400);
      return { error: "Generation ID must use the gen_<id> format" };
    }
    const executionId = Number(match[1]);

    const execRows = (await sql`
      SELECT
        rne.id,
        rne.status,
        rne.kie_task_id,
        rne.cost_usd,
        a.storage_url,
        a.preview_url
      FROM run_node_executions rne
      JOIN runs r ON r.id = rne.run_id
      LEFT JOIN assets a ON a.id = rne.output_asset_id
      WHERE rne.id = ${executionId} AND r.user_id = ${userId}
      LIMIT 1
    `) as {
      id: number;
      status: string;
      kie_task_id: string | null;
      cost_usd: number;
      storage_url: string | null;
      preview_url: string | null;
    }[];
    if (execRows.length === 0) {
      setResponseStatus(event, 404);
      return { error: "Generation not found" };
    }

    const exec = execRows[0];
    const status =
      exec.status === "succeeded"
        ? "completed"
        : exec.status === "failed"
          ? "failed"
          : "processing";
    return {
      id: `gen_${exec.id}`,
      object: "generation",
      status,
      url: exec.storage_url || exec.preview_url || null,
      cost: exec.cost_usd ? { amount: Number(exec.cost_usd), currency: "USD" } : null,
    };
  } catch (err) {
    console.error("[api/v1/generations]", err);
    setResponseStatus(event, 500);
    return { error: "Internal server error" };
  }
});
