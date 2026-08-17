# Cortexia8 Staging Readiness Decision

**Decision:** **Conditional go for staging deployment; no unconditional production go yet.**

The cleanup branch is technically deployable and has passed the repository quality gates after the capability-readiness, registry, multimodal, creator-mode, pricing, and public-experience remediation slices. Production cutover remains conditional on executing the live staging journeys listed below with real Neon, KIE.ai, Cloudflare R2, FedaPay, Stripe, and Better Auth configuration.

## Evidence from the cleanup branch

| Area                     | Evidence                                                                                                                                                              | Result                                                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Capability access policy | `src/lib/capabilities.ts`, readiness UI, server-side modality and creator gates                                                                                       | Pass; unfinished capabilities default to disabled and can be opened as `ready` or `beta` after verification                                            |
| KIE registry             | `scripts/kie-endpoint-contract.ts`, `scripts/kie-endpoint-contract.test.ts`, `KIE-PROVIDER-CONTRACT-NOTES.md`                                                         | Pass; all documented endpoint paths normalize to catalogue identifiers, with explicit allowlists for reviewed catalogue-only and duplicate identifiers |
| Agent model registry     | `src/lib/agent.ts` and the registry contract test                                                                                                                     | Pass; agent options are derived from active text catalogue entries and provider calls use the catalogue KIE endpoint                                   |
| Multimodal playground    | `src/routes/app.models.$slug.tsx`, `prompt-bar.tsx`, `result-view.tsx`, `history-grid.tsx`                                                                            | Pass in static/build validation; audio text fields use the primary composer and music/audio outputs render as playable media                           |
| Creator mode             | `canvas-graph-ops.ts`, `canvas-run.ts`, `agent-apply.ts`                                                                                                              | Pass in static/build validation; ownership, active-model, capability, and same-workflow edge checks are enforced before mutation or execution          |
| Pricing                  | `nodeCostUsd`, public `/v1/generate`, public `/v1/workflows/run`, `src/lib/api/shared.test.ts`                                                                        | Pass; image, duration, character, and token-budget pricing share the same helper and have regression coverage                                          |
| Public experience        | Landing count derives from the capability-filtered active catalogue; simulator voice rows derive from active audio entries; public copy describes staged verification | Pass in build validation                                                                                                                               |
| Payments                 | FedaPay handles Mobile Money; Stripe handles card and the intentional crypto/Alipay routing                                                                           | Code path preserved; provider-account support still requires live staging verification                                                                 |

## Automated gate results

| Gate                                         |                                                             Result |
| -------------------------------------------- | -----------------------------------------------------------------: |
| Strict TypeScript (`pnpm exec tsc --noEmit`) |                                                               Pass |
| ESLint over `src` and `server`               |                            Pass; zero findings in the launch scope |
| Vitest                                       |                                 Pass; 20 tests across 6 test files |
| Production build                             |                   Pass; Vercel/Nitro output generated successfully |
| Build warnings                               | Non-blocking chunk-size warning for existing large auth/UI bundles |
| Working tree                                 |                                       Clean after commit `018f6fd` |

## Required live staging journeys

A staging operator must run these journeys with real environment variables before enabling any unfinished capability. First, complete sign-up, sign-in, session restoration, onboarding completion, and sign-out using a new test account. Second, verify the model catalogue and open only the capability flags whose provider routes, result ingestion, storage, and billing have passed. Third, submit one image, one video, one audio, one music, and one text generation where each corresponding capability is enabled, and confirm that the UI result, history tile, durable asset, webhook status, and credit ledger agree.

The operator must then create a workflow as a normal non-admin user, add two active models, connect them, save and reload the workflow, run it, inspect node-level status, and verify that an unrelated user cannot read, modify, or execute the workflow. The agent journey must be tested separately: propose a graph, run the dry-run estimate, confirm the threshold dialog, apply the plan, reload the persisted graph, and verify that a failed provider submission refunds the reserved debit.

Finally, run one Mobile Money top-up through FedaPay and one Stripe checkout for card. Run the intentional crypto and Alipay Stripe routes only if the Stripe account is configured for the intended methods; verify that the checkout method, webhook metadata, amount, currency, idempotency reference, and ledger credit are correct. Do not classify the crypto/Alipay Stripe routing as a defect merely because it does not use FedaPay.

## Release decision and capability switch policy

The branch is suitable for staging deployment and stakeholder review. The production decision should be recorded as **Go** only after the live journeys above pass and the operator has updated the capability switches in Vercel for the verified capabilities. Keep every unverified capability at `disabled`; use `beta` only when the journey is operational but intentionally controlled. The payment provider account checks and live webhook tests are release blockers because they cannot be established by repository-only tests.

## References

- `PRODUCTION-RUNBOOK.md` — environment, migration, and operator procedures.
- `LIVE-CUTOVER-CHECKLIST.md` — live deployment verification checklist.
- `CAPABILITY-READINESS-MATRIX.md` — capability-by-capability readiness state.
- `UNFINISHED-CAPABILITIES-REMEDIATION-PLAN.md` — approved remediation phases.
- `KIE-PROVIDER-CONTRACT-NOTES.md` — provider documentation review and endpoint normalization decisions.
- `MERGE-AND-DEPLOYMENT-CHECKLIST.md` — cleanup-branch merge and deployment steps.
