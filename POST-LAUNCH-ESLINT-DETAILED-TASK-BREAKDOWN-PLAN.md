# Plan: Create the Detailed Cortexia8 ESLint Task Breakdown

## Goal

Create and deliver a ticket-ready implementation breakdown for the Cortexia8 post-launch technical-debt cleanup. The breakdown will expand the committed six-sprint roadmap into individually actionable tasks with IDs, dependencies, affected files, suggested ownership, effort estimates, implementation notes, test requirements, acceptance criteria, and release gates.

The work is planning-only until approval. No source code, CI configuration, production routes, database migrations, or external systems will be changed during this planning phase.

## Starting context and assumptions

The repository is `Originafrika/cortexia8`, currently on `main` at commit `4e42abf`, with the high-level plan already committed as `POST-LAUNCH-ESLINT-SPRINT-PLAN.md`. The baseline to preserve in the detailed breakdown is **722 ESLint findings: 709 errors and 13 warnings**. The distribution is 658 Prettier findings, 23 rules-of-hooks findings, 21 explicit-`any` findings, 9 Fast Refresh warnings, 6 `prefer-as-const` findings, 4 exhaustive-deps warnings, and 1 empty-block finding.

The detailed breakdown will assume one frontend engineer, one backend/platform engineer, one release owner, and shared QA/code-owner review. Estimates will be expressed as focused engineering days and are planning estimates rather than commitments. Sprint tasks will be kept independently mergeable wherever practical.

## Validated execution baseline

The repository currently has one untracked planning file and is otherwise clean at commit `4e42abf` on `main`. The package scripts expose `lint`, `test`, `build`, and `format`; the scoped baseline command below avoids unrelated paths while matching the configured source surface:

```bash
pnpm exec eslint src server vite.config.ts eslint.config.js -f json
pnpm test
pnpm exec tsc --noEmit
pnpm exec vite build
```

The scoped ESLint run reproduced **722 findings: 709 errors and 13 warnings**. The rule counts and top file clusters match the committed high-level plan. This command should be retained as the baseline measurement until Sprint 5 adds the explicit `check:*` scripts. The broad `pnpm lint` script remains the eventual repository-wide gate, but its current `eslint .` invocation should be validated in CI after the scoped cleanup is complete.

## Phase 1 — Reconfirm scope and establish the execution baseline

### T1.1 — Capture repository and lint baseline

Record the repository commit, working-tree state, lint command, rule counts, and the top affected file clusters. The task should preserve the baseline artifact used to measure progress after each sprint.

**Deliverables:** a baseline section in the detailed breakdown and a repeatable command sequence for lint, type-check, tests, and production build.

**Acceptance criteria:** another engineer can reproduce the initial count and distinguish formatting findings from functional findings.

### T1.2 — Define task metadata and ticket convention

Use stable task IDs in the format `S0-Tn` through `S5-Tn`. Every task entry must include sprint, priority, owner, estimate, dependencies, affected files, implementation intent, tests, and acceptance criteria. Mark tasks that are release-blocking separately from tasks that are post-launch quality improvements.

**Acceptance criteria:** tasks are small enough for a pull request or a clearly bounded stacked change, and no task has an implicit dependency that is not recorded.

### T1.3 — Define the regression matrix

Create a matrix covering migration-route access, authentication, model detail, model switching, image/video/text generation, history, canvas, agents, workflows, payment/account surfaces, webhook behavior, and development Fast Refresh. Map each later task to the subset of this matrix it can affect.

**Acceptance criteria:** each functional task has at least one focused regression check and one relevant release-level check.

### Regression matrix

