/**
 * CRUD server functions for workflows.
 *
 *   - createWorkflow  — POST  — create a new workflow for the current user
 *   - listWorkflows    — GET   — list workflows with last-run info
 *   - getWorkflow      — GET   — full workflow graph (nodes + edges)
 *   - deleteWorkflow   — POST  — cascade-delete workflow and all children
 */

import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/lib/db";
import { getRequestContext, HttpError, requireUserId, toJsonResponse } from "./auth";

// ---------------------------------------------------------------------------
// createWorkflow
// ---------------------------------------------------------------------------

export type CreateWorkflowInput = {
  name?: string;
};

export type CreateWorkflowResponse = {
  id: number;
};

export const createWorkflow = createServerFn({ method: "POST" })
  .validator((data: CreateWorkflowInput): CreateWorkflowInput => {
    return data ?? {};
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(new Headers());
      const userId = await requireUserId(ctx);

      const name = data.name?.trim() || "Workflow sans titre";

      const rows = (await sql`
        INSERT INTO workflows (user_id, name, status)
        VALUES (${userId}, ${name}, 'idle')
        RETURNING id
      `) as { id: number }[];

      return { id: rows[0].id } satisfies CreateWorkflowResponse;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });

// ---------------------------------------------------------------------------
// listWorkflows
// ---------------------------------------------------------------------------

export type WorkflowListItem = {
  id: number;
  name: string;
  status: string;
  lastRunAt: string | null;
  lastRunStatus: string | null;
};

export type ListWorkflowsResponse = WorkflowListItem[];

export const listWorkflows = createServerFn({ method: "GET" })
  .validator((_data: void) => _data)
  .handler(async () => {
    try {
      const ctx = await getRequestContext(new Headers());
      const userId = await requireUserId(ctx);

      const rows = (await sql`
        SELECT
          w.id,
          w.name,
          w.status,
          r.started_at  AS last_run_at,
          r.status      AS last_run_status
        FROM workflows w
        LEFT JOIN LATERAL (
          SELECT status, started_at
          FROM runs
          WHERE workflow_id = w.id
          ORDER BY started_at DESC NULLS LAST
          LIMIT 1
        ) r ON TRUE
        WHERE w.user_id = ${userId}
        ORDER BY COALESCE(r.started_at, w.created_at) DESC
      `) as {
        id: number;
        name: string;
        status: string;
        last_run_at: string | null;
        last_run_status: string | null;
      }[];

      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        status: r.status,
        lastRunAt: r.last_run_at,
        lastRunStatus: r.last_run_status,
      })) satisfies WorkflowListItem[];
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });

// ---------------------------------------------------------------------------
// getWorkflow
// ---------------------------------------------------------------------------

export type WorkflowNode = {
  id: number;
  type: string;
  modelSlug: string;
  config: Record<string, unknown>;
  x: number;
  y: number;
  width: number;
  height: number;
  status: string | null;
};

export type WorkflowEdge = {
  id: number;
  sourceNodeId: number;
  targetNodeId: number;
  sourceOutputKey: string;
  targetInputKey: string;
};

export type GetWorkflowResponse = {
  id: number;
  name: string;
  status: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type GetWorkflowInput = {
  workflowId: number;
};

export const getWorkflow = createServerFn({ method: "GET" })
  .validator((data: GetWorkflowInput): GetWorkflowInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid input");
    if (!Number.isInteger(data.workflowId)) throw new HttpError(400, "workflowId is required");
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(new Headers());
      const userId = await requireUserId(ctx);

      // Fetch workflow
      const wRows = (await sql`
        SELECT id, name, status
        FROM workflows
        WHERE id = ${data.workflowId} AND user_id = ${userId}
        LIMIT 1
      `) as { id: number; name: string; status: string }[];

      if (wRows.length === 0) {
        throw new HttpError(404, "Workflow not found");
      }

      const wf = wRows[0];

      // Fetch nodes
      const nRows = (await sql`
        SELECT
          id, type, model_slug AS "modelSlug",
          config, canvas_x AS "x", canvas_y AS "y",
          canvas_width AS "width", canvas_height AS "height",
          status
        FROM workflow_nodes
        WHERE workflow_id = ${data.workflowId}
        ORDER BY id
      `) as {
        id: number;
        type: string;
        modelSlug: string;
        config: Record<string, unknown>;
        x: number;
        y: number;
        width: number;
        height: number;
        status: string | null;
      }[];

      // Fetch edges
      const eRows = (await sql`
        SELECT
          id,
          source_node_id AS "sourceNodeId",
          target_node_id AS "targetNodeId",
          source_output_key AS "sourceOutputKey",
          target_input_key AS "targetInputKey"
        FROM workflow_edges
        WHERE workflow_id = ${data.workflowId}
        ORDER BY id
      `) as {
        id: number;
        sourceNodeId: number;
        targetNodeId: number;
        sourceOutputKey: string;
        targetInputKey: string;
      }[];

      return {
        id: wf.id,
        name: wf.name,
        status: wf.status,
        nodes: nRows.map((n) => ({
          ...n,
          config: typeof n.config === "string" ? JSON.parse(n.config) : n.config,
        })),
        edges: eRows,
      } satisfies GetWorkflowResponse;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });

// ---------------------------------------------------------------------------
// deleteWorkflow
// ---------------------------------------------------------------------------

export type DeleteWorkflowInput = {
  workflowId: number;
};

export type DeleteWorkflowResponse = {
  deleted: boolean;
};

export const deleteWorkflow = createServerFn({ method: "POST" })
  .validator((data: DeleteWorkflowInput): DeleteWorkflowInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid input");
    if (!Number.isInteger(data.workflowId)) throw new HttpError(400, "workflowId is required");
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(new Headers());
      const userId = await requireUserId(ctx);

      // Verify ownership
      const wRows = (await sql`
        SELECT id FROM workflows
        WHERE id = ${data.workflowId} AND user_id = ${userId}
        LIMIT 1
      `) as { id: number }[];

      if (wRows.length === 0) {
        throw new HttpError(404, "Workflow not found");
      }

      // Delete cascade: edges → nodes → runs → workflow
      // (FK constraints should handle cascade, but explicit is safer)
      await sql`DELETE FROM workflow_edges   WHERE workflow_id = ${data.workflowId}`;
      await sql`DELETE FROM workflow_nodes   WHERE workflow_id = ${data.workflowId}`;
      await sql`DELETE FROM runs             WHERE workflow_id = ${data.workflowId}`;
      await sql`DELETE FROM workflows        WHERE id = ${data.workflowId}`;

      return { deleted: true } satisfies DeleteWorkflowResponse;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });
