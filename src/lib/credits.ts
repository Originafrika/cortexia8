/**
 * Credits system.
 *
 * Every credit movement goes through the `credits_ledger`. The
 * `users.credits_balance` field is a denormalised cache we keep in sync
 * inside the same transaction. We never update balance without a ledger
 * row — that way the balance is always reconstructable from history.
 */

import { sql } from "@/lib/db";

export type CreditTxType =
  | "purchase" // paid top-up
  | "usage" // generation cost
  | "refund" // failed generation refunded
  | "bonus" // promo / waitlist reward
  | "adjustment"; // manual fix

export type LedgerEntry = {
  id: number;
  user_id: number;
  amount: string; // numeric comes back as string
  type: CreditTxType;
  reference: string | null;
  created_at: string;
  /**
   * New balance after the transaction. Only present on rows returned
   * by `recordTransaction` (which JOINs on users.credits_balance).
   */
  credits_balance?: string;
};

export async function getBalance(userId: number): Promise<number> {
  const rows = (await sql`
    SELECT credits_balance FROM users WHERE id = ${userId}
  `) as { credits_balance: string }[];
  if (rows.length === 0) return 0;
  return Number(rows[0].credits_balance);
}

/**
 * Atomically: insert ledger row + bump users.credits_balance.
 * `amount` may be negative (debit). Throws if the user doesn't exist.
 */
export async function recordTransaction(opts: {
  userId: number;
  amount: number;
  type: CreditTxType;
  reference?: string;
}): Promise<{ balance: number; entry: LedgerEntry }> {
  const rows = (await sql`
    WITH updated AS (
      UPDATE users
      SET credits_balance = credits_balance + ${opts.amount}
      WHERE id = ${opts.userId}
      RETURNING credits_balance
    ),
    inserted AS (
      INSERT INTO credits_ledger (user_id, amount, type, reference)
      VALUES (${opts.userId}, ${opts.amount}, ${opts.type}, ${opts.reference ?? null})
      RETURNING id, user_id, amount, type, reference, created_at
    )
    SELECT i.id, i.user_id, i.amount::text AS amount, i.type, i.reference, i.created_at::text AS created_at,
           u.credits_balance::text AS credits_balance
    FROM inserted i, updated u
  `) as LedgerEntry[];
  if (rows.length === 0) {
    throw new Error(`User ${opts.userId} not found`);
  }
  return { balance: Number(rows[0].credits_balance), entry: rows[0] };
}

/**
 * Ensure the user has at least `cost` credits. Returns the current
 * balance. Throws `InsufficientCreditsError` if not.
 */
export async function ensureSufficientCredits(
  userId: number,
  cost: number,
): Promise<{ ok: true; balance: number } | { ok: false; balance: number; required: number }> {
  const balance = await getBalance(userId);
  if (balance >= cost) return { ok: true, balance };
  return { ok: false, balance, required: cost };
}

export class InsufficientCreditsError extends Error {
  constructor(
    public balance: number,
    public required: number,
  ) {
    super(`Insufficient credits: have ${balance}, need ${required}`);
    this.name = "InsufficientCreditsError";
  }
}

/** Per-model debit that also records the ledger entry. */
export async function debitForGeneration(opts: {
  userId: number;
  cost: number;
  runId: number;
  nodeExecutionId?: number;
}): Promise<number> {
  const result = await recordTransaction({
    userId: opts.userId,
    amount: -Math.abs(opts.cost),
    type: "usage",
    reference: opts.nodeExecutionId
      ? `run:${opts.runId}/exec:${opts.nodeExecutionId}`
      : `run:${opts.runId}`,
  });
  return result.balance;
}

export async function refundGeneration(opts: {
  userId: number;
  amount: number;
  runId: number;
  nodeExecutionId?: number;
}): Promise<number> {
  const result = await recordTransaction({
    userId: opts.userId,
    amount: Math.abs(opts.amount),
    type: "refund",
    reference: opts.nodeExecutionId
      ? `run:${opts.runId}/exec:${opts.nodeExecutionId}`
      : `run:${opts.runId}`,
  });
  return result.balance;
}
