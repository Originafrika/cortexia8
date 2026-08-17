# Cortexia8 Production Runbook

## Release gate

Deploy only after the following commands pass from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm exec tsc --noEmit
pnpm exec vite build
```

The repository’s full ESLint command currently includes a pre-existing formatting backlog outside the launch-critical changes. New production code should still be formatted and reviewed before merge.

## Required production environment

| Variable                                                                                                                                                                               | Required                   | Purpose                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `APP_URL`                                                                                                                                                                              | Yes                        | Canonical HTTPS URL used for provider callbacks and redirects                                                         |
| `DATABASE_URL`                                                                                                                                                                         | Yes                        | Neon Postgres connection string                                                                                       |
| `VITE_NEON_AUTH_URL`                                                                                                                                                                   | Yes                        | Neon Auth client endpoint                                                                                             |
| `KIE_API_KEY`                                                                                                                                                                          | Yes                        | KIE.ai model gateway credential                                                                                       |
| `KIE_WEBHOOK_HMAC_KEY`                                                                                                                                                                 | Yes                        | KIE callback signature verification key                                                                               |
| `FEDAPAY_SECRET_KEY`                                                                                                                                                                   | Yes for mobile money       | Server-side FedaPay API credential                                                                                    |
| `FEDAPAY_WEBHOOK_SECRET`                                                                                                                                                               | Yes for mobile money       | FedaPay endpoint signing secret                                                                                       |
| `FEDAPAY_XOF_PER_USD`                                                                                                                                                                  | Yes for mobile money       | Server-owned XOF conversion rate; set deliberately and review periodically                                            |
| `VITE_FEDAPAY_PUBLIC_KEY`                                                                                                                                                              | Yes for mobile money UI    | Browser Checkout.js public key                                                                                        |
| `STRIPE_SECRET_KEY`                                                                                                                                                                    | Yes for card checkout      | Server-side Stripe API credential                                                                                     |
| `STRIPE_WEBHOOK_SECRET`                                                                                                                                                                | Yes for card checkout      | Stripe endpoint signing secret                                                                                        |
| `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_REGION`, `R2_PUBLIC_BASE_URL`                                                                              | Yes for durable assets     | Cloudflare R2 S3-compatible storage configuration; these names match `src/lib/storage/r2.ts`                          |
| `RESEND_API_KEY`                                                                                                                                                                       | Optional                   | Transactional email delivery for launch-day flows                                                                     |
| `VITE_LAUNCH_MODE`                                                                                                                                                                     | Optional                   | Set to `live` or omit for live behavior; set to `waitlist` only for an intentional waitlist deployment                |
| `VITE_CAPABILITY_WORKFLOWS`, `VITE_CAPABILITY_CANVAS`, `VITE_CAPABILITY_DEVELOPERS`, `VITE_CAPABILITY_AGENT`, `VITE_CAPABILITY_TEXT`, `VITE_CAPABILITY_AUDIO`, `VITE_CAPABILITY_MUSIC` | Yes for client readiness   | Set each to `disabled`, `beta`, or `ready`; keep unfinished journeys disabled until staging evidence is recorded      |
| `CAPABILITY_WORKFLOWS`, `CAPABILITY_CANVAS`, `CAPABILITY_DEVELOPERS`, `CAPABILITY_AGENT`, `CAPABILITY_TEXT`, `CAPABILITY_AUDIO`, `CAPABILITY_MUSIC`                                    | Yes for server enforcement | Server-side equivalents of the client switches; keep them aligned so direct requests cannot bypass readiness controls |

Capability switches default to `disabled` when omitted. Do not enable `ready` in production until the corresponding staging journey, provider endpoint, persistence, and payment evidence has been signed off. Do not commit any value for these variables. Store them in the production deployment provider and keep sandbox and live provider credentials separate.

## Database migration order

The legacy `/run-migration` route and its schema-mutating server function have been removed from the production route tree. Do not reintroduce an application GET endpoint for migrations. Confirm the production database is already at migration `0019`, take a backup or Neon branch, run the preflight duplicate checks, and apply `0020_harden_payment_transactions.sql` atomically with `psql --single-transaction --set ON_ERROR_STOP=1 --file drizzle/0020_harden_payment_transactions.sql` or the Neon SQL Editor. Run the same process against staging first. The migration backfills `external_reference`, adds provider event/status and metadata fields, and creates unique reconciliation indexes. The complete operator sequence is in `LIVE-CUTOVER-CHECKLIST.md`.

## Provider callback endpoints

Register only the HTTPS endpoints below in the live provider dashboards. KIE.ai and FedaPay callbacks must use their live signing secrets; Stripe must use the live endpoint signing secret. Unsigned callbacks must never credit accounts.

Configure the following HTTPS endpoints in the provider dashboards:

| Provider | Endpoint                | Required verification                                   |
| -------- | ----------------------- | ------------------------------------------------------- |
| KIE.ai   | `/api/webhooks/kie`     | `KIE_WEBHOOK_HMAC_KEY` with the provider’s HMAC headers |
| FedaPay  | `/api/webhooks/fedapay` | `FEDAPAY_WEBHOOK_SECRET` and `X-FEDAPAY-SIGNATURE`      |
| Stripe   | `/api/webhooks/stripe`  | `STRIPE_WEBHOOK_SECRET` and `Stripe-Signature`          |

KIE callback verification uses the provider’s task ID and timestamp signature contract [1]. FedaPay webhook verification uses the endpoint secret and the signed timestamp header [2]. Stripe verification uses the signed raw request body and replay tolerance.

## Payment release procedure

First deploy the database migration and confirm that `payment_transactions.external_reference` is populated and unique. Then deploy the application with webhook secrets configured. Create a small staging payment in FedaPay sandbox and Stripe test mode, confirm that the provider callback reaches the corresponding endpoint, confirm one `payment_transactions` row reaches `completed`, and confirm exactly one `credits_ledger` row exists with reference `payment:<payment_transaction_id>`.

For a live release, start with a small credit package, monitor payment and webhook error rates, and keep manual reconciliation available. A provider callback with an amount, currency, merchant reference, or payment order mismatch is marked `needs_review` and must not credit the account automatically.

## Incident actions

If a provider callback is failing, do not disable signature verification. Check the deployment logs for the provider event ID, confirm the endpoint secret belongs to the live endpoint, and use the provider’s redelivery feature after the application error is corrected. If a payment is approved at the provider but not credited, reconcile the provider transaction ID against `payment_transactions`, then replay the callback or run the approved internal reconciliation procedure. Never credit an account by editing `users.credits_balance` directly; use `credits_ledger` and the atomic transaction helper.

If a provider credential is suspected to be exposed, rotate it at the provider, update the deployment secret, redeploy, and review callback and payment records for unexpected activity.

## References

[1]: https://docs.kie.ai/common-api/webhook-verification "KIE.ai Webhook Security Verification"
[2]: https://docs.fedapay.com/integration-api/en/webhooks-en "FedaPay Webhooks and Events"
[3]: https://docs.stripe.com/webhooks "Stripe Webhooks"
