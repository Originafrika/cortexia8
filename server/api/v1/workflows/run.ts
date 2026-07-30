/**
 * POST /v1/workflows/run — Run a workflow.
 *
 * Authentication: Bearer API key (cx_...) in Authorization header
 *
 * Request body:
 *   workflow_id: string (required) — workflow ID (e.g., "wf_123")
 *   inputs: Record<string, string> (optional) — template variables
 *
 * Response:
 *   id: string — run ID
 *   object: "workflow_run"
 *   workflow_id: string
 *   status: "running"
 *   created_at: string
 */

import { defineEventHandler, getHeader, readBody, setResponseStatus } from "h3";
import { sql } from "@/lib/db";
import { sha256Hex } from "../../../src/lib/utils/crypto";
import { createTask } from "@/lib/kie-api/client";

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
    const { workflow_id, inputs } = body;

    if (!workflow_id || typeof workflow_id !== "string") {
      setResponseStatus(event, 400);
      return { error: "workflow_id is required" };
    }

    const numericId = parseInt(workflow_id.replace("wf_", ""));
    if (isNaN(numericId)) {
      setResponseStatus(event, 400);
      return { error: "Invalid workflow_id format" };
    }

    // 3. Check if workflow exists and belongs to user
    const workflowRows = (await sql`
      SELECT id, name FROM workflows
      WHERE id = ${numericId} AND user_id = ${userId}
      LIMIT 1
    `) as { id: number; name: string }[];

    if (workflowRows.length === 0) {
      setResponseStatus(event, 404);
      return { error: "Workflow not found" };
    }

    // 4. Get workflow nodes
    const nodeRows = (await sql`
      SELECT id, model_slug, prompt
      FROM workflow_nodes
      WHERE workflow_id = ${numericId}
      ORDER BY position_x ASC
    `) as { id: number; model_slug: string; prompt: string }[];

    if (nodeRows.length === 0) {
      setResponseStatus(event, 400);
      return { error: "Workflow has no steps" };
    }

    // 5. Check credits (estimate cost for all steps)
    const modelSlugs = nodeRows.map((n) => n.model_slug);
    const modelRows = (await sql`
      SELECT slug, cortexia_price_usd FROM models
      WHERE slug = ANY(${modelSlugs}) AND status = 'active'
    `) as { slug: string; cortexia_price_usd: number }[];

    const modelCosts = new Map(modelRows.map((m) => [m.slug, Number(m.cortexia_price_usd)]));
    const totalCost = nodeRows.reduce((sum, n) => sum + (modelCosts.get(n.model_slug) ?? 0), 0);

    const balanceRows = (await sql`
      SELECT credits_balance FROM users WHERE id = ${userId} LIMIT 1
    `) as { credits_balance: number }[];

    const balance = Number(balanceRows[0]?.credits_balance ?? 0);

    if (balance < totalCost) {
      setResponseStatus(event, 402);
      return { error: "Insufficient credits", balance, required: totalCost };
    }

    // 6. Create run
    const runRows = (await sql`
      INSERT INTO runs (user_id, workflow_id, status)
      VALUES (${userId}, ${numericId}, 'running')
      RETURNING id, created_at
    `) as { id: number; created_at: string }[];

    const runId = runRows[0].id;

    // 7. Create tasks for each node (simplified — in production you'd queue these)
    for (const node of nodeRows) {
      let prompt = node.prompt;
      // Replace template variables
      if (inputs && typeof inputs === "object") {
        for (const [key, value] of Object.entries(inputs)) {
          prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value));
        }
      }

      await sql`
        INSERT INTO run_node_executions (run_id, workflow_node_id, status, prompt_snapshot)
        VALUES (${runId}, ${node.id}, 'pending', ${prompt})
      `;
    }

    // 8. Return response
    return {
      id: `run_${runId}`,
      object: "workflow_run",
      workflow_id: workflow_id,
      status: "running",
      created_at: new Date(runRows[0].created_at).toISOString(),
    };
  } catch (err) {
    console.error("[api/v1/workflows/run]", err);
    setResponseStatus(event, 500);
    return { error: "Internal server error" };
  }
});