| Surface          | Focused check                                                                                                       | Release-level check                                               | Tasks              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------ |
| Migration route  | Deny unauthenticated, ordinary-user, and disabled-mode execution; allow only approved operator behavior if retained | Production build contains no public schema-changing endpoint      | S0-T1–S0-T4        |
| Authentication   | Sign-in, OTP, invalid input, provider error, redirect, and cookie behavior                                          | Auth smoke test and strict TypeScript                             | S3-T2, S4-T4       |
| Model detail     | Admin gate, normal model render, model switch, text session, generation submit                                      | Models route browser smoke test                                   | S2-T1–S2-T5        |
| History/canvas   | Effect dependency behavior, loading, persisted state, agent interactions                                            | History and canvas smoke tests                                    | S3-T4, S4-T3–S4-T4 |
| Agents/workflows | Valid and invalid plan operations, provider errors, parameter narrowing                                             | Agent/workflow smoke or API checks                                | S3-T4–S3-T6        |
| Payment/webhooks | No behavior changes or secret leakage in touched paths                                                              | Staging FedaPay, Stripe, KIE callbacks and duplicate-event checks | S1-T2, S5-T4–S5-T5 |
| Fast Refresh     | State preservation after module extraction                                                                          | Local development refresh check                                   | S4-T1–S4-T4        |

## Phase 2 — Break down Sprint 0: production-safety close-out

### S0-T1 — Inventory all migration-route entry points

Search route definitions, server handlers, navigation links, deployment configuration, and documentation for `/run-migration` and related schema-changing controls. Identify whether the route is public, authenticated, admin-only, or build-time-only in the current implementation.

**Owner:** backend/platform engineer. **Estimate:** 0.25 day. **Dependency:** T1.1.

**Acceptance criteria:** the inventory identifies every code and documentation reference and records the intended disposition for each.

**Validated current inventory:** `src/routes/run-migration.tsx` exposes the `/run-migration` route; it calls `runMigration` from `src/lib/api/run-migration.ts`; that server function is a `GET` handler that creates tables and indexes through `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` statements. `src/routeTree.gen.ts` registers the route. `PRODUCTION-RUNBOOK.md` and `LIVE-CUTOVER-CHECKLIST.md` already warn operators not to use it, but the route and handler remain in the source tree. The implementation decision is therefore removal from the production route tree and deletion or isolation of the legacy server function, unless an operator-only replacement is explicitly required.

### S0-T2 — Remove or gate the legacy migration route

Prefer removing the public production route. If an operator control is required, require an authenticated administrator, disable it by default, validate the deployment mode, and ensure it cannot be reached through an alternate route or direct handler invocation.

**Owner:** backend/platform engineer. **Estimate:** 0.5 day. **Dependency:** S0-T1.

**Acceptance criteria:** unauthenticated and ordinary-user requests cannot execute schema-changing work; the production build contains no publicly reachable migration endpoint; no authorization bypass or secret-based browser control is introduced.

### S0-T3 — Add migration-route regression coverage

Add a focused server or route-level test for unauthenticated, ordinary-user, administrator, and disabled-production-mode behavior. The test must assert that denied requests do not reach the migration executor.

**Owner:** backend/platform engineer with QA review. **Estimate:** 0.25 day. **Dependency:** S0-T2.

**Acceptance criteria:** all four access cases are covered and pass in the standard test command.

### S0-T4 — Reconcile cutover documentation and environment names

Cross-check `PRODUCTION-RUNBOOK.md` and `LIVE-CUTOVER-CHECKLIST.md` against the deployed configuration. Confirm the R2 names are `R2_ENDPOINT`, `R2_BUCKET`, and `R2_REGION`, and that the migration order and rollback instructions do not describe the removed route.

**Owner:** release owner. **Estimate:** 0.25 day. **Dependency:** S0-T2.

**Acceptance criteria:** documentation has no stale route or environment-variable references and is reviewed by the deployment owner.

### S0-GATE — Production-safety gate

Require route removal or verified operator-only protection, passing access-control tests, clean documentation, strict TypeScript, and a production build before expanding production traffic or starting functional lint refactors.

## Phase 3 — Break down Sprint 1: mechanical formatting and trivial cleanup

### S1-T1 — Create an isolated formatting branch

Create a branch or pull request containing only formatter and `prefer-as-const` changes. Do not include migration, payment, auth, provider, logging, or behavior changes.

**Owner:** frontend engineer. **Estimate:** 0.1 day. **Dependency:** S0-GATE.

