/**
 * POST /api/agent/apply — apply agent-proposed operations to the DB.
 *
 * Accepts a workflow ID and a sequence of graph operations (ADD_NODE,
 * CONNECT_NODES, UPDATE_NODE, REMOVE_NODE) produced by the agent.
 * Each operation is applied in order inside a single Postgres transaction
 * so partial failures roll back cleanly.
 *
 * A temporary-ID map tracks nodes created in this batch so that
 * subsequent CONNECT / UPDATE / REMOVE ops can reference them by the
 * agent's temp ref (e.g. "op_index_0").
 *
 * If `launch` is true, the workflow is executed after all operations
 * are applied.
 */

import { createServerFn } from "@tanstack/react-start";
import { withTransaction, sql, type PoolClient } from "@/lib/db";
import { getRequestContext, HttpError, requireUserId, toJsonResponse } from "./auth";
import { runCanvas } from "./canvas-run";
import { getWorkflow, type GetWorkflowResponse } from "./workflows";
import { MODELS } from "@/lib/models";

// ── Cost Confirmation Threshold ────────────────────────────────────────────
// Configurable: operations with estimated cost above this require user confirmation (USD)
export const COST_CONFIRM_THRESHOLD = 2.00;

// ── Types ─────────────────────────────────────────────────────────────────

export type AgentOp =
  | { op: "ADD_NODE"; modelSlug: string; position?: { x: number; y: number }; config?: Record<string, unknown> }
  | { op: "CONNECT_NODES"; source: string; target: string; sourceOutputKey?: string; targetInputKey?: string }
  | { op: "UPDATE_NODE"; nodeId: string; params: Record<string, unknown> }
  | { op: "REMOVE_NODE"; nodeId: string };

export type AgentApplyInput = {
  workflowId: number;
  operations: AgentOp[];
  launch?: boolean;
  dryRun?: boolean;
};

export type AgentApplyResponse = {
  graph: GetWorkflowResponse;
  applied: number;
  runId?: number;
  requiresConfirmation: boolean;
  estimatedTotalCostUsd: number;
};

// ── Server function ───────────────────────────────────────────────────────

