-- 0004 — add payment_transactions table

CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('fedapay', 'stripe')),
  provider_transaction_id TEXT,
  amount_local NUMERIC(12, 6) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'XOF',
  amount_usd_credited NUMERIC(12, 6) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS pt_user_idx ON payment_transactions (user_id);
CREATE INDEX IF NOT EXISTS pt_provider_idx ON payment_transactions (provider);
CREATE INDEX IF NOT EXISTS pt_status_idx ON payment_transactions (status);
