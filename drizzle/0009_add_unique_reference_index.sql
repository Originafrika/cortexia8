-- Add UNIQUE index on credits_ledger.reference for idempotent payment processing
-- This prevents double-crediting when FedaPay/Stripe webhooks are delivered multiple times
CREATE UNIQUE INDEX IF NOT EXISTS credits_ledger_reference_unique_idx
  ON credits_ledger (reference)
  WHERE reference IS NOT NULL;
