/**
 * POST /api/canvas/graph-ops — generic CRUD for workflow nodes + edges.
 *
 * Accepts a sequence of operations so the client can batch canvas
 * changes into a single round-trip. All ops run in a single Postgres
 * transaction so a partial failure rolls back cleanly.
 *
 * Op shapes (see CanvasOp union):
 *   - createNode { workflowId, modelSlug, x, y, width, height, config? }
 *   - updateNode { nodeId, patch }                  patch is partial of (config, x, y, width, height)
 *   - deleteNode { nodeId }                        cascades to edges
 *   - createEdge { workflowId, sourceNodeId, sourceOutputKey?, targetNodeId, targetInputKey? }
 *   - deleteEdge { edgeId }
 *
 * No model-specific logic here — modelSlug is just a string FK to
 * models.slug. Adding a 151st model needs zero changes to this file.
 */

import { createServerFn } from "@tanstack/react-start";
import { withTransaction } from "@/lib/db";
import type { PoolClient } from "@/lib/db";
import { HttpError, toJsonResponse } from "./auth";

type CreateNodeOp = {
  op: "createNode";
  workflowId: number;
  modelSlug: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  config?: Record<string, unknown>;
};

type UpdateNodeOp = {
  op: "updateNode";
  nodeId: number;
  patch: {
    modelSlug?: string;
    config?: Record<string, unknown>;
    status?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
};

type DeleteNodeOp = { op: "deleteNode"; nodeId: number };

type CreateEdgeOp = {
  op: "createEdge";
  workflowId: number;
  sourceNodeId: number;
  targetNodeId: number;
  sourceOutputKey?: string;
  targetInputKey?: string;
};

type DeleteEdgeOp = { op: "deleteEdge"; edgeId: number };

export type CanvasOp = CreateNodeOp | UpdateNodeOp | DeleteNodeOp | CreateEdgeOp | DeleteEdgeOp;

type GraphOpsInput = {
  userId: number;
  ops: CanvasOp[];
};

type SerializableResult = {
  nodeId?: number;
  edgeId?: number;
  updated?: number;
  deleted?: boolean;
};

type OpResult =
  | { opIndex: number; status: "ok"; result?: SerializableResult }
  | { opIndex: number; status: "error"; error: string };

export type GraphOpsResponse = {
  applied: number;
  results: OpResult[];
};

export const graphOps = createServerFn({ method: "POST" })
  .validator((data: GraphOpsInput): GraphOpsInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid body");
    if (!Number.isInteger(data.userId)) {
      throw new HttpError(400, "userId is required");
    }
    if (!Array.isArray(data.ops)) {
      throw new HttpError(400, "ops must be an array");
    }
    return data;
  })
  .handler(async ({ data }) => {
    try {
      return await applyOps(data);
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });

// Shape of the Pool client we get from `pool.connect()`. Only the
// `query` method is used; the type is re-exported from @/lib/db.
type _PoolClientRef = PoolClient;

async function applyOps(input: GraphOpsInput): Promise<GraphOpsResponse> {
  const results: OpResult[] = [];
  await withTransaction(async (client: PoolClient) => {
    for (let i = 0; i < input.ops.length; i++) {
      const op = input.ops[i];
      try {
        const result = await dispatch(client, input.userId, op);
        results.push({ opIndex: i, status: "ok", result });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({ opIndex: i, status: "error", error: message });
        // Bubble up so the transaction rolls back.
        throw new HttpError(400, `op ${i} failed: ${message}`);
      }
    }
  });
  return {
    applied: results.filter((r) => r.status === "ok").length,
    results,
  };
}

async function dispatch(
  client: PoolClient,
  userId: number,
  op: CanvasOp,
): Promise<SerializableResult> {
  await assertWorkflowOwnedBy(client, op, userId);
  switch (op.op) {
    case "createNode": {
      const res = await client.query<{ id: number }>(
        `INSERT INTO workflow_nodes
          (workflow_id, type, model_slug, config, canvas_x, canvas_y, canvas_width, canvas_height)
        VALUES ($1, 'model', $2, $3::jsonb, $4, $5, $6, $7)
        RETURNING id`,
        [
          op.workflowId,
          op.modelSlug,
          JSON.stringify(op.config ?? {}),
          String(op.x ?? 0),
          String(op.y ?? 0),
          String(op.width ?? 220),
          String(op.height ?? 120),
        ],
      );
      return { nodeId: res.rows[0].id };
    }
    case "updateNode": {
      const p = op.patch;
      const sets: string[] = [];
      const params: unknown[] = [];
      let i = 2; // $1 is the node id
      if (p.modelSlug !== undefined) {
        sets.push(`model_slug = $${i++}`);
        params.push(p.modelSlug);
      }
      if (p.config !== undefined) {
        sets.push(`config = $${i++}::jsonb`);
        params.push(JSON.stringify(p.config));
      }
      if (p.status !== undefined) {
        sets.push(`status = $${i++}`);
        params.push(p.status);
      }
      if (p.x !== undefined) {
        sets.push(`canvas_x = $${i++}`);
        params.push(String(p.x));
      }
      if (p.y !== undefined) {
        sets.push(`canvas_y = $${i++}`);
        params.push(String(p.y));
      }
      if (p.width !== undefined) {
        sets.push(`canvas_width = $${i++}`);
        params.push(String(p.width));
      }
      if (p.height !== undefined) {
        sets.push(`canvas_height = $${i++}`);
        params.push(String(p.height));
      }
      if (sets.length === 0) return { nodeId: op.nodeId, updated: 0 };
      const text = `UPDATE workflow_nodes SET ${sets.join(", ")} WHERE id = $1`;
      // Column names are hard-coded above — only the values are bound
      // through placeholders, so no SQL injection is possible.
      await client.query(text, [op.nodeId, ...params]);
      return { nodeId: op.nodeId, updated: 1 };
    }
    case "deleteNode": {
      await client.query(`DELETE FROM workflow_nodes WHERE id = $1`, [op.nodeId]);
      return { nodeId: op.nodeId, deleted: true };
    }
    case "createEdge": {
      const res = await client.query<{ id: number }>(
        `INSERT INTO workflow_edges
          (workflow_id, source_node_id, target_node_id, source_output_key, target_input_key)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
        [
          op.workflowId,
          op.sourceNodeId,
          op.targetNodeId,
          op.sourceOutputKey ?? "out",
          op.targetInputKey ?? "in",
        ],
      );
      return { edgeId: res.rows[0].id };
    }
    case "deleteEdge": {
      await client.query(`DELETE FROM workflow_edges WHERE id = $1`, [op.edgeId]);
      return { edgeId: op.edgeId, deleted: true };
    }
  }
}

/** Make sure the workflow referenced by an op belongs to the calling user. */
async function assertWorkflowOwnedBy(client: PoolClient, op: CanvasOp, userId: number) {
  let workflowId: number | null = null;
  if (op.op === "createNode" || op.op === "createEdge") {
    workflowId = op.workflowId;
  } else if (op.op === "updateNode" || op.op === "deleteNode") {
    const res = await client.query<{ workflow_id: number }>(
      `SELECT workflow_id FROM workflow_nodes WHERE id = $1 LIMIT 1`,
      [op.nodeId],
    );
    workflowId = res.rows[0]?.workflow_id ?? null;
  } else if (op.op === "deleteEdge") {
    const res = await client.query<{ workflow_id: number }>(
      `SELECT workflow_id FROM workflow_edges WHERE id = $1 LIMIT 1`,
      [op.edgeId],
    );
    workflowId = res.rows[0]?.workflow_id ?? null;
  }
  if (workflowId == null) {
    throw new HttpError(404, "Workflow not found for op");
  }
  const owner = await client.query<{ user_id: number | null }>(
    `SELECT user_id FROM workflows WHERE id = $1 LIMIT 1`,
    [workflowId],
  );
  if (owner.rows.length === 0) {
    throw new HttpError(404, "Workflow not found");
  }
  if (owner.rows[0].user_id != null && owner.rows[0].user_id !== userId) {
    throw new HttpError(403, "Workflow belongs to a different user");
  }
}