export const applyAgentPlan = createServerFn({ method: "POST" })
  .validator((data: AgentApplyInput): AgentApplyInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid body");
    if (!Number.isInteger(data.workflowId)) {
      throw new HttpError(400, "workflowId is required");
    }
    if (!Array.isArray(data.operations) || data.operations.length === 0) {
      throw new HttpError(400, "operations must be a non-empty array");
    }
    return data;
  })
  .handler(async ({ data }) => {
    try {
      return await applyPlanImpl(data) as AgentApplyResponse;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });

// ── Cost Calculation ───────────────────────────────────────────────────────

function estimateOperationsCost(operations: AgentOp[]): number {
  let totalCost = 0;
  for (const op of operations) {
    if (op.op === "ADD_NODE") {
      const model = MODELS.find((m) => m.slug === op.modelSlug);
      if (model) {
        const price = model.priceUSD ?? model.tiers?.[0]?.priceUSD ?? 0;
        totalCost += price;
      }
    }
  }
  return totalCost;
}

// ── Implementation ────────────────────────────────────────────────────────

async function applyPlanImpl(input: AgentApplyInput): Promise<AgentApplyResponse> {
  const ctx = await getRequestContext(new Headers());
  const userId = await requireUserId(ctx);

  // 1. Verify workflow ownership
  const wfRows = (await sql`
    SELECT id, user_id FROM workflows WHERE id = ${input.workflowId} LIMIT 1
  `) as { id: number; user_id: number | null }[];
  if (wfRows.length === 0) throw new HttpError(404, "Workflow not found");
  if (wfRows[0].user_id != null && wfRows[0].user_id !== userId) {
    throw new HttpError(403, "Workflow belongs to a different user");
  }

  // 2. Estimate cost and check confirmation threshold
  const estimatedTotalCostUsd = estimateOperationsCost(input.operations);
  const requiresConfirmation = estimatedTotalCostUsd > COST_CONFIRM_THRESHOLD;

  // 2b. Dry-run: return threshold info without applying operations
  if (input.dryRun) {
    const graph = await getWorkflow({ data: { workflowId: input.workflowId } });
    return { graph, applied: 0, requiresConfirmation, estimatedTotalCostUsd };
  }

  // 3. Apply operations inside a transaction
  const idMap = new Map<string, number>(); // temp ref → real DB node ID
  let applied = 0;

  await withTransaction(async (client: PoolClient) => {
    for (let i = 0; i < input.operations.length; i++) {
      const op = input.operations[i];
      await applyOneOp(client, input.workflowId, op, i, idMap);
      applied++;
    }
  });

  // 4. Optionally launch execution
  let runId: number | undefined;
  if (input.launch) {
    const run = await runCanvas({
      data: { workflowId: input.workflowId, userId },
    });
    runId = run.runId;
  }

  // 5. Return the refreshed graph
  const graph = await getWorkflow({ data: { workflowId: input.workflowId } });

  return { graph, applied, runId, requiresConfirmation, estimatedTotalCostUsd };
}

// ── Single-op dispatcher ──────────────────────────────────────────────────

async function applyOneOp(
  client: PoolClient,
  workflowId: number,
  op: AgentOp,
  opIndex: number,
  idMap: Map<string, number>,
) {
  switch (op.op) {
    case "ADD_NODE": {
      const pos = op.position ?? { x: 120 + Math.random() * 80, y: 120 + Math.random() * 80 };
      const res = await client.query<{ id: number }>(
        `INSERT INTO workflow_nodes
           (workflow_id, type, model_slug, config, canvas_x, canvas_y)
         VALUES ($1, 'model', $2, $3::jsonb, $4, $5)
         RETURNING id`,
        [
          workflowId,
          op.modelSlug,
          JSON.stringify(op.config ?? {}),
          String(pos.x),
          String(pos.y),
        ],
      );
      const dbId = res.rows[0].id;
      // Store mapping keyed by agent's temp ref convention
      idMap.set(`op_index_${opIndex}`, dbId);
      // Also map by modelSlug so that CONNECT_NODES can find nodes by slug
      // when there's only one node with that slug.
      if (!idMap.has(op.modelSlug)) {
        idMap.set(op.modelSlug, dbId);
      }
      break;
    }

    case "CONNECT_NODES": {
      const sourceId = resolveRef(client, op.source, idMap, workflowId);
      const targetId = resolveRef(client, op.target, idMap, workflowId);
      if (sourceId == null || targetId == null) {
        throw new HttpError(400, `Cannot resolve node refs: source=${op.source}, target=${op.target}`);
      }
      await client.query(
        `INSERT INTO workflow_edges
           (workflow_id, source_node_id, target_node_id, source_output_key, target_input_key)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          workflowId,
          sourceId,
          targetId,
          op.sourceOutputKey ?? "out",
          op.targetInputKey ?? "in",
        ],
      );
      break;
    }

    case "UPDATE_NODE": {
      const nodeId = resolveRef(client, op.nodeId, idMap, workflowId);
      if (nodeId == null) {
        throw new HttpError(400, `Cannot resolve node ref: ${op.nodeId}`);
      }
      const params = op.params;
      const sets: string[] = [];
      const vals: unknown[] = [];
      let pi = 2;
      if (params.config !== undefined) {
        sets.push(`config = $${pi++}::jsonb`);
        vals.push(JSON.stringify(params.config));
      }
      if (params.status !== undefined) {
        sets.push(`status = $${pi++}`);
        vals.push(params.status);
      }
      if (params.x !== undefined) {
        sets.push(`canvas_x = $${pi++}`);
        vals.push(String(params.x));
      }
      if (params.y !== undefined) {
        sets.push(`canvas_y = $${pi++}`);
        vals.push(String(params.y));
      }
      if (sets.length > 0) {
        await client.query(
          `UPDATE workflow_nodes SET ${sets.join(", ")} WHERE id = $1 AND workflow_id = $2`,
          [nodeId, workflowId, ...vals],
        );
      }
      break;
    }

    case "REMOVE_NODE": {
      const nodeId = resolveRef(client, op.nodeId, idMap, workflowId);
      if (nodeId == null) {
        throw new HttpError(400, `Cannot resolve node ref: ${op.nodeId}`);
      }
      // Edges cascade via FK or we delete explicitly
      await client.query(
        `DELETE FROM workflow_edges WHERE (source_node_id = $1 OR target_node_id = $1) AND workflow_id = $2`,
        [nodeId, workflowId],
      );
      await client.query(
        `DELETE FROM workflow_nodes WHERE id = $1 AND workflow_id = $2`,
        [nodeId, workflowId],
      );
      break;
    }
  }
}

/**
 * Resolve a node reference to a real DB node ID.
 *
 * Resolution order:
 *  1. Exact match in the batch idMap (temp refs from ADD_NODE)
 *  2. If the ref looks like a numeric string, treat it as a DB node ID
 *  3. Look up by model_slug in the existing workflow nodes
 */
function resolveRef(
  _client: PoolClient,
  ref: string,
  idMap: Map<string, number>,
  workflowId: number,
): number | null {
  // 1. Batch mapping
  const mapped = idMap.get(ref);
  if (mapped != null) return mapped;

  // 2. Direct numeric DB id
  const num = Number(ref);
  if (Number.isInteger(num) && num > 0) return num;

  // 3. Fallback: not resolvable
  return null;
}
