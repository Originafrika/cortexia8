# Cortexia Unfinished-Capabilities Remediation Plan

## Goal

Reframe and correct the previous vision audit according to the product owner’s clarification: **crypto and Alipay are intentionally routed through Stripe**, and the capabilities currently unavailable to ordinary users are not deliberate segmentation; they were unfinished, unstable, or broken. The objective is therefore to make the intended unified Cortexia product work reliably for every authenticated user, while preserving safe temporary feature flags for capabilities that are not yet production-safe.

The work should end with an updated truthfulness audit, a normal-user end-to-end journey, and a production-readiness decision for multimodal generation, workflows, canvas, agent mode, API access, and payments.

## Product assumptions

The target user is a normal authenticated creator account, not an administrator. Workflows, the visual canvas, agent mode, text, audio, and music should be available to that user once their provider paths are verified. Administrator-only access may remain temporarily as an emergency kill switch or internal beta flag, but it must not be the permanent product access model.

Stripe-backed crypto and Alipay are treated as intentional payment-product decisions. The implementation review must verify that the selected Stripe payment method configuration is supported by the Cortexia Stripe account, region, currency, checkout mode, and compliance settings. The plan must not replace the intended Stripe routing with a different payment provider merely because the UI labels are unusual. If a method cannot be enabled in the configured Stripe account, the product should show an explicit unavailable state rather than silently pretending that the method is live.

## Phase 0 — Re-baseline the intended launch scope

1. Create a capability matrix for authenticated normal users covering image, video, text, audio, music, model catalogue, model playground, history, account/recharge, workflows, canvas, agent mode, and developer/API access.
2. For every capability, record its current route, frontend guard, server guard, provider endpoint, database tables, pricing unit, callback path, and known failure mode.
3. Separate three states: **ready for all users**, **implemented but broken**, and **not implemented or not provider-verified**. Do not use administrator access as evidence that a capability is production-ready.
4. Update the vision audit’s payment finding to classify Stripe-backed crypto/Alipay as intentional routing, with a remaining verification task for provider/account support rather than an automatic product defect.
5. Define the release policy: broken capabilities remain behind a visible “coming soon/beta” state until their full journey passes, but they should not be hidden as if they were intentionally admin-only.

**Acceptance gate:** The capability matrix has one owner, one status, and one testable readiness criterion for every promised product capability.

## Phase 1 — Replace permanent admin gates with capability readiness controls

1. Inspect the route guards and navigation filters for `/app/workflows`, `/canvas`, `/app/developers`, text/audio/music model routes, and agent controls.
2. Replace blanket `role === "admin"` restrictions with a capability/feature-readiness policy that can grant access to normal authenticated users when the corresponding capability is ready.
3. Keep an emergency server-side kill switch for each capability so a broken provider can be disabled without redeploying access-control code.
4. Ensure route guards, navigation visibility, server functions, API handlers, and database ownership checks use the same readiness policy.
5. Verify that workflow and canvas records are always owned by the authenticated user, that users cannot read or mutate another user’s workflow, and that administrator access is not being used to bypass ownership checks.
6. Add normal-user authorization tests for allow, deny, disabled-capability, missing-session, and cross-user workflow cases.

**Acceptance gate:** A standard test account can see the enabled capability in navigation, open its route, and receive a truthful disabled/beta state when the capability is intentionally paused. No feature relies on administrator status for normal operation.

## Phase 2 — Make the model registry truthful and provider-verifiable

1. Establish one verified registry containing model slug, display name, provider, API family, KIE endpoint, category, input schema, output type, pricing unit, price, active state, and fidelity status.
2. Reconcile the static client catalogue, database rows, migration updates, agent model options, API model list, provider endpoint documentation, and wall provenance against that registry.
3. Remove or explicitly label generic model mappings. A generic entry must not look identical to a faithful frontier-provider integration.
4. For each enabled model, add a provider contract fixture or staging probe that validates endpoint shape, required inputs, callback/polling behavior, output extraction, and failure mapping.
5. Add CI checks that fail on duplicate slugs, missing endpoints, missing schemas, stale agent options, undocumented active endpoints, and pricing-unit drift.
6. Create an enablement rule: a model becomes visible to all users only after its provider contract, pricing, output, and refund behavior pass the model readiness test.

**Acceptance gate:** Every visible model has an exact readiness status and a passing provider contract. Users can distinguish faithful, beta, generic, and unavailable entries before spending credits.

## Phase 3 — Repair text, audio, music, and video user journeys

1. For each modality, test catalogue filtering, model-detail routing, parameter rendering, uploads, validation, quote display, generation submission, asynchronous status, result rendering, history persistence, regeneration, and failure/refund behavior.
2. Repair model schemas and input adapters where KIE expects different field names, durations, character units, audio URLs, image URLs, or output formats.
3. Remove empty simulator rows and replace them with verified examples or an explicit “coming soon” state.
4. Verify that text chat sessions persist per user and model, that assistant responses are stored only after successful provider completion, and that token/character pricing matches the displayed quote.
5. Verify that audio and music results render with working playback, download, storage, and history metadata rather than only image/video result assumptions.
6. Add modality-specific test fixtures and browser smoke journeys for at least one verified model in each enabled category.

**Acceptance gate:** A standard authenticated test user can successfully complete one image, video, text, audio, and music generation journey whenever those categories are marked enabled. Disabled categories are visibly and truthfully unavailable.

## Phase 4 — Make workflows, canvas, and agent mode creator-ready

