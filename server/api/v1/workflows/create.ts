/**
 * POST /v1/workflows — Create a new workflow.
 *
 * Authentication: Bearer API key (cx_...) in Authorization header
 *
 * Request body:
 *   name: string (required) — workflow name
 *   steps: Array of { model: string, prompt: string, resolution?: string }
 *
 * Response:
 *   id: string — workflow ID
 *   object: "workflow"
 *   name: string
 *   steps: number
 *   created_at: string
 */

import { defineEventHandler, getHeader, readBody, setResponseStatus } from "h3";
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

    // 2. Parse request body
    const body = await readBody(event);
    const { name, steps } = body;

    if (!name || typeof name !== "string") {
      setResponseStatus(event, 400);
      return { error: "name is required" };
    }

    if (!Array.isArray(steps) || steps.length === 0) {
      setResponseStatus(event, 400);
      return { error: "steps must be a non-empty array" };
    }

    // Validate each step
    for (const step of steps) {
      if (!step.model || typeof step.model !== "string") {
        setResponseStatus(event, 400);
        return { error: "Each step must have a model" };
      }
      if (!step.prompt || typeof step.prompt !== "string") {
        setResponseStatus(event, 400);
        return { error: "Each step must have a prompt" };
      }
    }

    // 3. Create workflow
    const workflowRows = (await sql`
      INSERT INTO workflows (user_id, name)
      VALUES (${userId}, ${name})
      RETURNING id, created_at
    `) as { id: number; created_at: string }[];

    const workflowId = workflowRows[0].id;

    // 4. Create workflow nodes for each step
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      await sql`
        INSERT INTO workflow_nodes (workflow_id, model_slug, prompt, position_x, position_y)
        VALUES (${workflowId}, ${step.model}, ${step.prompt}, ${i * 200}, 0)
      `;
    }

    // 5. Return response
    return {
      id: `wf_${workflowId}`,
      object: "workflow",
      name,
      steps: steps.length,
      created_at: new Date(workflowRows[0].created_at).toISOString(),
    };
  } catch (err) {
    console.error("[api/v1/workflows/create]", err);
    setResponseStatus(event, 500);
    return { error: "Internal server error" };
  }
});
