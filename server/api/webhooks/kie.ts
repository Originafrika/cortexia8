/**
 * Raw Nitro event handler for kie.ai task-completion callbacks.
 *
 * kie.ai POSTs a JSON payload when a generation task completes. This
 * handler receives it and delegates to the shared handleWebhook logic
 * in src/lib/api/webhooks-kie.ts.
 *
 * Route: POST /api/webhooks/kie
 *
 * We always return 200 to kie.ai (even on internal errors) to prevent
 * retry storms. Errors are logged for debugging.
 */

import { defineEventHandler, readRawBody, setResponseStatus } from "h3";
import { handleWebhook } from "@/lib/api/webhooks-kie";

export default defineEventHandler(async (event) => {
  // 1. Read and parse the request body.
  const rawBody = await readRawBody(event, "utf-8");
  if (!rawBody) {
    console.error("[kie webhook] Empty request body");
    setResponseStatus(event, 200);
    return { ok: false, action: "rejected", reason: "empty body" };
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch (err) {
    console.error("[kie webhook] Invalid JSON body:", err);
    setResponseStatus(event, 200);
    return { ok: false, action: "rejected", reason: "invalid JSON" };
  }

  const taskId = (body.taskId as string) ?? (body.data as Record<string, unknown>)?.taskId as string | undefined;
  console.log(`[kie webhook] Received callback for taskId=${taskId ?? "unknown"}, state=${body.state ?? "unknown"}`);

  // 2. Delegate to shared handler logic.
  try {
    const result = await handleWebhook(body);
    console.log(`[kie webhook] Processed taskId=${taskId ?? "unknown"}, action=${result.action}, ok=${result.ok}`);
    setResponseStatus(event, 200);
    return result;
  } catch (err) {
    // Never let internal errors bubble up to kie.ai — it would retry.
    console.error(`[kie webhook] Internal error processing taskId=${taskId ?? "unknown"}:`, err);
    setResponseStatus(event, 200);
    return { ok: false, taskId: taskId ?? null, action: "rejected", reason: "internal error" };
  }
});
