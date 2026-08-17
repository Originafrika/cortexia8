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

import { recordTransaction, getBalance } from "@/lib/credits";
import { sql } from "@/lib/db";
import { getRequestContext, HttpError, requireUserId } from "./auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { makePaymentReference } from "@/lib/payment-reference";

// ---------------------------------------------------------------------------
// FedaPay transaction creation and verification
// ---------------------------------------------------------------------------

export type FedaPayCreateInput = {
  amountUsd: number;
  idempotencyKey: string;
  sessionToken?: string;
};

export type FedaPayCreateResponse = {
  ok: boolean;
  transactionId?: string;
  amountLocal?: number;
  externalReference?: string;
  error?: string;
};

export const createFedaPayTransaction = createServerFn({ method: "POST" })
  .validator((data: FedaPayCreateInput): FedaPayCreateInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid body");
    if (
      typeof data.amountUsd !== "number" ||
      !Number.isFinite(data.amountUsd) ||
      data.amountUsd < 1 ||
      data.amountUsd > 500
    ) {
      throw new HttpError(400, "amountUsd must be between 1 and 500");
    }
    if (
      typeof data.idempotencyKey !== "string" ||
      data.idempotencyKey.length < 8 ||
      data.idempotencyKey.length > 120
    ) {
      throw new HttpError(400, "idempotencyKey is required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const ctx = await getRequestContext(data.sessionToken);
    const userId = await requireUserId(ctx);
    const apiKey = process.env.FEDAPAY_SECRET_KEY;
    if (!apiKey) throw new HttpError(500, "FedaPay secret key not configured");

    const externalReference = makePaymentReference(userId, data.idempotencyKey);
    const existing = (await sql`
      SELECT provider_transaction_id, amount_local::text AS amount_local, external_reference
      FROM payment_transactions
      WHERE external_reference = ${externalReference} AND user_id = ${userId}
      LIMIT 1
    `) as {
      provider_transaction_id: string | null;
      amount_local: string;
      external_reference: string;
    }[];
    if (existing.length > 0) {
      if (existing[0].provider_transaction_id) {
        return {
          ok: true,
          transactionId: existing[0].provider_transaction_id,
          amountLocal: Number(existing[0].amount_local),
          externalReference,
        };
      }
      throw new HttpError(
        409,
        "Payment order is already being prepared; retry with the same idempotency key shortly",
      );
    }

    const xofPerUsd = Number(process.env.FEDAPAY_XOF_PER_USD ?? 605);
    if (!Number.isFinite(xofPerUsd) || xofPerUsd <= 0)
      throw new HttpError(500, "FedaPay exchange rate is not configured");
    const amountLocal = Math.max(1, Math.round(data.amountUsd * xofPerUsd));
    const appUrl =
      process.env.APP_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    await sql`
      INSERT INTO payment_transactions
        (user_id, provider, external_reference, provider_status,
         amount_local, currency, amount_usd_credited, status, metadata, updated_at)
      VALUES
        (${userId}, 'fedapay', ${externalReference}, 'preparing',
         ${amountLocal}, 'XOF', ${data.amountUsd}, 'pending',
         ${JSON.stringify({ idempotencyKey: data.idempotencyKey })}::jsonb, NOW())
      ON CONFLICT (external_reference) DO NOTHING
    `;
    const response = await fetch("https://api.fedapay.com/v1/transactions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amountLocal,
        currency: { iso: "XOF" },
        description: `Cortexia credits · ${data.amountUsd.toFixed(2)} USD`,
        callback_url: `${appUrl}/app/account?payment=fedapay`,
        merchant_reference: externalReference,
        custom_metadata: {
          cortexia_user_id: String(userId),
          cortexia_external_reference: externalReference,
          cortexia_amount_usd: data.amountUsd.toFixed(6),
        },
      }),
    });
    if (!response.ok) {
      const errorBody = (await response.text()).slice(0, 500);
      console.error("[FedaPay] create transaction failed", response.status, errorBody);
      await sql`
        UPDATE payment_transactions
        SET status = 'failed', provider_status = 'creation_failed', updated_at = NOW()
        WHERE external_reference = ${externalReference} AND user_id = ${userId}
      `;
      throw new HttpError(502, "FedaPay transaction creation failed");
    }
    const raw = (await response.json()) as Record<string, unknown>;
    const tx = (raw["v1/transaction"] ?? raw.data ?? raw) as Record<string, unknown>;
    const transactionId = tx.id != null ? String(tx.id) : "";
    if (!transactionId) throw new HttpError(502, "FedaPay did not return a transaction ID");

    await sql`
      UPDATE payment_transactions
      SET provider_transaction_id = ${transactionId}, provider_status = 'pending', updated_at = NOW()
      WHERE external_reference = ${externalReference} AND user_id = ${userId}
    `;

    return { ok: true, transactionId, amountLocal, externalReference };
  });

