/**
 * kie.ai webhook verification.
 *
 * Per the kie.ai docs, webhooks include a taskId; signature verification
 * is optional (see /common-api/webhook-verification). We treat the taskId
 * as the MVP auth — any callback with a taskId that doesn't match a
 * run_node_executions.kie_task_id row is rejected.
 *
 * If kie.ai ever ships real signature headers, we'll verify them here and
 * keep the DB lookup as a defence-in-depth check.
 */

import { sql } from "@/lib/db";

export type WebhookPayload =
  | { taskId: string; state?: string; status?: string; data?: unknown }
  | { code?: number; data?: { taskId?: string } & Record<string, unknown> };

/** Pull the taskId out of whatever kie.ai sent. We accept a few shapes. */
export function extractTaskId(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (typeof o.taskId === "string") return o.taskId;
  if (o.data && typeof o.data === "object") {
    const d = o.data as Record<string, unknown>;
    if (typeof d.taskId === "string") return d.taskId;
  }
  return null;
}

export type WebhookVerification =
  | { ok: true; runNodeExecutionId: number; userId: number | null; modelSlug: string }
  | { ok: false; reason: string };

/**
 * Confirm the taskId belongs to one of our runs. Returns enough context for
 * the webhook handler to update the right rows.
 */
export async function verifyTaskId(taskId: string): Promise<WebhookVerification> {
  if (!taskId) return { ok: false, reason: "missing taskId" };
  const rows = (await sql`
    SELECT rne.id, rne.run_id, wn.model_slug, r.user_id
    FROM run_node_executions rne
    JOIN workflow_nodes wn ON wn.id = rne.workflow_node_id
    JOIN runs r ON r.id = rne.run_id
    WHERE rne.kie_task_id = ${taskId}
    LIMIT 1
  `) as {
    id: number;
    run_id: number;
    model_slug: string;
    user_id: number | null;
  }[];
  if (rows.length === 0) {
    return { ok: false, reason: "unknown taskId" };
  }
  const row = rows[0];
  return {
    ok: true,
    runNodeExecutionId: row.id,
    userId: row.user_id,
    modelSlug: row.model_slug,
  };
}
