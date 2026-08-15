/**
 * GET /v1/workflows — Returns all workflow definitions.
 *
 * Authentication: Bearer API key (cx_...) in Authorization header
 *
 * Response:
 *   data: Array of workflows
 *   has_more: boolean
 */

import { defineEventHandler, getHeader, setResponseStatus } from "h3";
import { sql } from "@/lib/db";
import { sha256Hex } from "../../../../src/lib/utils/crypto";

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

    // 2. Get workflows with node count
    const rows = (await sql`
      SELECT
        w.id,
        w.name,
        w.created_at,
        COUNT(wn.id)::int as node_count
      FROM workflows w
      LEFT JOIN workflow_nodes wn ON wn.workflow_id = w.id
      WHERE w.user_id = ${userId}
      GROUP BY w.id, w.name, w.created_at
      ORDER BY w.created_at DESC
    `) as {
      id: number;
      name: string;
      created_at: string;
      node_count: number;
    }[];

    // 3. Map to API response format
    const data = rows.map((r) => ({
      id: `wf_${r.id}`,
      object: "workflow",
      name: r.name,
      steps: r.node_count,
      created_at: new Date(r.created_at).toISOString(),
    }));

    // 4. Return response
    return {
      data,
      has_more: false,
    };
  } catch (err) {
    console.error("[api/v1/workflows]", err);
    setResponseStatus(event, 500);
    return { error: "Internal server error" };
  }
});