### S1-T2 — Run controlled autofix and inspect the diff

Run the repository’s ESLint autofix and formatter check against the exact configured paths. Review large clusters separately, especially `src/lib/i18n.ts`, `src/routes/app.models.$slug.tsx`, `src/lib/models-data.ts`, `src/lib/api/run-migration.ts`, `src/components/credit-simulator.tsx`, and `src/components/models-wall.tsx`.

**Owner:** frontend engineer with code-owner review. **Estimate:** 0.25 day. **Dependency:** S1-T1.

**Acceptance criteria:** the diff is mechanical, generated-data semantics are unchanged, and any suspicious autofix hunk is reverted into a follow-up task.

### S1-T3 — Validate the mechanical pass

Run lint, Prettier check, unit tests, strict TypeScript, and production build. Compare the post-fix rule counts to the baseline and record the count reduction.

**Owner:** release owner. **Estimate:** 0.25 day. **Dependency:** S1-T2.

**Acceptance criteria:** zero Prettier and `prefer-as-const` findings, with no new test, type, or build failures.

### S1-T4 — Merge and tag the clean-format baseline

Merge the isolated change and record a new lint baseline. Any non-formatting findings that remain must be explicitly listed as expected Sprint 2–5 work rather than silently ignored.

**Owner:** code owner. **Estimate:** 0.1 day. **Dependency:** S1-T3.

### S1-GATE — Mechanical-cleanup gate

Require the expected reduction of 664 findings, a clean mechanical diff, successful tests/types/build, and a documented remaining count of approximately 58 findings.

## Phase 4 — Break down Sprint 2: model-playground hook correctness

### S2-T1 — Map the conditional-hook control flow

Document the render paths in `src/routes/app.models.$slug.tsx`, especially the admin-only early return before state, refs, effects, store selectors, and memoized hooks. Confirm which hooks are shared by text, image, video, audio, and music models.

**Owner:** frontend engineer. **Estimate:** 0.25 day. **Dependency:** S1-GATE.

**Acceptance criteria:** the control-flow map identifies every conditional hook and the behavior expected for authorized, unauthorized, and model-switch renders.

### S2-T2 — Split authorization gating from the stateful playground

Refactor the route into a stable wrapper that performs permission selection and a stateful child component whose hooks are declared unconditionally and in stable order. Preserve loading, not-found, admin-only, and back-navigation behavior.

**Owner:** frontend engineer. **Estimate:** 0.75–1 day. **Dependency:** S2-T1.

**Acceptance criteria:** no hook is called after a conditional return or inside a conditional branch; the component’s public props remain typed; no lint suppression is added.

### S2-T3 — Stabilize model-change state reset behavior

Verify that prompt, generation state, history, active session, timers, and store selectors reset correctly when `model.slug` changes. Ensure text-model session loading is still limited to text models without changing hook order.

**Owner:** frontend engineer. **Estimate:** 0.5 day. **Dependency:** S2-T2.

**Acceptance criteria:** switching models cannot leak timers, history, chat sessions, or stale state between models.

### S2-T4 — Resolve the model-route dependency and boundary type

Fix the `model.category` dependency warning using the correct dependency strategy. Replace the remaining explicit `any` in the model route with a typed parameter/provider response contract, using `unknown` only at untrusted boundaries followed by validation or narrowing.

**Owner:** frontend engineer. **Estimate:** 0.25–0.5 day. **Dependency:** S2-T2.

### S2-T5 — Add model-playground regression tests and smoke checks

Cover admin-only access, normal model rendering, text chat sessions, model switching, generation submission, and unauthorized-to-authorized transitions. Run the route-level or component tests available in the repository and perform browser smoke checks for the primary model categories.

**Owner:** QA with frontend engineer. **Estimate:** 0.5–0.75 day. **Dependency:** S2-T3, S2-T4.

**Acceptance criteria:** zero `react-hooks/rules-of-hooks` findings, no touched-file exhaustive-deps findings, tests pass, and the model-detail smoke matrix is green.

