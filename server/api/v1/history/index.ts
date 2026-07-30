/**
 * GET /v1/history — Returns paginated generation history.
 *
 * Authentication: Bearer API key (cx_...) in Authorization header
 *
 * Query params:
 *   limit: number (optional, default 20, max 100)
 *   offset: number (optional, default 0)
 *
 * Response:
 *   data: Array of generations
 *   has_more: boolean
 *   total: number
 */

import { defineEventHandler, getHeader, getQuery, setResponseStatus } from "h3";
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

    const userId = keyRows[0].user_id;

    // 2. Parse query params
    const query = getQuery(event);
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const offset = Math.max(Number(query.offset) || 0, 0);

    // 3. Get total count
    const countRows = (await sql`
      SELECT COUNT(*)::int as count
      FROM run_node_executions rne
      JOIN runs r ON r.id = rne.run_id
      WHERE r.user_id = ${userId}
    `) as { count: number }[];
    const total = countRows[0]?.count ?? 0;

    // 4. Get generations
    const rows = (await sql`
      SELECT
        rne.id,
        rne.status,
        rne.cost_usd,
        rne.created_at,
        rne.prompt_snapshot,
        m.slug as model_slug,
        a.storage_url,
        a.preview_url
      FROM run_node_executions rne
      JOIN runs r ON r.id = rne.run_id
      LEFT JOIN workflow_nodes wn ON wn.id = rne.workflow_node_id
      LEFT JOIN models m ON m.slug = wn.model_slug
      LEFT JOIN assets a ON a.id = rne.output_asset_id
      WHERE r.user_id = ${userId}
      ORDER BY rne.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as {
      id: number;
      status: string;
      cost_usd: number | null;
      created_at: string;
      prompt_snapshot: string | null;
      model_slug: string | null;
      storage_url: string | null;
      preview_url: string | null;
    }[];

    // 5. Map to API response format
    const data = rows.map((r) => ({
      id: `gen_${r.id}`,
      object: "generation",
      status: r.status === "succeeded" ? "completed" : r.status,
      model: r.model_slug ?? "unknown",
      prompt: r.prompt_snapshot ?? "",
      url: r.storage_url || r.preview_url || null,
      cost: r.cost_usd ? { amount: Number(r.cost_usd), currency: "USD" } : null,
      created_at: new Date(r.created_at).toISOString(),
    }));

    // 6. Return response
    return {
      data,
      has_more: offset + limit < total,
      total,
    };
  } catch (err) {
    console.error("[api/v1/history]", err);
    setResponseStatus(event, 500);
    return { error: "Internal server error" };
  }
});
