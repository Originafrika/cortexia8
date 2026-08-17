# Cortexia8 Merge and Production Deployment Checklist

**Release artifact:** `chore/post-launch-eslint-cleanup`

**Verified head:** `a60444d` — `Enforce quality gates and structured logs`

**Repository:** [`Originafrika/cortexia8`](https://github.com/Originafrika/cortexia8)

**Pull request:** <https://github.com/Originafrika/cortexia8/pull/new/chore/post-launch-eslint-cleanup>

**Deployment target:** Vercel Production, TanStack Start with the Nitro Vercel preset

**Document owner:** Release owner and production operator

**Status:** Ready for merge review; not yet merged into `main` and not yet deployed

> **Release rule:** Do not merge or deploy until the branch checks, database preflight, environment-variable review, provider callback registration, and rollback ownership are all confirmed. The application must never regain a public GET endpoint that mutates database schema.

## 1. Release scope and change summary

This release contains the post-launch ESLint and production-safety cleanup that was completed on the isolated branch. The application source changes remove the public `/run-migration` route, stabilize React hook execution, replace unsafe dynamic-boundary types, remove Fast Refresh and exhaustive-deps findings, introduce explicit release scripts and CI gates, and add structured logging for generation and payment webhook paths.

The branch was verified with a frozen install, unit tests, strict TypeScript, a production build, a production dependency audit, peer-dependency verification, and a clean diff check. The final scoped ESLint result is **0 errors and 0 warnings**. These facts should be rechecked from the exact merge candidate rather than inferred from the branch alone.

| Release item                   | Required decision or evidence                                                                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branch                         | `chore/post-launch-eslint-cleanup` is current with remote and points to `a60444d` or a reviewed descendant.                                                                |
| Merge target                   | `main` in `Originafrika/cortexia8`.                                                                                                                                        |
| Application migration endpoint | `/run-migration` is absent from the route tree and must remain absent after merge.                                                                                         |
| Database migration             | Confirm whether `drizzle/0020_harden_payment_transactions.sql` is already applied. Apply it separately through an authenticated operator if production is still at `0019`. |
| Provider callbacks             | KIE.ai, FedaPay, and Stripe callbacks use HTTPS endpoints and live signing secrets.                                                                                        |
| Deployment                     | Merge to `main`, allow the protected production deployment workflow to run, and verify the resulting Vercel deployment revision.                                           |
| Rollback                       | The previous Vercel deployment, database backup/Neon branch, provider secret rotation process, and named rollback owner are recorded before release.                       |

## 2. Required roles and sign-off

The release owner coordinates the merge and records evidence. The database operator owns the backup, migration preflight, migration execution, and post-migration validation. The payments owner validates FedaPay and Stripe test transactions and reconciles the ledger. The platform owner validates Vercel configuration, webhook registration, generation callbacks, logs, and rollback readiness. One person may hold multiple roles only when that separation is explicitly recorded.

| Role                     | Required sign-off                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Release owner            | PR approval, merge authorization, deployment window, launch log completeness                                  |
| Database operator        | Backup or Neon branch ID, migration preflight, migration output, post-migration SQL validation                |
| Payments owner           | FedaPay and Stripe callback evidence, exactly-once ledger evidence, reconciliation readiness                  |
| Platform owner           | Vercel production revision, environment variables, provider callback URLs, log monitoring, rollback procedure |
| Product or finance owner | Approved `FEDAPAY_XOF_PER_USD` rate and launch package/amount limits                                          |

## 3. Pre-merge preparation

Complete this section before approving the pull request.

### 3.1 Synchronize and inspect the branch

- [ ] Confirm the source branch is clean and points to the reviewed remote head.

  ```bash
  cd /home/ubuntu/cortexia8
  git fetch origin --prune
  git switch chore/post-launch-eslint-cleanup
  git pull --ff-only origin chore/post-launch-eslint-cleanup
  git status --short
  git log --oneline --decorate -8
  ```

- [ ] Confirm the expected implementation commits are present:

  ```text
  d61d804  Remove public migration route
  1113987  Apply mechanical ESLint cleanup
  80374fc  Fix conditional React hooks
  ee8294c  Type dynamic application boundaries
  5801f09  Resolve React module hygiene
  a60444d  Enforce quality gates and structured logs
  ```

- [ ] Confirm no generated `.vercel/output` files, local environment files, credentials, database URLs, or provider secrets are staged.

- [ ] Confirm the branch is based on the latest reviewed `main`. If `main` advanced after the branch was created, update through a pull request or a clean rebase/merge according to repository protection rules, then rerun all gates.

### 3.2 Run the branch release gate

Run these commands from a clean checkout or clean working tree. The `check:release` script performs a frozen install, lint, TypeScript, tests, production build, production audit, and peer verification.

```bash
pnpm run check:release
git diff --check
git status --short
```

The required result is a zero exit code, **0 ESLint errors**, **0 ESLint warnings**, passing tests, a successful Vite/Nitro production build, no high-severity production dependency vulnerabilities, no peer-dependency issues, and an empty working-tree status.

- [ ] `pnpm install --frozen-lockfile` passes.
- [ ] `pnpm run check:lint` passes with zero errors and zero warnings.
- [ ] `pnpm run check:types` passes.
- [ ] `pnpm run check:test` passes.
- [ ] `pnpm run check:build` passes.
- [ ] `pnpm run check:security` reports no known production vulnerabilities.
- [ ] `pnpm run check:peers` reports no peer-dependency issues.
- [ ] `git diff --check` passes.
- [ ] The working tree is clean after verification.

### 3.3 Review the high-risk code changes

- [ ] Confirm `src/routes/run-migration.tsx` and `src/lib/api/run-migration.ts` are absent.
- [ ] Confirm the generated route tree contains no `/run-migration` entry.
- [ ] Confirm `src/routes/migration-safety.test.ts` remains present under the repository’s test-ignore convention and asserts the route is absent.
- [ ] Review the model-playground refactor in `src/routes/app.models.$slug.tsx`; verify hooks are not conditionally skipped.
- [ ] Review `src/lib/db.ts`; confirm the lazy SQL adapter remains compatible with all existing tagged-template SQL call sites.
- [ ] Review `src/lib/api/agent-conversations.ts`; confirm persisted agent proposals are runtime-validated before JSONB storage.
- [ ] Review `src/lib/logger.ts` and the webhook/generation imports; confirm structured logs do not include payment secrets, API keys, raw request bodies, bearer tokens, or unnecessary personal data.
- [ ] Confirm the workflow only has read access to repository contents and does not expose production secrets.

### 3.4 Approve and merge the pull request

Use the pull request as the normal merge path so branch protection, review history, and CI evidence are retained.

- [ ] Open the [Cortexia8 pull request](https://github.com/Originafrika/cortexia8/pull/new/chore/post-launch-eslint-cleanup).
- [ ] Confirm the pull request base is `main` and the head is `chore/post-launch-eslint-cleanup`.
- [ ] Require at least one code review from a maintainer who did not author the final release decision.
- [ ] Confirm the `Changed-file ESLint` job passes.
- [ ] Confirm all required branch-protection checks pass.
- [ ] Confirm no unresolved review comments remain.
- [ ] Confirm the migration-route removal, webhook behavior, payment ledger behavior, and structured logging changes have been explicitly reviewed.
- [ ] Merge using the repository’s protected merge method. A squash merge is acceptable if the release log records the source head `a60444d`; a merge commit is acceptable if preserving the six implementation slices is preferred.
- [ ] Do not use force-pushes or direct edits on `main` during the release window.

## 4. Merge verification on `main`

After the pull request is merged, verify the actual `main` revision before changing production data or provider configuration.

```bash
git fetch origin --prune
git switch main
git pull --ff-only origin main
git status --short
git log -1 --oneline --decorate
pnpm run check:release
```

- [ ] `main` contains the merged cleanup changes.
- [ ] `main` is clean and the full release gate passes from the merged revision.
- [ ] The Vercel deployment associated with the merged `main` revision is identifiable.
- [ ] The deployment is not promoted until the database and environment preflight below is complete.

## 5. Database preflight and migration procedure

The public migration route has been removed. **Do not use an application URL to perform schema changes.** Database work must be executed by an authenticated operator through Neon, `psql`, or the controlled migration runner.

### 5.1 Backup and schema preflight

- [ ] Confirm the intended Neon production project and database.
- [ ] Create a Neon database branch or provider backup/snapshot.
- [ ] Record the backup/branch ID, timestamp, operator, retention period, and restoration procedure in the launch log.
- [ ] Confirm production is already at migration `0019`, or confirm that the earlier migration chain has been applied in lexical order.
- [ ] Do not apply migration `0020` to a database that lacks the earlier schema.

Run these read-only checks against the production database:

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

Expected result: `payment_transactions` exists, the duplicate queries return zero rows, and existing payment rows are available for backfill. **Stop the release if duplicates are found.** Reconcile them before creating unique indexes.

### 5.2 Apply migration `0020` atomically if required

Migration file: `drizzle/0020_harden_payment_transactions.sql`.

Run staging first. Then apply production only after the staging result and backup are recorded:

```bash
export DATABASE_URL='retrieve from the production secret manager; do not commit'
psql "$DATABASE_URL" \
  --single-transaction \
  --set ON_ERROR_STOP=1 \
  --file drizzle/0020_harden_payment_transactions.sql
```

- [ ] The migration was executed by an authenticated operator.
- [ ] The output and execution timestamp are recorded.
- [ ] The migration completed in one transaction.
- [ ] No application GET endpoint was used.
- [ ] No direct edit to `users.credits_balance` was performed.

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

Expected result: all five reconciliation columns exist, `missing_external_references` is zero, and the three reconciliation indexes are present. If migration `0020` is already applied, record the validation output and do not rerun it blindly.

## 6. Production environment configuration

Configure the following values in the Vercel **Production** environment before the application deployment. Set equivalent names in staging with sandbox/test credentials. Never commit values in `.env` files, and never expose server secrets through `VITE_*` variables.

| Variable                  | Required        | Production configuration check                                                                           |
| ------------------------- | --------------- | -------------------------------------------------------------------------------------------------------- |
| `APP_URL`                 | Yes             | Canonical HTTPS origin used for callbacks and redirects, such as `https://cortexia.originafrika.online`. |
| `DATABASE_URL`            | Yes             | Neon Postgres production connection string.                                                              |
| `VITE_NEON_AUTH_URL`      | Yes             | Neon Auth browser endpoint; public client endpoint, not a secret.                                        |
| `KIE_API_KEY`             | Yes             | Live KIE.ai server credential.                                                                           |
| `KIE_API_BASE`            | Optional        | Only set if the live KIE endpoint differs from the code default `https://api.kie.ai`.                    |
| `KIE_WEBHOOK_HMAC_KEY`    | Yes             | Live KIE callback HMAC key.                                                                              |
| `FEDAPAY_SECRET_KEY`      | Mobile money    | Live FedaPay server credential.                                                                          |
| `FEDAPAY_WEBHOOK_SECRET`  | Mobile money    | Secret for the live FedaPay webhook endpoint.                                                            |
| `FEDAPAY_XOF_PER_USD`     | Mobile money    | Product/finance-approved server-owned XOF conversion rate.                                               |
| `VITE_FEDAPAY_PUBLIC_KEY` | Mobile money UI | Live FedaPay Checkout.js public key matching the live account/mode.                                      |
| `STRIPE_SECRET_KEY`       | Card checkout   | Live Stripe server credential.                                                                           |
| `STRIPE_WEBHOOK_SECRET`   | Card checkout   | Live Stripe endpoint signing secret.                                                                     |
| `R2_ENDPOINT`             | Durable assets  | Cloudflare R2 S3-compatible endpoint.                                                                    |
| `R2_ACCESS_KEY_ID`        | Durable assets  | R2 access key ID.                                                                                        |
| `R2_SECRET_ACCESS_KEY`    | Durable assets  | R2 secret access key.                                                                                    |
| `R2_BUCKET`               | Durable assets  | Exact production R2 bucket name.                                                                         |
| `R2_REGION`               | Durable assets  | Usually `auto` for Cloudflare R2 unless the account specifies otherwise.                                 |
| `R2_PUBLIC_BASE_URL`      | Durable assets  | Public HTTPS asset base URL.                                                                             |
| `RESEND_API_KEY`          | Optional        | Required only when launch-day or transactional email flows are enabled.                                  |
| `VITE_LAUNCH_MODE`        | Optional        | `live` or omitted for live behavior; use `waitlist` only for an intentional waitlist deployment.         |

- [ ] Every required variable is present in the Vercel Production environment.
- [ ] FedaPay and Stripe credentials are live only in Production and test credentials remain in staging/test environments.
- [ ] The approved `FEDAPAY_XOF_PER_USD` rate is recorded by product/finance.
- [ ] R2 variable names match the application: `R2_ENDPOINT`, `R2_BUCKET`, and `R2_REGION`; do not use stale aliases.
- [ ] No value is pasted into the PR, launch log, screenshots, or chat transcript.
- [ ] Vercel is configured to redeploy after the final environment-variable change.

## 7. Provider callback registration

Register the exact HTTPS endpoints below in the live provider dashboards. The provider secret must match the Vercel Production environment value. Unsigned, stale, malformed, or mismatched callbacks must not credit accounts.

| Provider | Exact callback URL                                          | Required verification and events                                                                                                                        |
| -------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KIE.ai   | `https://cortexia.originafrika.online/api/webhooks/kie`     | Live `KIE_WEBHOOK_HMAC_KEY`; configure timestamp and signature headers used by the handler.                                                             |
| FedaPay  | `https://cortexia.originafrika.online/api/webhooks/fedapay` | Live `FEDAPAY_WEBHOOK_SECRET` and `X-FEDAPAY-SIGNATURE`; enable approval, decline, cancellation, refund, and update events required for reconciliation. |
| Stripe   | `https://cortexia.originafrika.online/api/webhooks/stripe`  | Live `STRIPE_WEBHOOK_SECRET` and `Stripe-Signature`; subscribe at minimum to the checkout completion event used by the handler.                         |

- [ ] Callback URLs are HTTPS and point to the merged production domain.
- [ ] Provider dashboards show the live endpoint as active.
- [ ] Endpoint IDs or screenshots are recorded without exposing secret values.
- [ ] The provider event redelivery feature is available to the on-call operator.
- [ ] No callback is configured for the removed `/run-migration` route.

## 8. Production deployment sequence

Perform the deployment in a controlled window with the release owner and rollback owner present.

1. [ ] Confirm the merged `main` revision and Vercel deployment target.
2. [ ] Confirm the database backup/Neon branch and migration decision are recorded.
3. [ ] Confirm migration `0020` is applied and validated, or record that it is already present.
4. [ ] Confirm all Vercel Production environment variables are present and correct.
5. [ ] Confirm provider callback registrations are active.
6. [ ] Trigger or approve the Vercel Production deployment from the merged `main` revision.
7. [ ] Wait for Vercel build and deployment completion; record the deployment ID and URL.
8. [ ] Confirm the health page loads and unauthenticated `/app/account` redirects to sign-in.
9. [ ] Confirm no public route exposes `/run-migration`.
10. [ ] Confirm unsigned or malformed requests to `/api/webhooks/kie`, `/api/webhooks/fedapay`, and `/api/webhooks/stripe` are rejected without crediting accounts.
11. [ ] Confirm the structured log stream contains the expected event fields without secrets or raw bodies.

## 9. Staging and production smoke tests

Run staging or provider-test-mode checks before live-money tests. Use the smallest approved credit package for the initial production payment test.

| Test              | Expected evidence                                                                                                                                                                    | Pass |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| Authentication    | `/app/account` redirects unauthenticated users to sign-in; authenticated access works.                                                                                               | [ ]  |
| KIE generation    | One small generation is charged before provider submission, completes through the callback, and stores the expected asset.                                                           | [ ]  |
| KIE redelivery    | Replaying the same signed callback does not duplicate assets or credits.                                                                                                             | [ ]  |
| FedaPay payment   | One sandbox/live-approved payment reaches `/api/webhooks/fedapay`, the transaction becomes `completed`, and one `credits_ledger` row with `payment:<payment_transaction_id>` exists. | [ ]  |
| Stripe payment    | One test/live-approved payment reaches `/api/webhooks/stripe`, the transaction becomes `completed`, and exactly one corresponding ledger row exists.                                 | [ ]  |
| Amount mismatch   | Provider amount/currency mismatch becomes `needs_review` and does not credit the user.                                                                                               | [ ]  |
| Unsigned callback | Missing or invalid signature returns a rejection and creates no credit.                                                                                                              | [ ]  |
| R2 asset flow     | A generated asset is stored and served through the configured public R2 URL.                                                                                                         | [ ]  |
| API portal        | Developer API key creation/revocation and one authenticated API request work.                                                                                                        | [ ]  |
| UI smoke          | Model playground, history, canvas, payment entry points, and account pages load without runtime errors.                                                                              | [ ]  |

Record payment transaction IDs, provider event IDs, KIE task IDs, ledger references, deployment ID, and timestamps. Do not record secret values or raw bearer tokens.

## 10. Monitoring window and launch acceptance

For the first release window, monitor Vercel logs and provider dashboards for payment completion, webhook latency, signature rejection rates, KIE task failures, database errors, R2 errors, 4xx/5xx rates, and duplicate callback attempts.

The release is accepted only when the release owner can answer “yes” to all of the following:

- [ ] The merged deployment is healthy and the deployed revision is recorded.
- [ ] No schema-changing public route exists.
- [ ] The database backup/branch and migration evidence are recorded.
- [ ] All required Production variables are configured and verified by name, not by exposing values.
- [ ] KIE, FedaPay, and Stripe callbacks are active and signature-protected.
- [ ] Staging/test-mode payment and generation evidence is complete.
- [ ] The initial production smoke test is complete or explicitly deferred by the product/finance owner.
- [ ] Duplicate callback and mismatch handling behaved as designed.
- [ ] The rollback owner is on-call and knows the previous Vercel deployment ID.
- [ ] The launch log contains the sign-offs, timestamps, IDs, and evidence links.

## 11. Rollback and incident procedure

### 11.1 Application rollback

If the application fails after deployment but the database migration is healthy, use the Vercel dashboard or approved deployment command to roll back to the previous known-good application deployment. Record the previous deployment ID, operator, timestamp, reason, and resulting URL.

Do not drop migration `0020` columns or indexes during an application rollback. The migration is additive, and the previous application revision should remain compatible with retaining the new database fields. Reconcile any payment or generation events created during the rollback window before returning to normal traffic.

### 11.2 Database migration failure

If `psql --single-transaction --set ON_ERROR_STOP=1` fails, confirm the transaction rolled back, preserve the error output, and do not retry until the preflight issue is understood. If the provider SQL editor was used without a transaction, stop and have the database operator assess partial application against the backup before taking further action.

### 11.3 Provider credential incident

If a provider credential or webhook secret is suspected to be exposed, rotate it in the provider dashboard, update the corresponding Vercel Production variable, redeploy, and review callback and payment records for unexpected activity. Do not disable signature verification to keep traffic flowing.

### 11.4 Payment or credit discrepancy

If a provider shows an approved payment but Cortexia did not credit the user, reconcile by provider transaction ID, payment reference, and provider event ID. Replay the signed provider callback or use the approved internal reconciliation procedure. Never edit `users.credits_balance` directly; corrections must go through `credits_ledger` and the atomic credit helper.

## 12. Evidence and sign-off record

Complete this record in the launch log or issue attached to the release.

| Evidence                               | Value or link                | Owner                   | Complete |
| -------------------------------------- | ---------------------------- | ----------------------- | -------- |
| Pull request URL                       |                              | Release owner           | [ ]      |
| Merged `main` SHA                      |                              | Release owner           | [ ]      |
| Vercel deployment ID/URL               |                              | Platform owner          | [ ]      |
| Database backup/Neon branch ID         |                              | Database operator       | [ ]      |
| Migration output and validation        |                              | Database operator       | [ ]      |
| Environment-variable review            | Names only; no secret values | Platform owner          | [ ]      |
| KIE endpoint registration              | Endpoint ID or screenshot    | Platform owner          | [ ]      |
| FedaPay endpoint registration          | Endpoint ID or screenshot    | Payments owner          | [ ]      |
| Stripe endpoint registration           | Endpoint ID or screenshot    | Payments owner          | [ ]      |
| FedaPay smoke-test transaction         | Transaction/event/ledger IDs | Payments owner          | [ ]      |
| Stripe smoke-test transaction          | Transaction/event/ledger IDs | Payments owner          | [ ]      |
| KIE generation smoke test              | Task/run/asset IDs           | Platform owner          | [ ]      |
| Duplicate callback test                | Evidence link                | Payments/platform owner | [ ]      |
| Rollback owner and previous deployment |                              | Release owner           | [ ]      |
| Final release decision                 | Go / No-go                   | Release owner           | [ ]      |

## References

[1]: ./LIVE-CUTOVER-CHECKLIST.md "Cortexia8 Live Cutover Checklist"
[2]: ./PRODUCTION-RUNBOOK.md "Cortexia8 Production Runbook"
[3]: ./POST-LAUNCH-ESLINT-DETAILED-TASK-BREAKDOWN-PLAN.md "Cortexia8 Detailed ESLint Cleanup Task Breakdown"
[4]: https://docs.kie.ai/common-api/webhook-verification "KIE.ai Webhook Security Verification"
[5]: https://docs.fedapay.com/integration-api/en/webhooks-en "FedaPay Webhooks and Events"
[6]: https://docs.stripe.com/webhooks "Stripe Webhooks"
