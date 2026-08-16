## Cover
Cortexia8 Production Readiness
Stakeholder status, cutover plan, and post-launch priorities
August 2026

## Slide 1
### Release candidate is technically hardened, but cutover still needs two operator controls

- **Status:** Release candidate validated at commit `d4a95f8` and pushed to `main`.
- **Green gates:** Frozen install, 8 unit tests, strict TypeScript, production build, dependency audit, and peer dependency check.
- **Cutover blockers:** Disable or protect the legacy `/run-migration` route and align production environment documentation with the source names.
- **Decision requested:** Approve staging verification and a controlled production cutover after the P0 controls are recorded.

## Slide 2
### The launch-critical foundation is now materially stronger

- Credits are reserved before provider submission, with idempotent refunds and terminal-state protections.
- Payment orders are server-owned, amount-validated, and reconciled through provider event IDs and unique references.
- KIE, FedaPay, and Stripe callbacks verify signatures and prevent duplicate crediting.
- CSRF protection, expanded server type-checking, reproducible installs, and dependency security remediation are in place.

## Slide 3
### Validation evidence supports a release-candidate decision

| Gate | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passed |
| Unit tests | 3 files, 8 tests passed |
| Strict TypeScript | Passed |
| Production build | Passed |
| Production dependency audit | No known vulnerabilities |
| Peer dependency check | No peer dependency issues |
| Public UI smoke test | Landing route passed; account route redirects to sign-in |

## Slide 4
### The main remaining risk is operational, not core application compilation

- `/run-migration` is a legacy public GET route that mutates the database and is not an acceptable production migration mechanism.
- The original runbook used stale R2 names; the source uses `R2_ENDPOINT`, `R2_BUCKET`, and `R2_REGION`.
- Live provider credentials, webhook registrations, backup evidence, and staging payment/generation evidence still need operator sign-off.
- Full repository lint remains noisy and should become a post-launch cleanup track rather than delaying the hardened release candidate.

## Slide 5
### Post-launch cleanup is large but mostly separable from launch risk

- **722 ESLint findings:** 709 errors and 13 warnings.
- **664 errors are auto-fixable:** the dominant category is Prettier formatting drift.
- **21 explicit-any matches:** concentrated in auth, canvas agent flows, workflow APIs, database helpers, and model routes.
- **Operational debt:** 58 `console.error`, 17 `console.log`, and 1 `console.warn`; logs need correlation IDs and redaction.
- **Priority order:** P0 route/environment controls → P1 auth/types/hooks/logging → P2 formatting and CI → P3 package/i18n/copy cleanup.

## Slide 6
### Migration 0020 is additive, atomic, and must be applied outside the browser

1. Back up production or create a Neon branch and confirm the database is at migration `0019`.
2. Run duplicate preflight queries for provider transaction IDs and external references.
3. Apply `drizzle/0020_harden_payment_transactions.sql` with `psql --single-transaction --set ON_ERROR_STOP=1` or the Neon SQL Editor.
4. Verify five new columns, zero missing external references, and the three reconciliation indexes.
5. Deploy the reviewed application only after staging has completed the same migration and rollback drill.

## Slide 7
### Production configuration must separate server secrets from browser-visible keys

- **Core:** `APP_URL`, `DATABASE_URL`, `VITE_NEON_AUTH_URL`.
- **AI gateway:** `KIE_API_KEY`, optional `KIE_API_BASE`, `KIE_WEBHOOK_HMAC_KEY`.
- **Mobile money:** `FEDAPAY_SECRET_KEY`, `FEDAPAY_WEBHOOK_SECRET`, `FEDAPAY_XOF_PER_USD`, `VITE_FEDAPAY_PUBLIC_KEY`.
- **Cards:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- **Assets:** `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_REGION`, `R2_PUBLIC_BASE_URL`.
- **Optional controls:** `RESEND_API_KEY`, `VITE_LAUNCH_MODE`.

## Slide 8
### Webhooks are the financial and generation source of truth

| Provider | Endpoint | Control |
| --- | --- | --- |
| KIE.ai | `/api/webhooks/kie` | HMAC-SHA256 using task ID and timestamp headers |
| FedaPay | `/api/webhooks/fedapay` | Endpoint secret, signed timestamp, duplicate-event handling |
| Stripe | `/api/webhooks/stripe` | Raw-body verification using `Stripe-Signature` and endpoint secret |

- Register only live HTTPS endpoints with live secrets.
- Test unsigned callbacks, provider redelivery, mismatched amounts, and duplicate events.
- Monitor callback latency and provider retry rates during the first release window.

## Slide 9
### The cutover should be staged, observable, and reversible

- **Before deploy:** backup, migration evidence, environment checklist, callback registration, and rollback owner.
- **Staging:** one FedaPay sandbox payment, one Stripe test payment, one KIE generation, one callback redelivery.
- **Production canary:** start with a small credit package; verify one completed payment and exactly one ledger credit.
- **Rollback:** revert the Vercel application revision if needed; retain additive database columns and indexes; never edit balances directly.
- **Incident rule:** rotate compromised provider secrets, redeploy, and reconcile by provider transaction ID.

## Slide 10
### Stakeholder decision: approve a controlled launch after P0 sign-off

- **Now:** remove/protect `/run-migration`, update the runbook, and record the migration backup and environment checklist.
- **Next:** complete staging payment, callback, generation, refund, and duplicate-delivery evidence.
- **Then:** deploy the canary, monitor payment/webhook/generation metrics, and expand traffic only after the first release window remains stable.
- **Post-launch:** schedule the ESLint autofix pass, auth/type cleanup, structured logging, and staging integration suite as separate maintenance increments.

**Recommended decision:** approve the cutover plan with the P0 controls as explicit go/no-go gates.

## Slide 11
### References and operator documents

- [1] [KIE.ai Webhook Security Verification](https://docs.kie.ai/common-api/webhook-verification)
- [2] [FedaPay Webhooks and Events](https://docs.fedapay.com/integration-api/en/webhooks-en)
- [3] [Stripe Webhooks](https://docs.stripe.com/webhooks)
- `LIVE-CUTOVER-CHECKLIST.md` — exact migration, environment, callback, verification, and rollback procedure.
- `POST-LAUNCH-BACKLOG.md` — prioritized ESLint and technical-debt cleanup register.
