import { Webhook } from "fedapay";
import { defineEventHandler, getHeader, readRawBody, setResponseStatus } from "h3";
import { sql } from "@/lib/db";
import { getBalance, recordTransaction } from "@/lib/credits";

export default defineEventHandler(async (event) => {
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[FedaPay webhook] FEDAPAY_WEBHOOK_SECRET is not configured");
    setResponseStatus(event, 500);
    return { received: false };
  }

  const signature = getHeader(event, "x-fedapay-signature");
  const rawValue = await readRawBody(event, "utf8");
  const rawBody =
    typeof rawValue === "string" ? rawValue : rawValue ? new TextDecoder().decode(rawValue) : "";
  if (!signature || !rawBody) {
    setResponseStatus(event, 400);
    return { received: false };
  }

  let webhookEvent: Record<string, unknown>;
  try {
    webhookEvent = Webhook.constructEvent(rawBody, signature, secret) as Record<string, unknown>;
  } catch (error) {
    console.error(
      "[FedaPay webhook] signature verification failed",
      error instanceof Error ? error.message : String(error),
    );
    setResponseStatus(event, 400);
    return { received: false };
  }

  const eventName = typeof webhookEvent.name === "string" ? webhookEvent.name : "";
  const tx = (webhookEvent.object ??
    webhookEvent.data ??
    webhookEvent.transaction ??
    webhookEvent) as Record<string, unknown>;
  const transactionId = tx.id != null ? String(tx.id) : "";
  if (!transactionId) {
    setResponseStatus(event, 200);
    return { received: true, action: "ignored", reason: "missing transaction id" };
  }

  try {
    const paymentRows = (await sql`
      SELECT id, user_id, external_reference, amount_local::text AS amount_local,
             currency, amount_usd_credited::text AS amount_usd_credited, status
      FROM payment_transactions
      WHERE provider = 'fedapay'
        AND (provider_transaction_id = ${transactionId} OR external_reference = ${String(tx.merchant_reference ?? "")})
      LIMIT 1
    `) as {
      id: number;
      user_id: number;
      external_reference: string;
      amount_local: string;
      currency: string;
      amount_usd_credited: string;
      status: string;
    }[];
    if (paymentRows.length === 0) {
      setResponseStatus(event, 200);
      return { received: true, action: "ignored", reason: "unknown transaction" };
    }
    const payment = paymentRows[0];
    const providerStatus =
      typeof tx.status === "string"
        ? tx.status.toLowerCase()
        : (eventName.split(".").pop() ?? "unknown");
    await sql`
      UPDATE payment_transactions
      SET provider_transaction_id = COALESCE(provider_transaction_id, ${transactionId}),
          provider_event_id = ${typeof webhookEvent.id === "string" ? webhookEvent.id : null},
          provider_status = ${providerStatus}, updated_at = NOW()
      WHERE id = ${payment.id}
    `;

    if (!["approved", "completed", "paid"].includes(providerStatus)) {
      await sql`
        UPDATE payment_transactions
        SET status = CASE WHEN ${["declined", "canceled", "refunded", "expired"].includes(providerStatus)} THEN 'failed' ELSE status END,
            updated_at = NOW()
        WHERE id = ${payment.id} AND status <> 'completed'
      `;
      setResponseStatus(event, 200);
      return { received: true, action: "payment-not-approved", transactionId };
    }

    const providerAmount = Number(tx.amount ?? 0);
    const providerCurrency = String(
      (tx.currency as { iso?: string } | undefined)?.iso ?? tx.currency_iso ?? "XOF",
    ).toUpperCase();
    if (
      providerCurrency !== payment.currency ||
      !Number.isFinite(providerAmount) ||
      Math.round(providerAmount) !== Math.round(Number(payment.amount_local))
    ) {
      await sql`
        UPDATE payment_transactions SET status = 'needs_review', updated_at = NOW()
        WHERE id = ${payment.id} AND status <> 'completed'
      `;
      console.error("[FedaPay webhook] amount/currency mismatch", {
        transactionId,
        paymentId: payment.id,
      });
      setResponseStatus(event, 200);
      return { received: true, action: "needs-review", transactionId };
    }

    const ledgerReference = `payment:${payment.id}`;
    const existingLedger = (await sql`
      SELECT id FROM credits_ledger WHERE reference = ${ledgerReference} LIMIT 1
    `) as { id: number }[];
    const balance =
      existingLedger.length > 0
        ? await getBalance(payment.user_id)
        : (
            await recordTransaction({
              userId: payment.user_id,
              amount: Number(payment.amount_usd_credited),
              type: "purchase",
              reference: ledgerReference,
            })
          ).balance;

    await sql`
      UPDATE payment_transactions SET status = 'completed', provider_status = ${providerStatus}, updated_at = NOW()
      WHERE id = ${payment.id}
    `;
    setResponseStatus(event, 200);
    return { received: true, action: "credited", transactionId, balance };
  } catch (error) {
    console.error("[FedaPay webhook] processing failed", {
      transactionId,
      error: error instanceof Error ? error.message : String(error),
    });
    setResponseStatus(event, 500);
    return { received: false, transactionId };
  }
});
