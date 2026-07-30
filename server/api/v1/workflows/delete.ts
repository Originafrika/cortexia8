/**
 * DELETE /v1/workflows/:id — Delete a workflow.
 *
 * Authentication: Bearer API key (cx_...) in Authorization header
 *
 * Response:
 *   id: string — workflow ID
 *   object: "workflow"
 *   deleted: true
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

    const userId = keyRows[0].user_id;

    // 2. Get workflow ID from URL
    const id = getRouterParam(event, "id");
    if (!id) {
      setResponseStatus(event, 400);
      return { error: "Workflow ID is required" };
    }

    const numericId = parseInt(id.replace("wf_", ""));
    if (isNaN(numericId)) {
      setResponseStatus(event, 400);
      return { error: "Invalid workflow ID format" };
    }

    // 3. Check if workflow exists and belongs to user
    const existing = (await sql`
      SELECT id FROM workflows
      WHERE id = ${numericId} AND user_id = ${userId}
      LIMIT 1
    `) as { id: number }[];

    if (existing.length === 0) {
      setResponseStatus(event, 404);
      return { error: "Workflow not found" };
    }

    // 4. Delete workflow (cascade will delete nodes, edges, runs)
    await sql`DELETE FROM workflows WHERE id = ${numericId}`;

    // 5. Return response
    return {
      id: `wf_${numericId}`,
      object: "workflow",
      deleted: true,
    };
  } catch (err) {
    console.error("[api/v1/workflows/delete]", err);
    setResponseStatus(event, 500);
    return { error: "Internal server error" };
  }
});
