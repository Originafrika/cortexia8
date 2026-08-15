/**
 * Raw Nitro event handler for KIE.ai task-completion callbacks.
 *
 * KIE.ai signs callbacks with HMAC-SHA256 when a webhook HMAC key is enabled.
 * Production traffic must provide KIE_WEBHOOK_HMAC_KEY; the database task
 * mapping remains a second authorization check inside the shared processor.
 */

import { timingSafeEqual, createHmac } from "node:crypto";
import { defineEventHandler, getHeader, readRawBody, setResponseStatus } from "h3";
import { handleWebhook } from "@/lib/api/webhooks-kie-core";
import { extractTaskId } from "@/lib/kie-api/webhook";

const WEBHOOK_TOLERANCE_SECONDS = 5 * 60;

export default defineEventHandler(async (event) => {
  const secret = process.env.KIE_WEBHOOK_HMAC_KEY;
  if (!secret) {
    console.error("[kie webhook] KIE_WEBHOOK_HMAC_KEY is not configured");
    setResponseStatus(event, 500);
    return { ok: false, action: "rejected", reason: "Webhook verification is not configured" };
  }

  const rawBody = await readRawBody(event, "utf8");
  if (!rawBody) {
    setResponseStatus(event, 400);
    return { ok: false, action: "rejected", reason: "empty body" };
  }
  const bodyText = typeof rawBody === "string" ? rawBody : new TextDecoder().decode(rawBody);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(bodyText) as Record<string, unknown>;
  } catch {
    setResponseStatus(event, 400);
    return { ok: false, action: "rejected", reason: "invalid JSON" };
  }

  const taskId = extractTaskId(body);
  if (!taskId) {
    setResponseStatus(event, 400);
    return { ok: false, action: "rejected", reason: "missing taskId" };
  }

  const timestamp = getHeader(event, "x-webhook-timestamp");
  const receivedSignature = getHeader(event, "x-webhook-signature");
  if (!timestamp || !receivedSignature) {
    setResponseStatus(event, 401);
    return { ok: false, action: "rejected", reason: "missing webhook signature" };
  }

  const timestampSeconds = Number(timestamp);
  if (
    !Number.isInteger(timestampSeconds) ||
    Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > WEBHOOK_TOLERANCE_SECONDS
  ) {
    setResponseStatus(event, 401);
    return { ok: false, action: "rejected", reason: "stale webhook signature" };
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(`${taskId}.${timestamp}`)
    .digest("base64");
  const expectedBytes = Buffer.from(expectedSignature);
  const receivedBytes = Buffer.from(receivedSignature);
  if (
    expectedBytes.length !== receivedBytes.length ||
    !timingSafeEqual(expectedBytes, receivedBytes)
  ) {
    setResponseStatus(event, 401);
    return { ok: false, action: "rejected", reason: "invalid webhook signature" };
  }

  try {
    const result = await handleWebhook(body);
    setResponseStatus(event, result.ok ? 200 : 422);
    return result;
  } catch (error) {
    console.error("[kie webhook] Internal error", {
      taskId,
      error: error instanceof Error ? error.message : String(error),
    });
    setResponseStatus(event, 500);
    return { ok: false, taskId, action: "rejected", reason: "internal error" };
  }
});
