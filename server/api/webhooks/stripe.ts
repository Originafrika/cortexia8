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

import { defineEventHandler, getHeader, readRawBody, setResponseStatus } from "h3";
import { sql } from "@/lib/db";
import { recordTransaction } from "@/lib/credits";
import { errorContext, logger } from "@/lib/logger";

export default defineEventHandler(async (event) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("webhook.stripe.configuration_missing");
    setResponseStatus(event, 500);
    return { ok: false, error: "Webhook secret not configured" };
  }

  // 1. Read raw body (must be string for signature verification).
  const rawValue = await readRawBody(event, "utf8");
  const rawBody =
    typeof rawValue === "string" ? rawValue : rawValue ? new TextDecoder().decode(rawValue) : "";
  if (!rawBody) {
    setResponseStatus(event, 400);
    return { ok: false, error: "Missing request body" };
  }

  // 2. Verify Stripe signature.
  const signature = getHeader(event, "stripe-signature");
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
    logger.error("webhook.stripe.signature_verification_failed", errorContext(err));
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
  const metadata = session.metadata as Record<string, unknown> | undefined;
  const sessionId = typeof session.id === "string" ? session.id : "";
  const paymentReference =
    typeof metadata?.paymentReference === "string" ? metadata.paymentReference : "";
  const eventId = typeof body.id === "string" ? body.id : "";
  const amountTotal = Number(session.amount_total ?? 0);
  const currency = typeof session.currency === "string" ? session.currency.toUpperCase() : "USD";
  const paymentStatus = typeof session.payment_status === "string" ? session.payment_status : "";

  if (!sessionId || amountTotal <= 0) {
    setResponseStatus(event, 400);
    return { ok: false, error: "Invalid checkout session" };
  }
  if (paymentStatus && paymentStatus !== "paid") {
    await sql`
      UPDATE payment_transactions SET provider_status = ${paymentStatus}, updated_at = NOW()
      WHERE provider = 'stripe' AND provider_transaction_id = ${sessionId}
    `;
    return { ok: true, action: "payment-not-paid" };
  }

  const paymentRows = (await sql`
    SELECT id, user_id, amount_usd_credited::text AS amount_usd_credited, currency, status
    FROM payment_transactions
    WHERE provider = 'stripe'
      AND (provider_transaction_id = ${sessionId} OR external_reference = ${paymentReference})
    LIMIT 1
  `) as {
    id: number;
    user_id: number;
    amount_usd_credited: string;
    currency: string;
    status: string;
  }[];
  if (paymentRows.length === 0) {
    setResponseStatus(event, 400);
    return { ok: false, error: "Unknown Stripe payment order" };
  }
  const payment = paymentRows[0];
  const expectedCents = Math.round(Number(payment.amount_usd_credited) * 100);
  if (currency !== "USD" || amountTotal !== expectedCents) {
    await sql`
      UPDATE payment_transactions SET status = 'needs_review', provider_status = 'amount_mismatch', updated_at = NOW()
      WHERE id = ${payment.id} AND status <> 'completed'
    `;
    return { ok: true, action: "needs-review" };
  }

  const ledgerReference = `payment:${payment.id}`;
  const existing = (await sql`
    SELECT id FROM credits_ledger WHERE reference = ${ledgerReference} LIMIT 1
  `) as { id: number }[];
  if (existing.length === 0) {
    try {
      await recordTransaction({
        userId: payment.user_id,
        amount: Number(payment.amount_usd_credited),
        type: "purchase",
        reference: ledgerReference,
      });
    } catch (recordErr: unknown) {
      if (
        !recordErr ||
        typeof recordErr !== "object" ||
        (recordErr as { code?: string }).code !== "23505"
      )
        throw recordErr;
    }
  }

  await sql`
    UPDATE payment_transactions
    SET provider_transaction_id = COALESCE(provider_transaction_id, ${sessionId}),
        provider_event_id = ${eventId || null},
        provider_status = 'paid', status = 'completed', updated_at = NOW()
    WHERE id = ${payment.id}
  `;
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
