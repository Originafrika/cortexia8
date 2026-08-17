# Cortexia8 Live Cutover Checklist

## Scope and release artifact

This checklist applies to the production Cortexia8 repository at commit `d4a95f8267e8ecf4c18246755a33e8ee6282c15f` on `main`. The deployment is a Vercel-targeted TanStack Start build using `vite build` and the Nitro Vercel preset.

The public `/run-migration` route and its schema-mutating server function have been removed from the production route tree. Do not reintroduce it or any application GET endpoint that mutates schema. Database changes must be executed by an authenticated operator through the database provider or a controlled migration runner.

## 1. Preflight and backup

1. Confirm the intended Vercel project, production domain, Neon production database, and live provider accounts. Do not mix sandbox/test credentials with live credentials.
2. Create a Neon database branch or provider backup/snapshot and record its identifier, timestamp, and restoration procedure.
3. Confirm the working tree is clean and the deployment revision is exactly `d4a95f8` or a later reviewed descendant of it.
4. Confirm the application can be built from a clean checkout:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm exec tsc --noEmit
pnpm exec vite build
pnpm audit --prod
pnpm peers check
```

5. Confirm the current production schema is already at migration `0019`. If the database is a new or incomplete installation, apply the prior migrations in lexical order first; never apply `0020` to a database that lacks the tables and columns introduced by the earlier chain.

## 2. Migration 0020 preflight

Migration file: `drizzle/0020_harden_payment_transactions.sql`.

Before applying it, run these read-only checks in the production database:

```sql
SELECT to_regclass('public.payment_transactions') AS payment_transactions_table;

SELECT COUNT(*) AS payment_rows,
       COUNT(*) FILTER (WHERE provider_transaction_id IS NOT NULL) AS provider_id_rows
FROM payment_transactions;

SELECT provider, provider_transaction_id, COUNT(*) AS duplicate_count
FROM payment_transactions
WHERE provider_transaction_id IS NOT NULL
GROUP BY provider, provider_transaction_id
HAVING COUNT(*) > 1;

SELECT external_reference, COUNT(*) AS duplicate_count
FROM payment_transactions
WHERE external_reference IS NOT NULL
GROUP BY external_reference
HAVING COUNT(*) > 1;
```

Expected result: the table exists, the duplicate queries return zero rows, and existing payment rows are available for backfill. If duplicate provider transaction IDs exist, stop and reconcile them before creating the unique provider index.

## 3. Apply the migration atomically

The repository does not define a migration script and does not contain Drizzle migration metadata. For the existing production database, apply only `0020_harden_payment_transactions.sql` after the earlier chain has been confirmed. Use `psql` or the Neon SQL Editor. With `psql`, use a single transaction and stop on the first error:

```bash
export DATABASE_URL='[retrieve from the production secret manager; do not commit]'
psql "$DATABASE_URL" \
  --single-transaction \
  --set ON_ERROR_STOP=1 \
  --file drizzle/0020_harden_payment_transactions.sql
```

If using the Neon SQL Editor, paste the complete file as one transaction where supported, or execute the statements in order while keeping the backup available. The migration is additive: it adds reconciliation columns, backfills `external_reference`, sets required fields, and creates unique indexes. Do not manually edit `users.credits_balance`; credit corrections must use `credits_ledger` and the atomic ledger helper.

Validate after applying:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'payment_transactions'
  AND column_name IN ('external_reference', 'provider_event_id', 'provider_status', 'metadata', 'updated_at')
ORDER BY column_name;

SELECT COUNT(*) AS missing_external_references
FROM payment_transactions
WHERE external_reference IS NULL;

SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'payment_transactions'
ORDER BY indexname;
```

Expected result: all five columns exist, `missing_external_references` is zero, and the three reconciliation indexes are present.

## 4. Production environment variables

Configure these in the Vercel **Production** environment. Set the same names in staging with sandbox/test values where applicable. Never expose server secrets through `VITE_*` variables and never commit values in `.env` files.

