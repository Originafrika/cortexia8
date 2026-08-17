# Cortexia8 Post-Launch ESLint Sprint Plan

## Executive recommendation

Treat the 722 findings as **five different work types**, not one large cleanup ticket. The first sprint should close the remaining production-safety control around the legacy migration route. The second should be a mechanical formatting pass. The third should address the 23 rules-of-hooks errors concentrated in the model-detail route, because those findings can represent real conditional-hook runtime defects. The fourth should remove explicit `any` from authentication and provider-boundary code. The fifth should finish React Refresh warnings, enforce the clean lint gate, and absorb the adjacent logging/observability debt.

This sequencing keeps functional changes reviewable, prevents a giant auto-fix diff from obscuring security work, and gives the team an immediate measurable reduction after each sprint.

## Baseline from the current repository

The current lint run covers `src`, `server`, `vite.config.ts`, and `eslint.config.js`. It reports **722 findings: 709 errors and 13 warnings**. The rule distribution is:

| Rule | Findings | Autofixable | Files affected | Primary risk |
| --- | ---: | ---: | ---: | --- |
| `prettier/prettier` | 658 | 658 | 57 | Reviewability and inconsistent formatting; low direct runtime risk |
| `react-hooks/rules-of-hooks` | 23 | 0 | 2 | Potential conditional-hook runtime behavior; high functional risk |
| `@typescript-eslint/no-explicit-any` | 21 | 0 | 8 | Weak contracts at auth, model, agent, database, and provider boundaries |
| `react-refresh/only-export-components` | 9 | 0 | 9 | Development Fast Refresh and module-boundary hygiene |
| `@typescript-eslint/prefer-as-const` | 6 | 6 | 6 | Low-risk type-style cleanup |
| `react-hooks/exhaustive-deps` | 4 | 0 | 4 | Possible stale closures and inconsistent UI state |
| `no-empty` | 1 | 0 | 1 | Silent authentication failure path |
| **Total** | **722** | **664** | — | — |

The 664 autofixable findings are the 658 Prettier findings plus six `prefer-as-const` findings. After a clean mechanical pass, the remaining functional and hygiene backlog should be **58 findings**: 23 hook-order errors, 21 explicit-any errors, 9 Fast Refresh warnings, 4 dependency warnings, and 1 empty-block error. The earlier repository scan also found 76 console calls—58 `console.error`, 17 `console.log`, and 1 `console.warn`—which are adjacent operational debt but not included in the 722 lint total.

## Sprint sequence

### Sprint 0 — P0 production-safety close-out

**Timebox:** one day before the next production traffic expansion. **Primary owners:** platform/backend engineer and release owner.

This sprint is not a lint-count reduction sprint; it prevents the code-quality work from being performed on top of an unsafe operational path. Remove the public `/run-migration` route from the production route tree, or replace it with an authenticated operator-only server control that is disabled by default. Confirm the corrected production runbook uses `R2_ENDPOINT`, `R2_BUCKET`, and `R2_REGION`. Add a regression check that unauthenticated requests cannot execute schema-changing work.

**Exit gate:** the route is absent or access-controlled in the deployed build, the release runbook is source-correct, and the smoke test proves an unauthenticated request cannot mutate the database.

### Sprint 1 — Mechanical formatting and trivial type cleanup

**Timebox:** one day. **Primary owners:** any frontend engineer; review by the code owner. **Expected reduction:** 664 findings, leaving approximately 58.

Run the formatter and ESLint autofix in a dedicated branch and commit. The dominant file clusters are `src/lib/i18n.ts` with 134 findings, `src/routes/app.models.$slug.tsx` with 103, `src/lib/models-data.ts` with 83, `src/lib/api/run-migration.ts` with 57, `src/components/credit-simulator.tsx` with 54, and `src/components/models-wall.tsx` with 29. Do not combine this diff with functional refactors, payment changes, auth changes, or migration-route changes.

Use the sequence below so the change remains reviewable:

```bash
pnpm exec eslint src server vite.config.ts eslint.config.js --fix
pnpm exec prettier --check src server vite.config.ts eslint.config.js
pnpm test
pnpm exec tsc --noEmit
pnpm exec vite build
```

**Exit gate:** zero Prettier and `prefer-as-const` findings, no changed behavior in the unit suite, and a clean production build. If autofix changes a functional expression or generated data file unexpectedly, revert that hunk and create a focused follow-up ticket.

### Sprint 2 — Model-playground hook correctness

**Timebox:** two to three days. **Primary owners:** frontend engineer familiar with TanStack/React; QA reviewer. **Expected reduction:** 23 `react-hooks/rules-of-hooks` findings plus one related hook-dependency warning and one model-route `any` finding.

The highest-risk cluster is `src/routes/app.models.$slug.tsx`. `ModelPlaygroundContent` returns early for the admin-only gate before declaring state, refs, effects, store selectors, and memoized hooks. The fix should split the access gate from the stateful playground: keep the permission check in a wrapper and render a separate component whose hooks are called on every render in stable order. Do not silence the rule or move hooks conditionally.

Then resolve the `useMemo` dependency warning for `model.category`, and remove the model-detail route’s remaining explicit-any with a typed model-parameter or provider-response contract. Add tests for an admin-only model, a normal image/video model, a text model, a model switch, and a transition from unauthorized to authorized state.

**Exit gate:** zero `react-hooks/rules-of-hooks` findings, zero `react-hooks/exhaustive-deps` findings in the touched files, no lint disables added, and browser smoke tests cover the model-detail flows that previously crossed the conditional return.

