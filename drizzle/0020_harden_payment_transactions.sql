ALTER TABLE "payment_transactions"
  ADD COLUMN IF NOT EXISTS "external_reference" text,
  ADD COLUMN IF NOT EXISTS "provider_event_id" text,
  ADD COLUMN IF NOT EXISTS "provider_status" text,
  ADD COLUMN IF NOT EXISTS "metadata" jsonb,
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();

UPDATE "payment_transactions"
SET "external_reference" = CONCAT("provider", ':', COALESCE("provider_transaction_id", "id"::text))
WHERE "external_reference" IS NULL;

UPDATE "payment_transactions"
SET "updated_at" = COALESCE("updated_at", "created_at", now())
WHERE "updated_at" IS NULL;

ALTER TABLE "payment_transactions"
  ALTER COLUMN "external_reference" SET NOT NULL,
  ALTER COLUMN "updated_at" SET DEFAULT now(),
  ALTER COLUMN "updated_at" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "payment_transactions_external_reference_uidx"
  ON "payment_transactions" ("external_reference");

CREATE UNIQUE INDEX IF NOT EXISTS "payment_transactions_provider_transaction_uidx"
  ON "payment_transactions" ("provider", "provider_transaction_id")
  WHERE "provider_transaction_id" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "payment_transactions_provider_event_uidx"
  ON "payment_transactions" ("provider_event_id")
  WHERE "provider_event_id" IS NOT NULL;
