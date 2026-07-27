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

import { recordTransaction } from "@/lib/credits";
import { getRequestContext, HttpError, requireUserId, toJsonResponse } from "./auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// FedaPay verification
// ---------------------------------------------------------------------------

export type FedaPayVerifyInput = {
  transactionId: string;
  amount: number;
  sessionToken?: string;
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
      const ctx = await getRequestContext(data.sessionToken);
      const userId = await requireUserId(ctx);

      // Rate limit: 10 requests per minute per user
      const rateLimitKey = `payment:${userId}`;
      if (!checkRateLimit(rateLimitKey, RATE_LIMITS.payment)) {
        throw new HttpError(429, "Rate limit exceeded. Please try again later.");
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
        throw new HttpError(400, "FedaPay verification failed");
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
  successUrl?: string;
  cancelUrl?: string;
  sessionToken?: string;
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
      const ctx = await getRequestContext(data.sessionToken);
      const userId = await requireUserId(ctx);
      // CSRF: This is a state-changing POST. TanStack Start server functions do not
      // expose raw request headers. Primary CSRF defense: SameSite=Strict session cookies.

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
        throw new HttpError(502, "Stripe checkout creation failed");
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
// NOTE: The Stripe webhook has been migrated from createServerFn to a raw
// Nitro event handler at server/api/webhooks/stripe.ts. That handler can
// read the raw request body needed for stripe webhook signature verification.
// ---------------------------------------------------------------------------

// stripeWebhook removed — use raw route handler at server/api/webhooks/stripe.ts instead
// (createServerFn cannot verify Stripe signatures)