export type FedaPayVerifyInput = {
  transactionId: string;
  amount?: number;
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
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(data.sessionToken);
      const userId = await requireUserId(ctx);
      const rateLimitKey = `payment:${userId}`;
      if (!checkRateLimit(rateLimitKey, RATE_LIMITS.payment)) {
        throw new HttpError(429, "Rate limit exceeded. Please try again later.");
      }

      const paymentRows = (await sql`
        SELECT id, amount_local::text AS amount_local, currency,
               amount_usd_credited::text AS amount_usd_credited,
               status, external_reference
        FROM payment_transactions
        WHERE provider = 'fedapay'
          AND provider_transaction_id = ${data.transactionId}
          AND user_id = ${userId}
        LIMIT 1
      `) as {
        id: number;
        amount_local: string;
        currency: string;
        amount_usd_credited: string;
        status: string;
        external_reference: string;
      }[];
      if (paymentRows.length === 0) {
        throw new HttpError(400, "This FedaPay transaction was not created by Cortexia");
      }
      const payment = paymentRows[0];

      const apiKey = process.env.FEDAPAY_SECRET_KEY;
      if (!apiKey) throw new HttpError(500, "FedaPay secret key not configured");
      const response = await fetch(
        `https://api.fedapay.com/v1/transactions/${encodeURIComponent(data.transactionId)}`,
        {
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        },
      );
      if (!response.ok) throw new HttpError(502, "FedaPay verification failed");

      const rawResponse = (await response.json()) as Record<string, unknown>;
      const tx = (rawResponse["v1/transaction"] ?? rawResponse.data ?? rawResponse) as {
        id?: number;
        status?: string;
        amount?: number;
        currency?: { iso?: string };
        currency_id?: number;
        merchant_reference?: string;
      };
      const status = tx.status?.toLowerCase() ?? "unknown";
      const validStatuses = ["approved", "completed", "paid"];
      if (!validStatuses.includes(status)) {
        await sql`
          UPDATE payment_transactions
          SET provider_status = ${status}, status = ${["declined", "canceled", "refunded", "expired"].includes(status) ? "failed" : "pending"}, updated_at = NOW()
          WHERE id = ${payment.id} AND status <> 'completed'
        `;
        return {
          ok: false,
          message: `Transaction status "${status}" is not accepted`,
        } as PaymentResponse;
      }

      const providerAmount = Number(tx.amount ?? 0);
      const providerCurrency = (
        tx.currency?.iso ?? (tx.currency_id === 2 ? "USD" : "XOF")
      ).toUpperCase();
      const expectedAmount = Number(payment.amount_local);
      if (
        providerCurrency !== payment.currency ||
        !Number.isFinite(providerAmount) ||
        Math.round(providerAmount) !== Math.round(expectedAmount)
      ) {
        await sql`
          UPDATE payment_transactions
          SET provider_status = ${status}, status = 'needs_review', updated_at = NOW()
          WHERE id = ${payment.id} AND status <> 'completed'
        `;
        throw new HttpError(409, "FedaPay amount or currency does not match the payment order");
      }
      if (tx.merchant_reference && tx.merchant_reference !== payment.external_reference) {
        await sql`
          UPDATE payment_transactions
          SET provider_status = ${status}, status = 'needs_review', updated_at = NOW()
          WHERE id = ${payment.id} AND status <> 'completed'
        `;
        throw new HttpError(409, "FedaPay merchant reference mismatch");
      }

      const ledgerReference = `payment:${payment.id}`;
      const existingLedger = (await sql`
        SELECT id FROM credits_ledger WHERE reference = ${ledgerReference} LIMIT 1
      `) as { id: number }[];
      let balance: number;
      if (existingLedger.length > 0) {
        balance = await getBalance(userId);
      } else {
        try {
          const result = await recordTransaction({
            userId,
            amount: Number(payment.amount_usd_credited),
            type: "purchase",
            reference: ledgerReference,
          });
          balance = result.balance;
        } catch (recordErr: unknown) {
          if (
            !recordErr ||
            typeof recordErr !== "object" ||
            (recordErr as { code?: string }).code !== "23505"
          )
            throw recordErr;
          balance = await getBalance(userId);
        }
      }

      await sql`
        UPDATE payment_transactions
        SET provider_status = ${status}, status = 'completed', updated_at = NOW()
        WHERE id = ${payment.id}
      `;
      return { ok: true, balance, transactionId: data.transactionId } as PaymentResponse;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      console.error("[FedaPay] Unexpected error", err);
      throw new HttpError(500, "Internal server error");
    }
  });