| Variable                                                                                                                                                                               | Required for                                  | Exact source usage and value                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `APP_URL`                                                                                                                                                                              | All production callbacks and redirects        | Canonical HTTPS origin, for example `https://cortexia.originafrika.online`; used to build KIE callback URLs and payment return URLs.     |
| `DATABASE_URL`                                                                                                                                                                         | All server/database operations                | Neon Postgres connection string for the production database.                                                                             |
| `VITE_NEON_AUTH_URL`                                                                                                                                                                   | Browser authentication                        | Neon Auth endpoint URL; safe to expose because it is a public client endpoint, not a secret.                                             |
| `KIE_API_KEY`                                                                                                                                                                          | AI generation, agent, upload, and model calls | Live KIE.ai API key; server-only.                                                                                                        |
| `KIE_API_BASE`                                                                                                                                                                         | Optional KIE endpoint override                | Use only if the live provider base differs from the code default `https://api.kie.ai`.                                                   |
| `KIE_WEBHOOK_HMAC_KEY`                                                                                                                                                                 | KIE callbacks                                 | Live KIE webhook HMAC key from the provider settings; server-only.                                                                       |
| `FEDAPAY_SECRET_KEY`                                                                                                                                                                   | Mobile-money payments                         | Live FedaPay API secret; server-only.                                                                                                    |
| `FEDAPAY_WEBHOOK_SECRET`                                                                                                                                                               | FedaPay callbacks                             | Live endpoint secret for `/api/webhooks/fedapay`; unique to the live endpoint.                                                           |
| `FEDAPAY_XOF_PER_USD`                                                                                                                                                                  | Mobile-money pricing                          | Deliberately approved server-side XOF-per-USD rate. Do not rely on the code default without product/finance approval.                    |
| `VITE_FEDAPAY_PUBLIC_KEY`                                                                                                                                                              | FedaPay browser Checkout.js                   | Live FedaPay public key; browser-visible by design, but it must match the live account/mode.                                             |
| `STRIPE_SECRET_KEY`                                                                                                                                                                    | Card checkout                                 | Live Stripe secret key; server-only.                                                                                                     |
| `STRIPE_WEBHOOK_SECRET`                                                                                                                                                                | Stripe callbacks                              | Live Stripe endpoint signing secret for `/api/webhooks/stripe`; server-only.                                                             |
| `R2_ENDPOINT`                                                                                                                                                                          | Durable asset storage                         | Cloudflare R2 S3-compatible endpoint.                                                                                                    |
| `R2_ACCESS_KEY_ID`                                                                                                                                                                     | Durable asset storage                         | R2 access key ID; server-only.                                                                                                           |
| `R2_SECRET_ACCESS_KEY`                                                                                                                                                                 | Durable asset storage                         | R2 secret access key; server-only.                                                                                                       |
| `R2_BUCKET`                                                                                                                                                                            | Durable asset storage                         | Exact R2 bucket name.                                                                                                                    |
| `R2_REGION`                                                                                                                                                                            | Durable asset storage                         | Usually `auto` for Cloudflare R2 unless the account requires another region.                                                             |
| `R2_PUBLIC_BASE_URL`                                                                                                                                                                   | Durable asset serving                         | Public HTTPS base URL for stored assets.                                                                                                 |
| `RESEND_API_KEY`                                                                                                                                                                       | Optional launch/transactional email           | Server-only key; required only if launch-day email flows are enabled.                                                                    |
| `VITE_LAUNCH_MODE`                                                                                                                                                                     | Optional launch gating                        | Set to `live` or omit for live behavior. Set to `waitlist` only for a deliberate waitlist deployment.                                    |
| `VITE_CAPABILITY_WORKFLOWS`, `VITE_CAPABILITY_CANVAS`, `VITE_CAPABILITY_DEVELOPERS`, `VITE_CAPABILITY_AGENT`, `VITE_CAPABILITY_TEXT`, `VITE_CAPABILITY_AUDIO`, `VITE_CAPABILITY_MUSIC` | Client readiness controls                     | Set each to `disabled`, `beta`, or `ready`; leave unfinished journeys `disabled` until the corresponding staging evidence is signed off. |
| `CAPABILITY_WORKFLOWS`, `CAPABILITY_CANVAS`, `CAPABILITY_DEVELOPERS`, `CAPABILITY_AGENT`, `CAPABILITY_TEXT`, `CAPABILITY_AUDIO`, `CAPABILITY_MUSIC`                                    | Server readiness enforcement                  | Keep aligned with the `VITE_` values so direct server requests cannot bypass readiness controls. Omitted values default to `disabled`.   |

