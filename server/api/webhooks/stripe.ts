/**
 * Raw Nitro event handler for Stripe webhooks.
 *
 * This replaces the createServerFn-based handler in src/lib/api/payments.ts
 * which could not access the raw request body needed for Stripe signature
 * verification (createServerFn parses JSON before the handler runs).
 *
 * Route: POST /api/webhooks/stripe
 *
 * Flow:
 *   1. Read raw request body
 *   2. Verify Stripe signature using HMAC-SHA256 (t=<timestamp>,v1=<sig>)
 *   3. Process checkout.session.completed events
 *   4. Credit user account
 */

import { defineEventHandler, readRawBody, setResponseStatus } from "h3";
import { sql } from "@/lib/db";
import { recordTransaction } from "@/lib/credits";
import { recordTransaction } from "@/lib/credits";

export default defineEventHandler(async (event) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe webhook] STRIPE_WEBHOOK_SECRET not configured");
    setResponseStatus(event, 500);
    return { ok: false, error: "Webhook secret not configured" };
  }

  // 1. Read raw body (must be string for signature verification).
  const rawBody = await readRawBody(event, "utf-8");
  if (!rawBody) {
    setResponseStatus(event, 400);
    return { ok: false, error: "Missing request body" };
  }

  // 2. Verify Stripe signature.
  const signature = event.node.req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    setResponseStatus(event, 400);
    return { ok: false, error: "Missing stripe-signature header" };
  }

  try {
    const verified = await verifyStripeSignature(rawBody, signature, webhookSecret);
    if (!verified) {
      setResponseStatus(event, 401);
      return { ok: false, error: "Invalid signature" };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature verification failed";
    console.error("[Stripe webhook]", message);
    setResponseStatus(event, 401);
    return { ok: false, error: message };
  }

  // 3. Parse and process the event.
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    setResponseStatus(event, 400);
    return { ok: false, error: "Invalid JSON body" };
  }

  const eventType = body.type as string | undefined;
  const dataObj = body.data as { object?: Record<string, unknown> } | undefined;

  if (!eventType || !dataObj?.object) {
    setResponseStatus(event, 400);
    return { ok: false, error: "Invalid webhook payload" };
  }

  // Only process checkout.session.completed
  if (eventType !== "checkout.session.completed") {
    return { ok: true, action: "no-op" };
  }

  const session = dataObj.object;
  const userId = Number(session.metadata?.userId ?? session.userId);
  const sessionId = session.id as string;

  // Use session.amount_total (what Stripe actually charged) instead of metadata.amount
  // amount_total is in cents, so divide by 100
  const amountTotal = Number(session.amount_total ?? 0);
  const amount = amountTotal / 100;

  if (!userId || amount <= 0) {
    setResponseStatus(event, 400);
    return { ok: false, error: "Missing userId or invalid amount" };
  }

  // 4. Atomic credit: INSERT ledger + UPDATE balance in single CTE
  const reference = `stripe:${sessionId}`;
  
  // Check for duplicate first (fast path)
  const existing = (await sql`
    SELECT id FROM credits_ledger WHERE reference = ${reference} LIMIT 1
  `) as { id: number }[];
  
  if (existing.length > 0) {
    return { ok: true, action: "already-processed" };
  }

  // Atomic: insert ledger + update balance in single CTE
  try {
    await recordTransaction({
      userId,
      amount,
      type: "purchase",
      reference,
    });
  } catch (recordErr: any) {
    // Handle unique_violation (race condition)
    if (recordErr?.code === "23505" || recordErr?.message?.includes("unique")) {
      return { ok: true, action: "already-processed" };
    }
    throw recordErr;
  }

  return { ok: true, action: "credited" };
});

/**
 * Verify a Stripe webhook signature using HMAC-SHA256.
 *
 * Stripe signs webhooks with: v1=<HMAC-SHA256(secret, "t.<timestamp>.<body>")>
 * The signature header format: "t=<timestamp>,v1=<hash>[,v1=<hash>...]"
 */
async function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string,
  webhookSecret: string,
): Promise<boolean> {
  const parts = parseSignatureHeader(signatureHeader);
  if (!parts.timestamp || parts.v1Signatures.length === 0) {
    throw new Error("Invalid signature header format");
  }

  // Reject signatures older than 5 minutes to prevent replay attacks
  const timestamp = Number(parts.timestamp);
  const tolerance = 300; // 5 minutes
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > tolerance) {
    throw new Error("Signature timestamp too old or too new");
  }

  const payload = `${parts.timestamp}.${rawBody}`;

  // Import the webhook secret as an HMAC key
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhookSecret),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"],
  );

  // Compute HMAC-SHA256 of the payload
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expected = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Compare any matching v1 signature (constant-time comparison)
  return parts.v1Signatures.some((v1) => timingSafeEqual(expected, v1));
}

function parseSignatureHeader(header: string): {
  timestamp: string | null;
  v1Signatures: string[];
} {
  const timestamp = header.match(/t=([^,]+)/)?.[1] ?? null;
  const v1Signatures = header
    .split(",")
    .map((pair) => pair.trim())
    .filter((pair) => pair.startsWith("v1="))
    .map((pair) => pair.slice(3));
  return { timestamp, v1Signatures };
}

/** Constant-time string comparison to prevent timing attacks. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
