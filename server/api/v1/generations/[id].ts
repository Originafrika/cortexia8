/**
 * GET /v1/generations/:id — Check generation status and retrieve result.
 *
 * Authentication: Bearer API key (cx_...) in Authorization header
 *
 * Response:
 *   id: string — generation ID
 *   object: "generation"
 *   status: "processing" | "completed" | "failed"
 *   model: string — model slug
 *   url: string (if completed) — result URL
 *   cost: { amount: number, currency: string } (if completed)
 */

import { defineEventHandler, getHeader, getRouterParam, setResponseStatus } from "h3";
import { sql } from "@/lib/db";
import { sha256Hex } from "../../../src/lib/utils/crypto";

export default defineEventHandler(async (event) => {
  try {
    // 1. Authenticate via Bearer API key
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

    // 2. Get generation ID from URL
    const id = getRouterParam(event, "id");
    if (!id) {
      setResponseStatus(event, 400);
      return { error: "Generation ID is required" };
    }

    // 3. Query run_node_executions
    const execRows = (await sql`
      SELECT
        rne.id,
        rne.status,
        rne.kie_task_id,
        rne.cost_usd,
        a.storage_url,
        a.preview_url
      FROM run_node_executions rne
      LEFT JOIN assets a ON a.id = rne.output_asset_id
      WHERE rne.id = ${parseInt(id.replace("gen_", ""))}
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

    // 4. Return response
    return {
      id: `gen_${exec.id}`,
      object: "generation",
      status: exec.status === "succeeded" ? "completed" : exec.status,
      url: exec.storage_url || exec.preview_url || null,
      cost: exec.cost_usd ? { amount: exec.cost_usd, currency: "USD" } : null,
    };
  } catch (err) {
    console.error("[api/v1/generations]", err);
    setResponseStatus(event, 500);
    return { error: "Internal server error" };
  }
});