// ---------------------------------------------------------------------------
// Stripe Checkout
// ---------------------------------------------------------------------------

export type StripeCheckoutInput = {
  amount: number;
  currency?: string;
  method?: string;
  successUrl?: string;
  cancelUrl?: string;
  idempotencyKey: string;
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
    if (
      typeof data.amount !== "number" ||
      !Number.isFinite(data.amount) ||
      data.amount < 1 ||
      data.amount > 500
    ) {
      throw new HttpError(400, "amount must be between 1 and 500");
    }
    if (
      typeof data.idempotencyKey !== "string" ||
      data.idempotencyKey.length < 8 ||
      data.idempotencyKey.length > 120
    ) {
      throw new HttpError(400, "idempotencyKey is required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(data.sessionToken);
      const userId = await requireUserId(ctx);
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) throw new HttpError(500, "Stripe secret key not configured");

      const method = (data.method ?? "card").toLowerCase();
      const externalReference = makePaymentReference(userId, `stripe-${data.idempotencyKey}`);
      const existing = (await sql`
        SELECT provider_transaction_id, metadata
        FROM payment_transactions
        WHERE external_reference = ${externalReference} AND user_id = ${userId}
        LIMIT 1
      `) as { provider_transaction_id: string | null; metadata: Record<string, unknown> | null }[];
      if (existing[0]?.metadata?.checkoutUrl) {
        return {
          ok: true,
          url: String(existing[0].metadata.checkoutUrl),
          sessionId: existing[0].provider_transaction_id ?? undefined,
        } as StripeCheckoutResponse;
      }

      const appUrl =
        process.env.APP_URL ??
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
      const successUrl = data.successUrl ?? `${appUrl}/app/account?payment=success`;
      const cancelUrl = data.cancelUrl ?? `${appUrl}/app/account?payment=cancelled`;
      const paymentMetadata = { method, idempotencyKey: data.idempotencyKey };
      await sql`
        INSERT INTO payment_transactions
          (user_id, provider, external_reference, amount_local, currency, amount_usd_credited, status, metadata, updated_at)
        VALUES
          (${userId}, 'stripe', ${externalReference}, ${data.amount}, 'USD', ${data.amount}, 'pending', ${JSON.stringify(paymentMetadata)}::jsonb, NOW())
        ON CONFLICT (external_reference) DO NOTHING
      `;

      const params = new URLSearchParams();
      params.append("mode", "payment");
      params.append("success_url", successUrl);
      params.append("cancel_url", cancelUrl);
      params.append("metadata[userId]", String(userId));
      params.append("metadata[paymentReference]", externalReference);
      params.append("metadata[amountUsd]", String(data.amount));
      params.append("line_items[0][price_data][currency]", "usd");
      params.append("line_items[0][price_data][product_data][name]", "Cortexia credits");
      params.append(
        "line_items[0][price_data][unit_amount]",
        String(Math.round(data.amount * 100)),
      );
      params.append("line_items[0][quantity]", "1");
      params.append("payment_method_types[0]", method === "alipay" ? "alipay" : "card");

      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
      if (!response.ok) {
        await sql`UPDATE payment_transactions SET status = 'failed', updated_at = NOW() WHERE external_reference = ${externalReference}`;
        throw new HttpError(502, "Stripe checkout creation failed");
      }
      const session = (await response.json()) as { id: string; url: string };
      await sql`
        UPDATE payment_transactions
        SET provider_transaction_id = ${session.id},
            metadata = ${JSON.stringify({ ...paymentMetadata, checkoutUrl: session.url })}::jsonb,
            updated_at = NOW()
        WHERE external_reference = ${externalReference}
      `;
      return { ok: true, url: session.url, sessionId: session.id } as StripeCheckoutResponse;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, "Internal server error");
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