### S2-GATE — Hook-correctness gate

Do not proceed to auth and boundary typing until the model route has zero hook-order findings, no new suppressions, passing strict TypeScript, and regression evidence for the conditional paths.

## Phase 5 — Break down Sprint 3: auth and dynamic-boundary type safety

### S3-T1 — Define shared boundary-type conventions

Choose the project convention for unknown external values: Zod schemas at request/provider boundaries, discriminated unions for agent/workflow operations, and typed database results for internal data. Document when `unknown`, a schema-inferred type, or a domain type is appropriate.

**Owner:** backend/platform engineer. **Estimate:** 0.25 day. **Dependency:** S2-GATE.

### S3-T2 — Type the authentication pathname boundary

Replace the six explicit-any usages in `src/routes/auth.$pathname.tsx`. Define the expected Neon Auth verification response, narrow dynamic pathname/input values, and make the empty failure block explicit with a safe error or fallback path. Preserve session-cookie and redirect behavior.

**Owner:** backend/platform engineer. **Estimate:** 0.75 day. **Dependency:** S3-T1.

**Acceptance criteria:** sign-in, OTP verification, invalid input, provider error, redirect, and session-cookie paths are typed and tested; no sensitive response details are exposed.

### S3-T3 — Type database dynamic values

Replace the four explicit-any usages in `src/lib/db.ts` with Drizzle-inferred row/insert types and controlled `unknown` narrowing. Preserve authorization, transaction, nullable-field, and owner-role behavior.

**Owner:** backend/platform engineer. **Estimate:** 0.5–0.75 day. **Dependency:** S3-T1.

### S3-T4 — Type agent plan and application contracts

Define discriminated unions and Zod validation for the agent panel, agent-apply endpoint, and agent-conversations API. Cover node creation, update, deletion, invalid operations, provider responses, and partial failures.

**Owner:** backend/platform engineer with frontend review. **Estimate:** 1–1.25 days. **Dependency:** S3-T1.

**Acceptance criteria:** all eight agent-related explicit-any findings are removed without unsafe casts; invalid plans are rejected before mutation; existing successful agent flows remain intact.

### S3-T5 — Type workflow and playground parameter contracts

Replace explicit-any usages in `src/lib/api/workflows.ts` and `src/components/playground/param-editor.tsx`. Reuse `ParamSpec` and model metadata types where possible, and add a safe narrowing helper for dynamic values.

**Owner:** frontend engineer. **Estimate:** 0.5 day. **Dependency:** S3-T1, S2-T4.

### S3-T6 — Add auth, database, agent, and workflow tests

Extend focused tests for valid and invalid auth payloads, database input normalization, agent operation validation, workflow parameters, and provider error payloads. Ensure tests assert rejection behavior rather than merely satisfying the compiler.

**Owner:** QA with backend/platform engineer. **Estimate:** 0.75 day. **Dependency:** S3-T2 through S3-T5.

### S3-GATE — Boundary-type gate

Require zero explicit-any findings, zero `no-empty` findings, strict TypeScript, no new ignore/suppression directives, and passing focused security-sensitive tests before release of auth, agent, or workflow changes.

## Phase 6 — Break down Sprint 4: React module hygiene and dependency correctness

### S4-T1 — Classify Fast Refresh exports

Review the nine affected modules and classify each non-component export as a constant, helper, context factory, hook, or type. Decide whether to move it to a sibling module or convert the module boundary without changing runtime behavior.

**Owner:** frontend engineer. **Estimate:** 0.25 day. **Dependency:** S3-GATE.

### S4-T2 — Extract non-component exports

Move constants and helpers from `node-params.tsx`, `onboarding-overlay.tsx`, the affected UI modules, and `app.models.$slug.tsx` into appropriately named modules. Update imports and ensure tree-shaking and public exports remain stable.

**Owner:** frontend engineer. **Estimate:** 0.75–1 day. **Dependency:** S4-T1.

### S4-T3 — Resolve each exhaustive-deps warning individually