Before deploy, verify every capability switch has an intentional value in the Vercel Production environment and record the exact values in the launch log. Do not set a capability to `ready` solely because its route renders; require a successful staging journey, provider response, persistence check, and applicable payment evidence.

`VERCEL_URL` and `NODE_ENV` are platform/runtime values and should not be manually supplied unless the deployment platform requires them. `CORTEXIA_KEY` appears only inside displayed developer-code examples and is not required as a server deployment secret; real users should create API keys through the developer portal.

## 5. Register provider callbacks

Register these exact HTTPS URLs in the live provider dashboards:

| Provider | Live callback URL                                           | Required event/verification setup                                                                                                                                |
| -------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KIE.ai   | `https://cortexia.originafrika.online/api/webhooks/kie`     | Enable the provider webhook HMAC key; configure `X-Webhook-Timestamp` and `X-Webhook-Signature` verification.                                                    |
| FedaPay  | `https://cortexia.originafrika.online/api/webhooks/fedapay` | Use the live endpoint secret and `X-FEDAPAY-SIGNATURE`; enable transaction approval, decline, cancellation, refund, and update events needed for reconciliation. |
| Stripe   | `https://cortexia.originafrika.online/api/webhooks/stripe`  | Use the live `Stripe-Signature` endpoint secret; subscribe at minimum to the checkout completion event used by the handler.                                      |

Provider documentation recommends HTTPS endpoints, raw-body signature verification, idempotent duplicate handling, and fast 2xx responses. See the official references in `cortexia-cutover-provider-findings.md`.

## 6. Deploy and verify

1. Deploy the reviewed commit to Vercel Production with the variables above already configured.
2. Confirm the deployment health page loads and unauthenticated `/app/account` redirects to sign-in.
3. Confirm `/api/webhooks/kie`, `/api/webhooks/fedapay`, and `/api/webhooks/stripe` reject unsigned or malformed requests rather than crediting accounts.
4. In staging or provider test mode, create one FedaPay payment and one Stripe payment. Confirm the callback reaches the correct endpoint, the payment row becomes `completed`, and exactly one `credits_ledger` row exists with `payment:<payment_transaction_id>`.
5. Submit one small KIE generation. Confirm it is charged before provider submission, completes through the callback path, and does not create duplicate assets on callback redelivery.
6. Repeat one provider callback or use provider redelivery. Confirm the ledger and asset counts remain unchanged.
7. Monitor deployment logs for provider event IDs, KIE task IDs, database errors, 4xx/5xx rates, payment completion rate, and webhook latency for the first release window.

## 7. Rollback and incident handling

If the database migration fails while running with `--single-transaction`, verify that the transaction rolled back and resolve the preflight issue before retrying. If the application fails after a successful additive migration, roll back the Vercel deployment to the previous application revision while retaining the new columns and indexes; do not drop them during an incident. If a provider secret is exposed, rotate it in the provider dashboard, update the Vercel secret, redeploy, and review payment/callback records. If a provider approved a payment but Cortexia did not credit it, reconcile by provider transaction ID and replay the signed callback or use the approved internal reconciliation procedure. Never credit balances with direct user-table edits.

## Sign-off

The release owner signs off only after the backup ID, migration output, environment-variable checklist, callback registration screenshots/IDs, staging payment evidence, KIE generation evidence, duplicate-callback evidence, and rollback owner are recorded in the launch log.
