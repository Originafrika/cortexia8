/**
 * GET /v1/history — Returns paginated generation history.
 *
 * Authentication: Bearer API key (cx_...) in Authorization header.
 */

import { defineEventHandler, getHeader, getQuery, setResponseStatus } from "h3";
import { sql } from "@/lib/db";
import { sha256Hex } from "../../../../src/lib/utils/crypto";

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

    const query = getQuery(event);
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const offset = Math.max(Number(query.offset) || 0, 0);
    const countRows = (await sql`
      SELECT COUNT(*)::int AS count
      FROM run_node_executions rne
      JOIN runs r ON r.id = rne.run_id
      WHERE r.user_id = ${userId}
    `) as { count: number }[];
    const total = countRows[0]?.count ?? 0;

    const rows = (await sql`
      SELECT
        rne.id,
        rne.status,
        rne.cost_usd,
        rne.started_at,
        COALESCE(rne.input_params->>'prompt', rne.input_params->>'text', '') AS prompt,
        m.slug AS model_slug,
        a.storage_url,
        a.preview_url
      FROM run_node_executions rne
      JOIN runs r ON r.id = rne.run_id
      LEFT JOIN workflow_nodes wn ON wn.id = rne.workflow_node_id
      LEFT JOIN models m ON m.slug = wn.model_slug
      LEFT JOIN assets a ON a.id = rne.output_asset_id
      WHERE r.user_id = ${userId}
      ORDER BY rne.started_at DESC NULLS LAST, rne.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as {
      id: number;
      status: string;
      cost_usd: number | null;
      started_at: string | null;
      prompt: string | null;
      model_slug: string | null;
      storage_url: string | null;
      preview_url: string | null;
    }[];

    const data = rows.map((r) => ({
      id: `gen_${r.id}`,
      object: "generation",
      status:
        r.status === "succeeded" ? "completed" : r.status === "failed" ? "failed" : "processing",
      model: r.model_slug ?? "unknown",
      prompt: r.prompt ?? "",
      url: r.storage_url || r.preview_url || null,
      cost: r.cost_usd ? { amount: Number(r.cost_usd), currency: "USD" } : null,
      created_at: r.started_at ? new Date(r.started_at).toISOString() : new Date(0).toISOString(),
    }));

    return { data, has_more: offset + limit < total, total };
  } catch (err) {
    console.error("[api/v1/history]", err);
    setResponseStatus(event, 500);
    return { error: "Internal server error" };
  }
});
