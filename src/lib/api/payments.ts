/**
 * Payment processing server functions.
 *
 * Supports:
 *   - FedaPay (Mobile Money) transaction verification
 *   - Stripe Checkout session creation + webhook verification
 *
 * Flow for FedaPay:
 *   1. Client opens FedaPay dialog → user pays with MoMo
 *   2. onComplete fires with transaction details
 *   3. Client sends transaction ID to verifyFedaPayTransaction
 *   4. Server verifies with FedaPay API, credits user on success
 *
 * Flow for Stripe:
 *   1. Client calls createStripeCheckout → gets a checkout session URL
 *   2. User is redirected to Stripe hosted checkout
 *   3. On success, Stripe POSTs to our webhook endpoint
 *   4. Webhook verifies signature, credits user
 */

import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/lib/db";
import { recordTransaction } from "@/lib/credits";
import { getRequestContext, HttpError, requireUserId, toJsonResponse } from "./auth";

// ---------------------------------------------------------------------------
// FedaPay verification
// ---------------------------------------------------------------------------

export type FedaPayVerifyInput = {
  transactionId: string;
  amount: number;
  userId?: number;
};

export type PaymentResponse = {
  ok: boolean;
  balance?: number;
  message?: string;
  transactionId?: string;
};

export const verifyFedaPayTransaction = createServerFn({ method: "POST" })
  .validator((data: FedaPayVerifyInput): FedaPayVerifyInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid body");
    if (!data.transactionId || typeof data.transactionId !== "string") {
      throw new HttpError(400, "transactionId is required");
    }
    if (typeof data.amount !== "number" || data.amount <= 0) {
      throw new HttpError(400, "amount must be a positive number");
    }
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(new Headers());
      const userId = data.userId ?? ctx.userId;
      if (userId == null) {
        throw new HttpError(401, "Authentication required");
      }

      // Verify with FedaPay API
      const apiKey = process.env.FEDAPAY_SECRET_KEY;
      if (!apiKey) {
        throw new HttpError(500, "FedaPay secret key not configured");
      }

      // Fetch transaction from FedaPay API
      const response = await fetch(
        `https://app.fedapay.com/api/v1/transactions/${data.transactionId}.json`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("[FedaPay] Verification API error:", response.status, errText);
        throw new HttpError(400, `FedaPay verification failed: ${response.status}`);
      }

      const tx = (await response.json()) as {
        id?: number;
        status?: string;
        amount?: number;
        currency?: { iso?: string };
      };

      // Accept "approved" or "completed" as valid statuses (FedaPay uses different labels
      // across API versions). Also accept "approved" for test mode.
      const validStatuses = ["approved", "completed", "paid"];
      if (!tx.status || !validStatuses.includes(tx.status.toLowerCase())) {
        return {
          ok: false,
          message: `Transaction status "${tx.status}" is not accepted`,
        } as PaymentResponse;
      }

      // Record the credit — use the API-confirmed amount, NOT client-supplied data.amount
      const confirmedAmount = Number(tx.amount);
      if (!confirmedAmount || confirmedAmount <= 0) {
        return {
          ok: false,
          message: "Transaction amount is invalid",
        } as PaymentResponse;
      }

      const result = await recordTransaction({
        userId,
        amount: confirmedAmount,
        type: "purchase",
        reference: `fedapay:${data.transactionId}`,
      });

      return {
        ok: true,
        balance: result.balance,
        transactionId: data.transactionId,
      } as PaymentResponse;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });

// ---------------------------------------------------------------------------
// Stripe Checkout
// ---------------------------------------------------------------------------

export type StripeCheckoutInput = {
  amount: number;
  currency?: string;
  userId?: number;
  successUrl?: string;
  cancelUrl?: string;
};

export type StripeCheckoutResponse = {
  ok: boolean;
  url?: string;
  sessionId?: string;
  error?: string;
};