Fix the dependency warnings in `app.developers.tsx`, `app.history.tsx`, `app.models.$slug.tsx`, and `canvas/index.tsx`. For each warning, document whether the dependency is added, a callback is stabilized, the effect is narrowed, or the logic is moved outside the effect. Do not use blanket disables.

**Owner:** frontend engineer. **Estimate:** 0.5 day. **Dependency:** S2-GATE, S4-T1.

### S4-T4 — Validate development refresh and frontend regression matrix

Verify Fast Refresh in local development and run smoke tests for landing, account gate, models, history, canvas, and auth. Check that extracted modules do not alter component identity, state preservation, or route behavior.

**Owner:** QA/frontend engineer. **Estimate:** 0.5 day. **Dependency:** S4-T2, S4-T3.

### S4-GATE — Frontend-hygiene gate

Require zero Fast Refresh and exhaustive-deps findings, passing frontend smoke tests, clean strict TypeScript, and no behavior changes in auth, model, history, or canvas flows.

## Phase 7 — Break down Sprint 5: lint gate, CI enforcement, and structured logging

### S5-T1 — Add explicit quality-check scripts

Add scripts for lint, type-check, tests, build, security/dependency checks, and an aggregate release check. Use the repository’s existing pnpm commands and ensure the scripts work from a clean frozen install.

**Owner:** release engineer. **Estimate:** 0.5 day. **Dependency:** S4-GATE.

### S5-T2 — Reach the zero-finding lint gate

Run the full configured lint command, resolve any residual findings, and record the final count. Any newly discovered rule or generated-file issue must become a bounded follow-up rather than being suppressed.

**Owner:** release engineer with code owners. **Estimate:** 0.5 day. **Dependency:** S5-T1.

### S5-T3 — Add changed-file and full-gate CI checks

Add pull-request checks for changed-file lint and a protected full release gate covering frozen install, tests, strict TypeScript, production build, dependency audit, and relevant smoke tests. Ensure the checks run with production-like environment validation without exposing secrets.

**Owner:** release engineer. **Estimate:** 0.75 day. **Dependency:** S5-T1, S5-T2.

### S5-T4 — Design and stage structured logging migration

Inventory the 76 console calls and prioritize payment, webhooks, generation, and auth. Define a redacted event shape with severity, request/correlation ID, provider event ID, KIE task ID, user ID where appropriate, and duration. Keep logging migration separate from the lint-zero commit if it expands beyond a small focused change.

**Owner:** backend/platform engineer. **Estimate:** 0.5 day for design and first critical-path conversion. **Dependency:** S5-T1.

### S5-T5 — Verify release gate and observability acceptance

Run the aggregate release check from a clean environment, verify CI blocks a deliberate lint regression, and confirm payment/webhook/generation logs can be searched by correlation identifiers without secrets, signatures, authorization headers, prompts, or sensitive payment data.

**Owner:** release owner and QA. **Estimate:** 0.5 day. **Dependency:** S5-T3, S5-T4.

### S5-GATE — Final cleanup gate

The repository must return zero ESLint findings, CI must enforce the baseline for new changes, the full production release check must pass, and the structured logging scope must have either completed its critical-path conversion or been split into explicitly tracked follow-up tickets.

## Ownership and effort summary

| Workstream                            | Primary owner               | Reviewers                 | Estimated effort |
| ------------------------------------- | --------------------------- | ------------------------- | ---------------: |
| Baseline, metadata, regression matrix | Release owner               | Code owner, QA            |          0.5 day |
| Sprint 0 production safety            | Backend/platform            | Release owner, QA         |            1 day |
| Sprint 1 mechanical cleanup           | Frontend                    | Code owner, release owner |         0.75 day |
| Sprint 2 hook correctness             | Frontend                    | QA, route/code owner      |      2.25–3 days |
| Sprint 3 boundary type safety         | Backend/platform + frontend | QA, security/code owner   |    3.75–4.5 days |
| Sprint 4 module hygiene               | Frontend                    | QA, code owner            |           2 days |
| Sprint 5 CI and observability         | Release + backend/platform  | QA, code owners           |   2.75–3.25 days |
| **Total planned execution**           | —                           | —                         |   **13–15 days** |