1. Repair workflow creation, loading, renaming, node insertion, parameter editing, edge connection, autosave, reload, run, result history, and failure states for a normal user.
2. Ensure the canvas uses the database model registry and server-owned pricing rather than an independently drifting client-only model list.
3. Persist agent requests, generated plans, estimated cost, confirmation decisions, applied operations, and run IDs against the authenticated user and workflow.
4. Align agent operation types between `agent-run`, `agent-panel`, `agent-apply`, canvas state, and database graph operations. Add schema validation for model slugs, node references, parameter types, and edge compatibility.
5. Enforce the cost-confirmation flow: dry-run first, show the exact estimated debit, require explicit confirmation above the threshold or when configured by the user, then apply and launch only after confirmation.
6. Make agent execution idempotent and recoverable. Repeated submits, refreshes, provider callbacks, and partial graph failures must not duplicate nodes, edges, credits, or runs.
7. Add a creator-facing empty-state tutorial and one-click starter templates so the canvas is usable without prior knowledge.

**Acceptance gate:** A normal test user can describe a workflow, review the plan and cost, approve it, see the graph applied, run it, refresh the page, and find the resulting run and assets in history without administrator privileges.

## Phase 5 — Unify pricing and payment behavior

1. Preserve the intentional payment architecture: FedaPay for mobile money and Stripe for card, crypto, and Alipay selections where enabled by the Stripe account.
2. Verify each Stripe payment method against the actual account configuration, supported currencies, checkout mode, region, and webhook event set. Do not label a method available when the provider rejects it.
3. Keep server-owned payment orders, immutable references, signed webhooks, duplicate-event protection, amount validation, and idempotent crediting.
4. Create one server-owned quote function that receives model, modality, parameters, duration, character count, resolution, and other billable inputs and returns the exact expected debit and unit explanation.
5. Reuse that quote function in browser generation, canvas execution, agent dry-run/apply, workflow API, public generation API, simulator, model cards, account recharge messaging, and developer documentation.
6. Add cross-entry-point tests proving that the same model/input costs the same amount regardless of whether it is launched from the playground, canvas, agent, workflow API, or public API.
7. Add payment-method integration tests for success, cancelled checkout, provider mismatch, duplicate webhook, delayed webhook, unsupported method, insufficient balance, and refund-after-provider-submission failure.

**Acceptance gate:** The user sees one accurate quote before generation, receives one matching ledger debit, and can pay through every displayed method using the intended provider path. Unsupported Stripe methods fail explicitly and safely.

## Phase 6 — Align visual and conversion experience with the repaired product

1. Replace overbroad public claims with a live capability-led message generated from verified enabled capabilities, or make the public claims true by enabling the corresponding features.
2. Bring the actual creator workflow into the first viewport through an interactive prompt entry, starter template, or clearly demonstrated workspace—not only a model wall and price simulator.
3. Add fidelity, beta, unavailable, and estimated-price states to model cards and detail pages without weakening the premium visual language.
4. Add a clear post-sign-up first-win flow: choose a verified starter capability, understand the quote, create the first result, and reach history/account afterward.
5. Expose workflows, canvas, and agent mode in the normal-user navigation when enabled; show a deliberate beta/coming-soon state when disabled rather than silently redirecting to models.
6. Make the simulator show only populated, verified modalities and explain whether the price is per image, second, character unit, or track.
7. Run responsive visual checks for desktop, tablet, and mobile across landing, auth, catalogue, model playground, payment, canvas, agent, history, and result modal surfaces.

**Acceptance gate:** Marketing copy, navigation, access state, pricing, and actual capabilities tell one coherent story at every step from landing page through first generation.

## Phase 7 — Staging validation and launch decision

1. Create a normal-user staging account and a separate administrator account; run the full capability matrix with both.
2. Exercise one verified journey per enabled modality, one workflow/agent journey, one recharge journey through FedaPay, and one journey per enabled Stripe method.
3. Verify Neon database migrations, R2 asset storage, callback reachability, provider signatures, rate limits, credit reservations, refunds, and reconciliation queries.
4. Capture evidence for each journey: account identifier, model slug, quote, run ID, provider task ID, payment reference, webhook event ID, ledger entry, output asset, and timestamp.
5. Run visual regression screenshots and compare them against the intended brand system and key acceptance criteria.
6. Update the production runbook, deployment checklist, capability matrix, and vision audit with the final enabled/disabled state.
7. Decide one of three release outcomes: **ready for all users**, **controlled beta with explicit disabled states**, or **do not launch until P0 gaps are closed**.

**Final release gate:** No capability is marketed as live unless a normal-user staging journey passes logically, financially, operationally, and visually.

## Deliverables

The execution should produce an updated vision-alignment audit, a capability readiness matrix, a model/provider contract report, a normal-user regression suite, a unified pricing contract test suite, a Stripe/FedaPay payment-method verification report, responsive visual evidence, and an updated merge/deployment checklist.

## Risks and decisions to confirm during execution

The main open risk is whether the configured Stripe account and operating region truly support the intended crypto and Alipay payment-method selections. The plan preserves the product decision while requiring provider-level verification. A second risk is that some KIE endpoint names or model mappings may be placeholders or stale; the readiness rule therefore treats provider verification as mandatory. A third risk is that removing admin gates could expose incomplete workflows, so feature flags and explicit disabled states must be introduced before broad access is granted. A final risk is pricing migration: unifying cost logic may change quoted amounts for existing models and requires a documented compatibility decision before deployment.