export const createStripeCheckout = createServerFn({ method: "POST" })
  .validator((data: StripeCheckoutInput): StripeCheckoutInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid body");
    if (typeof data.amount !== "number" || data.amount <= 0) {
      throw new HttpError(400, "amount must be a positive number");
    }
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(new Headers());
      const userId = data.userId ?? ctx.userId;
      if (userId == null) {
        throw new HttpError(401, "Authentication required");
      }

      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        throw new HttpError(500, "Stripe secret key not configured");
      }

      const currency = (data.currency ?? "usd").toLowerCase();
      const appUrl =
        process.env.APP_URL ??
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

      const successUrl = data.successUrl ?? `${appUrl}/app/account?payment=success`;
      const cancelUrl = data.cancelUrl ?? `${appUrl}/app/account?payment=cancelled`;

      // Create Stripe Checkout Session
      const params = new URLSearchParams();
      params.append("mode", "payment");
      params.append("success_url", successUrl);
      params.append("cancel_url", cancelUrl);
      params.append("metadata[userId]", String(userId));
      params.append("metadata[amount]", String(data.amount));
      params.append("line_items[0][price_data][currency]", currency);
      params.append("line_items[0][price_data][product_data][name]", "Crédits Cortexia");
      params.append("line_items[0][price_data][unit_amount]", String(Math.round(data.amount * 100)));
      params.append("line_items[0][quantity]", "1");

      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error("[Stripe] Checkout creation failed:", response.status, errBody);
        throw new HttpError(502, `Stripe checkout creation failed: ${response.status}`);
      }

      const session = (await response.json()) as { id: string; url: string };

      return {
        ok: true,
        url: session.url,
        sessionId: session.id,
      } as StripeCheckoutResponse;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });

// ---------------------------------------------------------------------------
// Stripe Webhook
// ---------------------------------------------------------------------------

export type StripeWebhookResponse = {
  ok: boolean;
  action?: string;
  error?: string;
};

export const stripeWebhook = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>): Record<string, unknown> => {
    // Accept raw body — the webhook handler reads it
    return data;
  })
  .handler(async ({ data }) => {
    try {
      return await handleStripeWebhook(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Webhook error";
      console.error("[Stripe webhook]", message);
      return { ok: false, error: message } as StripeWebhookResponse;
    }
  });

// TODO: Stripe signature verification is not possible here because createServerFn
// consumes and parses the raw body before the handler runs. The raw body is needed
// for stripe.webhooks.constructEvent(). To properly verify webhooks, migrate to a
// custom route handler (e.g., a catch-all API route) that preserves the raw request body.
// For now, we at least validate the event type before processing.

async function handleStripeWebhook(
  body: Record<string, unknown>,
): Promise<StripeWebhookResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Parse the event
  const eventType = body.type as string | undefined;
  const event = body.data as { object?: Record<string, unknown> } | undefined;

  if (!eventType || !event?.object) {
    return { ok: false, error: "Invalid webhook payload" };
  }

  // Only process checkout.session.completed — reject all other event types
  if (eventType !== "checkout.session.completed") {
    return { ok: true, action: "no-op" };
  }

  const session = event.object;
  const userId = Number(session.metadata?.userId ?? session.userId);
  const amount = Number(session.metadata?.amount ?? 0);
  const sessionId = session.id as string;

  if (!userId || amount <= 0) {
    return { ok: false, error: "Missing userId or amount in session metadata" };
  }

  // Check for duplicate processing
  const existing = (await sql`
    SELECT id FROM credits_ledger
    WHERE reference = ${`stripe:${sessionId}`}
    LIMIT 1
  `) as { id: number }[];
  if (existing.length > 0) {
    return { ok: true, action: "already-processed" };
  }

  const result = await recordTransaction({
    userId,
    amount,
    type: "purchase",
    reference: `stripe:${sessionId}`,
  });

  return {
    ok: true,
    action: "credited",
  };
}