## Dependency graph

The critical path is:

```text
T1.1 + T1.2 + T1.3
        ↓
     S0-T1
        ↓
     S0-T2 ───────────────→ S0-T3
        ↓                       ↓
     S0-T4 ───────────────→ S0-GATE
                                ↓
                             S1-T1
                                ↓
                         S1-T2 → S1-T3 → S1-T4 → S1-GATE
                                                     ↓
                              ┌──────────────────────┴──────────────────────┐
                              ↓                                             ↓
                         S2-T1 → S2-T2 → S2-T3 → S2-T5 → S2-GATE        S2-T4
                              └─────────────────────────────────────────────┘
                                                                            ↓
                         S3-T1 → S3-T2/S3-T3/S3-T4/S3-T5 → S3-T6 → S3-GATE
                                                                            ↓
                         S4-T1 → S4-T2/S4-T3 → S4-T4 → S4-GATE
                                                                            ↓
                         S5-T1 → S5-T2 → S5-T3 → S5-T5 → S5-GATE
                                  └────────────→ S5-T4 ────────┘
```

S3-T2 through S3-T5 can proceed in parallel after S3-T1, subject to shared type conventions. S4-T2 and S4-T3 can proceed in parallel after S4-T1, but S4-T3 depends on the S2 model-route decision. S5-T4 can proceed in parallel with S5-T2 and S5-T3 after S5-T1, while its final observability verification joins S5-T5.

## Cross-sprint execution rules

1. Keep Sprint 1 as a formatting-only pull request. Never mix the autofix diff with payment, migration, auth, webhook, or provider logic.
2. Keep Sprints 2 and 3 reviewed by the owner of the affected runtime boundary. Hook-order fixes and auth/provider typing require behavior review, not only lint review.
3. Do not resolve findings by adding `eslint-disable`, `@ts-ignore`, or broad `any` aliases. Every suppression requires a documented exception and code-owner approval.
4. Use one sprint branch per workstream and one conceptual commit per task cluster. Rebase only when necessary to preserve reviewability.
5. After every sprint gate, record the lint count, test result, type-check result, build result, and changed regression surface.
6. Treat production payment, webhook, migration, and rollback verification as separate operational gates; a clean lint result is not evidence that these flows work in production.

## Final deliverables

The approved execution should produce a Markdown task breakdown committed to the repository, with the six sprint sections, task IDs, dependency graph, ownership/effort table, regression matrix, per-sprint acceptance gates, and final release checklist. The original high-level plan should remain unchanged unless the user approves a scope or sequencing adjustment.

## Final release checklist

Before declaring this cleanup complete, the release owner should verify the following in order:

1. The legacy `/run-migration` route is removed or demonstrably protected, and its access-control tests pass.
2. The live cutover documentation contains no stale route or R2 variable names.
3. The formatter-only change is isolated and has removed all Prettier and `prefer-as-const` findings.
4. The model-detail route has zero hook-order findings and passes its model/access regression matrix.
5. Authentication, database, agent, and workflow boundaries have zero explicit-any and empty-block findings with rejection-path tests.
6. Fast Refresh and exhaustive-deps findings are zero, and the frontend smoke matrix is green.
7. The aggregate release scripts pass from a frozen install through tests, strict TypeScript, build, and dependency/security checks.
8. CI blocks both a new lint regression and a deliberate full-gate failure.
9. Payment, webhook, generation, and auth logs are redacted and searchable by correlation identifiers.
10. The final ESLint count is zero, the new baseline is documented, and any remaining console/logging debt is represented by explicit follow-up tickets.

## Open risks

The exact test harness for TanStack route components and browser smoke tests may require repository inspection before implementation. The migration route may already have partial protections not visible in the lint report, so S0-T1 must validate the current behavior before choosing removal versus operator-only gating. The structured logging implementation may touch more files than the lint cleanup; it should remain a separately reviewable workstream if it exceeds the Sprint 5 timebox.