### Sprint 3 — Authentication and dynamic-boundary type safety

**Timebox:** three to four days. **Primary owners:** backend/platform engineer for auth and DB; frontend engineer for agent/playground types. **Expected reduction:** 21 explicit-any findings and one `no-empty` finding.

Work in security-sensitive file groups rather than by line count:

| Workstream | Files | Findings | Required approach |
| --- | --- | ---: | --- |
| Authentication | `src/routes/auth.$pathname.tsx` | 6 `any` + 1 empty block | Define the Neon Auth verification response type, make fallback behavior explicit, and test sign-in, OTP verification, error, and session-cookie paths. |
| Database boundary | `src/lib/db.ts` | 4 `any` | Use typed query results and `unknown` for external values; validate before persistence. No weakening of transaction or authorization logic. |
| Agent planning/application | `src/components/canvas/agent-panel.tsx`, `src/lib/api/agent-apply.ts`, `src/lib/api/agent-conversations.ts` | 8 `any` | Define discriminated unions for agent plans, node operations, and provider responses; validate server input with Zod. |
| Workflow/playground parameters | `src/lib/api/workflows.ts`, `src/components/playground/param-editor.tsx` | 2 `any` | Type parameter specifications and use a safe `unknown` narrowing helper instead of casting. |
| Model route | `src/routes/app.models.$slug.tsx` | 1 `any` | Reuse the model parameter/provider response contract created in Sprint 2. |

**Exit gate:** zero `@typescript-eslint/no-explicit-any` findings, zero `no-empty` findings, no new `@ts-ignore` or eslint-disable directives, strict TypeScript passing, and focused auth/agent/workflow tests passing.

### Sprint 4 — React module hygiene and remaining hook dependencies

**Timebox:** two days. **Primary owners:** frontend engineer. **Expected reduction:** 9 `react-refresh/only-export-components` warnings and any remaining `react-hooks/exhaustive-deps` warnings.

Move constants, helper functions, and context factories out of component modules where Fast Refresh warns. The affected modules include `node-params.tsx`, `onboarding-overlay.tsx`, `ui/badge.tsx`, `ui/button.tsx`, `ui/form.tsx`, `ui/sidebar.tsx`, `ui/theme-toggle.tsx`, `ui/toggle.tsx`, and `app.models.$slug.tsx`. For the four dependency warnings, resolve dependencies individually: `t` in the developers and history routes, `model.category` in the model route, and `loadedRef` in the canvas route. Do not blanket-disable the hooks rule.

**Exit gate:** zero `react-refresh/only-export-components` warnings, zero `react-hooks/exhaustive-deps` warnings, Fast Refresh still works in local development, and the public landing, account gate, models, history, canvas, and auth smoke tests pass.

### Sprint 5 — Clean lint gate, logging, and release automation

**Timebox:** two to three days. **Primary owners:** platform/release engineer, with one frontend and one backend reviewer. **Expected reduction:** the remaining lint count reaches zero; adjacent operational debt becomes tracked and measurable.

Add a release-oriented script set instead of relying on an undocumented command sequence. Recommended scripts are `check:lint`, `check:types`, `check:test`, `check:build`, `check:security`, and `check:release`. Make the full lint command pass on the repository, then add a changed-file lint check to pull requests so the backlog cannot regrow.

In the same sprint, start the structured logging migration, but keep it separate from the lint-zero commit if the diff grows. Replace raw console calls in payment, webhook, generation, and auth paths with redacted structured events containing request ID, provider event ID, KIE task ID, user ID where appropriate, severity, and duration. Never log authorization headers, signatures, secret values, or sensitive prompt/payment payloads.

**Exit gate:** full ESLint returns zero findings, the release script passes frozen install/tests/types/build/security, changed-file lint is enforced in CI, and payment/webhook/generation logs are searchable by correlation identifiers.

## Merge and ownership strategy

Use one branch per sprint and one conceptual commit per work type. Sprint 1 should be a formatting-only commit. Sprints 2 and 3 should be reviewed by the code owner for the affected runtime boundary. Sprint 5 should not be merged until release checks pass in a clean environment.

The recommended ownership split is straightforward: frontend owns Sprints 2 and 4, platform/backend owns Sprint 0 and the auth/database portions of Sprint 3, and release engineering owns Sprint 5. QA should maintain the regression matrix across model detail, auth, account/payment, developers, history, canvas, and webhooks.

## Quality gates and measurement

| Gate | Required result | Release implication |
| --- | --- | --- |
| After Sprint 0 | Legacy migration route closed or operator-protected | Mandatory before production traffic expansion |
| After Sprint 1 | 0 formatting and `prefer-as-const` findings | Safe to begin functional lint cleanup |
| After Sprint 2 | 0 rules-of-hooks findings; model-detail regression tests pass | Required before changing model catalog traffic or adding new model UI |
| After Sprint 3 | 0 explicit-any and `no-empty` findings; auth/agent tests pass | Required before auth or API-boundary changes are released |
| After Sprint 4 | 0 hook-dependency and Fast Refresh warnings | Required for frontend lint gate |
| After Sprint 5 | 0 total ESLint findings and CI enforcement | New baseline; any regression blocks merge |

## What not to do

Do not run `eslint --fix` and merge the entire diff without review. Do not resolve hook-order errors by adding rule disables. Do not replace `any` with `unknown` without narrowing and tests. Do not combine formatting with payment, migration, auth, or provider-webhook logic. Do not treat a green lint run as evidence that live FedaPay, Stripe, KIE, migration, or rollback behavior has been tested; those remain separate staging and production-operational gates.
