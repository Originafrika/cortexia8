# Cortexia Vision-to-Product Alignment Audit

**Audited repository:** `Originafrika/cortexia8`

**Audited revision:** `16525a6812280c5b8320b368e300d1b7bfe18eb2`

**Audited branch:** `chore/post-launch-eslint-cleanup`

**Audit mode:** Static source inspection plus local runtime and visual inspection at `http://localhost:4173/`. No production database, provider credentials, authenticated user account, or live payment transaction was used.

**Verdict:** Cortexia8 is **not yet delivering Cortexia’s full intended product 100% perfectly**. It is a technically hardened, visually polished, pay-per-use AI generation shell with a real KIE-backed generation path, credit ledger, FedaPay/Stripe payment infrastructure, history, and a substantial catalogue. It is not yet a fully aligned unified creator platform because the strongest differentiating promises—faithful frontier-model access, creator-accessible agent/canvas workflows, consistent multimodal access, truthful payment-method messaging, and one coherent cost/provider contract—remain partial, restricted, or insufficiently proven.

> **Short version:** The current product is closer to **“a polished multi-provider image/video playground with an expanding catalogue and payment foundation”** than to the intended **“Higgsfield + ElevenLabs Flow + LM Arena-style unified AI operating system for creators.”**

## 1. What Cortexia appears to be intending to become

The project context describes a platform that unifies frontier AI capabilities behind one account, one balance, and one coherent interface. Its strategic reference points are useful because they imply distinct product jobs rather than merely a long model list.

| Intended product job            | What the user should experience                                                                                                                                                          |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unified account and balance** | One identity, one credit balance, one history, and one place to access many AI providers without opening separate provider accounts.                                                     |
| **Model marketplace / arena**   | A trustworthy catalogue where users can compare models by capability, quality, price, and modality, then either choose a model or delegate routing to Cortexia.                          |
| **Manual playground**           | A model-specific workspace with the right inputs, uploads, parameters, result preview, regeneration, and transparent cost before execution.                                              |
| **Agent mode**                  | Natural-language instructions are translated into a plan, reviewed by the user, applied to a workflow, and executed as a multi-step graph with durable state and cost controls.          |
| **Canva-like composition**      | A visual canvas where creators can combine model nodes, connect outputs to inputs, reuse workflows, and run or revise them without needing administrator privileges.                     |
| **Multimodal creation**         | Image, video, voice/audio, music, and text capabilities are not merely listed; they are discoverable, accessible, executable, and represented consistently in pricing and history.       |
| **Accessible monetization**     | Pay-as-you-go pricing, mobile-money support for the target market, card support, clear exchange rates, reliable reconciliation, and no confusing method labels.                          |
| **Creator trust**               | The product distinguishes exact provider integrations from generic or approximate mappings, shows honest prices and limitations, and does not imply a capability is live when it is not. |
| **Platform/API layer**          | Developers can create keys, submit generations, poll results, inspect usage, and use the same model and pricing contracts as the first-party interface.                                  |

This is a coherent and ambitious product direction. The main issue is not that the direction is unclear; it is that the current implementation exposes different slices of the direction to different audiences and sometimes markets the broadest interpretation while delivering a narrower one.

## 2. Executive scorecard

The status labels below are deliberately qualitative. They are based on source and local-runtime evidence, not a synthetic percentage. “Not verified” means the code path exists but could not be proven against live provider/database state in this audit.

| Capability                            | Actual state                                                                                                                                              | Alignment                                                       | Severity | Confidence  |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------- | ----------- |
| Unified account, balance, and history | Authenticated app, live balance fetch, transaction history, and credit ledger exist.                                                                      | **Partial**                                                     | P1       | High        |
| Broad model marketplace               | A large catalogue exists, but regular users are limited to image/video and most entries are marked generic.                                               | **Misleading / partial**                                        | **P0**   | High        |
| Real provider-backed generation       | Browser playground, KIE submission, credit reservation, webhook/polling, and result storage paths exist.                                                  | **Implemented, not live-verified**                              | P1       | Medium-high |
| Faithful frontier-model access        | Only 36 catalogue entries are marked `fidele`; 177 are marked `generique` in the static registry.                                                         | **Not aligned**                                                 | **P0**   | High        |
| Agent mode                            | LLM proposal generation and transactional apply path exist, but canvas/workflows are admin-only and the agent call itself is not user/workflow-persisted. | **Implemented but restricted and fragmented**                   | **P0**   | High        |
| Canva-like canvas                     | Feature-rich React Flow canvas exists, but the route explicitly displays “Admin access required” to non-admin users.                                      | **Not aligned for creators**                                    | **P0**   | High        |
| Multimodal access                     | Source catalogue includes image, video, audio, music, and text; normal users can browse/execute only image and video through the main app.                | **Partial**                                                     | **P0**   | High        |
| Mobile money                          | FedaPay creation, verification, and webhook reconciliation exist.                                                                                         | **Implemented, not live-verified**                              | P1       | Medium-high |
| Card payments                         | Stripe checkout and signed webhook path exist.                                                                                                            | **Implemented, not live-verified**                              | P1       | Medium-high |
| Crypto and Alipay                     | UI intentionally routes both through Stripe; crypto uses the configured Stripe fallback path and Alipay requests Stripe `alipay`.                         | **Intentional routing; provider/account verification required** | **P1**   | Medium-high |
| One coherent pricing contract         | Browser and canvas use unit-aware cost logic; public API/workflow paths charge base model price.                                                          | **Logically inconsistent**                                      | **P0**   | High        |
| Public product truthfulness           | Live preview claims 200+ models, best-model routing, all modalities, and “payable everywhere,” while access is narrower.                                  | **Overclaims current state**                                    | **P0**   | High        |
| Visual quality                        | Public marketing, wall, modal, auth, and component language are coherent and polished.                                                                    | **Strong but not complete**                                     | P1/P2    | High        |
| Production readiness                  | Engineering release gates are green, but live provider, database, payment, and user-flow evidence remains external to the local audit.                    | **Technically hardened, operationally conditional**             | P1       | High        |

## 3. Logical audit findings

### 3.1 The model catalogue is large, but its truth model is not exposed

The static catalogue contains approximately 214 active entries across image, video, text, music, and audio. A source-level count found 46 image entries, 94 video entries, 41 text entries, 23 music entries, and 9 audio entries. The same registry contains 36 `fidele` entries and 177 `generique` entries. These markers are valuable because they acknowledge that not every catalogue item is a faithful mapping.

The user interface does not surface that distinction. `src/components/model-card.tsx` presents the model name, provider, category, badge, blurb, and price/unit, but not `fidelityStatus`, `active`, or a generic-mapping warning. As a result, a user may reasonably believe that “Claude Sonnet 5,” “GPT-5.6 Sol,” “Gemini 3.1 Pro,” or a similar entry is an exact frontier-provider capability when the registry itself says many mappings are generic. This is the clearest product-truthfulness defect in the current state.

The historical production plan explicitly identified fictitious or placeholder model names as work to remove. The current source has real-looking provider metadata and many KIE endpoint identifiers, but the audit could not call every provider endpoint. The local endpoint consistency screen found 192 unique raw model endpoint identifiers in the registry against 171 endpoint paths documented in `KIE-ENDPOINTS.md`. Because the documentation uses provider-prefixed URL paths while the registry uses raw gateway identifiers, this is not proof that 72 models are broken; it is proof that the repository lacks a reliable exact mapping test and that endpoint documentation has drift risk.

### 3.2 The public promise is broader than the normal-user product surface

The public title and metadata promise “200+ models” and image, video, voice, music, and text generation. The live public root says, in French, “Un accès. Tous les modèles. Facturé à la seconde,” and states that Cortexia routes a prompt to the best available model or lets the user choose. The public page also says “Payable partout.”

The authenticated model route contradicts the broadest interpretation for ordinary users. `src/routes/app.models.tsx` defines all six categories, but non-admin users see only `all`, `image`, and `video`; the filtering logic removes text, audio, and music. `src/routes/app.models.$slug.tsx` repeats the restriction by rendering an admin-only state for those categories. The ordinary user’s app navigation contains models, history, and account, while workflows and developers are filtered behind an admin check in `src/routes/app.tsx`.

The implementation context now clarifies that this is unfinished or broken scope rather than intended audience segmentation. The correct fix is therefore to repair and verify these journeys for normal creators, while using explicit beta or disabled states as temporary safety controls. Marketing copy should become dynamic or be narrowed only until the missing capabilities pass their normal-user readiness gates.

### 3.3 The generation path is real, but entry points do not share one contract

The browser playground is materially real. `src/lib/api/generate.ts` resolves uploads, looks up active database models, calculates cost, checks credits, persists a run and node execution, reserves credits before provider submission, submits to KIE, and polls result status. Chat models can return synchronous text, while media models use queued tasks and callback/polling reconciliation. This is a meaningful implementation, not a static demo.

The cost contract diverges by entry point. Browser generation and the canvas path use `nodeCostUsd`, which handles image units, video seconds, and character-based units. In contrast, `server/api/v1/generate.ts` charges `cortexia_price_usd` directly, and `server/api/v1/workflows/run.ts` also uses the base model price per node. A video with a duration parameter or a text/audio operation with usage-based units can therefore be charged differently through the playground, canvas, public API, and workflow runner. This violates the intended “one account, one price logic” promise and is a P0 financial correctness issue even if each individual path is otherwise secure.

The browser uses a static `MODELS` registry for route rendering, while the server resolves active rows from the database. That is a reasonable architecture only if the static and database catalogues are continuously reconciled. The repository currently has many migration-based model updates and no visible contract test proving that every user-facing slug, database row, endpoint, schema, price, and API family agree.

### 3.4 Agent mode exists as a proposal/apply system, not yet as a unified creator experience

The agent implementation does call a KIE-backed chat endpoint, constructs a prompt from available models, parses JSON graph operations, validates model slugs, and estimates cost. `src/lib/api/agent-apply.ts` applies operations transactionally, verifies workflow ownership, supports dry-run confirmation, and can launch the resulting canvas workflow. These are strong foundations.

The product promise is still not fulfilled for normal creators. The canvas route explicitly checks the local session role and shows “Admin access required” to non-admin users. The workflows route redirects non-admin users to `/app/models`, and the app shell hides both workflows and developers from normal users. The agent proposal endpoint authenticates the caller but does not use the resulting `userId` to persist the proposal or attach it to a workflow; persistence begins only when a separate apply path is invoked. The implementation therefore has the pieces of agent mode, but they are fragmented behind an admin gate rather than presented as the product’s signature creator workflow.

The agent model configuration also contains legacy names such as `claude-fable-5`, `claude-sonnet-5`, `gpt-55`, and `gpt-56-luna`, while the main catalogue and database use separate naming and endpoint conventions. The agent’s available-model list should be generated from the same verified registry as the playground instead of maintained as an independent compatibility list.

### 3.5 Payment infrastructure is strong, but the user-facing method model is not truthful enough

FedaPay and Stripe are real server-side integrations. FedaPay order creation is server-owned, uses an external reference, stores an order before provider submission, converts USD to XOF using a server-side rate, and verifies provider status, amount, currency, and merchant reference before crediting the ledger. Stripe checkout uses an external reference, stores metadata, and relies on the raw-body webhook handler for signature verification. This is aligned with the payment-hardening goal.

The account UI advertises Mobile Money, card, crypto, and Alipay. Mobile Money is conditionally hidden when the public FedaPay key is absent. Card, crypto, and Alipay are intentionally routed through the Stripe checkout function. The server maps `method === "alipay"` to Stripe’s `alipay` payment method and sends the configured crypto selection through the Stripe fallback path. Under the clarified product decision, this routing is intentional rather than an automatic defect. The remaining task is provider-level verification: confirm that the configured Stripe account, mode, region, currency, and compliance settings support the intended crypto and Alipay checkout experience, and show an explicit unavailable state if they do not.

“Payable partout” still requires operational qualification. The repository supports one mobile-money provider and Stripe-based methods, but no local evidence proves universal regional coverage, availability of every displayed Stripe method, or successful live-money completion. The claim should become capability-aware until staging verifies the intended FedaPay and Stripe routes.

## 4. Visual and interaction audit

### 4.1 What is working well

The public brand system is coherent. The local runtime uses an editorial serif display face, warm amber accents, pale backgrounds, restrained dark text, rounded surfaces, and a consistent mono-label language. The live preview has a clear hero hierarchy and the wall modal is a particularly strong conversion component: it shows the selected asset, the model used, the prompt, and a `Crée le tien` CTA linked to the matching playground slug.

The auth screens are clean and consistent with the public brand. Sign-in and sign-up have clear fields, clear primary actions, and a simple account switch path. The model wall filters are understandable, and the Image filter visibly updates the content rather than being a decorative control.

The authenticated shell, based on source inspection, has a coherent sidebar/mobile-sheet navigation pattern, visible balance, recharge entry point, history, and locale controls. The canvas, if exposed, also has the visual ingredients of a serious creator workspace: model node picker, cost badge, run controls, history panel, empty-state templates, and an agent panel.

### 4.2 What is visually incomplete or strategically confusing

The live public preview is visually premium but strategically sparse above the fold. The first viewport has a large editorial hero and a mostly empty right half before the showcase strip begins. It communicates mood and price positioning more strongly than it communicates the actual creation experience. A user who arrives because of the agent/canvas/unified-account vision does not see those capabilities in the first screen.

The public page’s visible model marquee lists many text models, while the authenticated normal-user catalog hides text, audio, and music. This creates a visual trust gap: the public surface makes the product look broader than the post-sign-in navigation and route guards reveal. The credit simulator shows useful image, video, and voice examples, but its text and music rows are empty in the local extracted runtime content, reinforcing the sense that those modalities are marketed before they are fully productized.

The auth screens provide no bridge from the public promise to the post-sign-up “first win.” They do not tell the user whether they should start with the model catalogue, the playground, a free credit, or an agent workflow. The visual design is clean, but the conversion narrative is discontinuous.

The model cards are polished but omit the most important trust metadata: whether the mapping is faithful, whether the model is active, and whether the displayed price is a provider-backed current price or a generic approximation. Premium styling makes this omission more consequential because the interface looks authoritative.

The canvas and agent visuals may be strong for an administrator, but they are not part of the normal creator journey. From a product-design perspective, a capability that is invisible or access-denied to the intended user is not yet a successful experience, regardless of how polished the underlying screen is.

## 5. End-to-end journey assessment

| Journey                   | Expected experience                                                                        | Actual evidence                                                                                                           | Verdict                                               |
| ------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Discover Cortexia         | See a truthful unified-platform promise and a clear first action.                          | Live preview is polished and persuasive, but broad claims exceed normal-user access.                                      | **Partial; copy overclaims.**                         |
| Create an account         | Register quickly and understand what happens next.                                         | Clean sign-up form with minimal context.                                                                                  | **Implemented; weak onboarding continuity.**          |
| Browse models             | Compare the full advertised catalogue with trustworthy metadata.                           | Unauthenticated access redirects to sign-in; normal users later see only image/video; generic status is hidden.           | **P0 gap.**                                           |
| Generate an image/video   | Configure, submit, pay credits, receive, and retry a provider result.                      | Real browser-backed generation path exists with credit reservation and polling.                                           | **Strong foundation; live evidence required.**        |
| Generate text/audio/music | Use the same account and interface across modalities.                                      | Categories exist in source, but normal-user route and model detail explicitly restrict them.                              | **Not delivered to intended creator audience.**       |
| Use agent mode            | Ask for a workflow, review cost, apply it, and run it.                                     | Proposal and apply paths exist, but the entire canvas/workflow surface is admin-only.                                     | **Not delivered to normal creators.**                 |
| Build visually like Canva | Compose nodes, connect outputs, save, rerun, and inspect history.                          | Canvas and workflow persistence exist, but access is restricted to admins.                                                | **Not aligned with broad vision.**                    |
| Pay with mobile money     | Pay in local currency and receive exactly one credit ledger entry.                         | FedaPay server/webhook logic exists; live transaction not exercised.                                                      | **Implemented, not proven operationally.**            |
| Pay by card               | Use a reliable hosted checkout and receive exactly one credit entry.                       | Stripe checkout/webhook logic exists; live transaction not exercised.                                                     | **Implemented, not proven operationally.**            |
| Pay by crypto             | Select the intentional Stripe-backed crypto route and receive a truthful provider outcome. | UI selection is intentionally routed through Stripe; account/mode/region support still needs live verification.           | **Intentional; verification required.**               |
| Use the API               | Follow docs and get the same model/pricing behavior as the app.                            | API exists, but examples and model names can drift; base-price charging diverges from unit-aware UI logic.                | **Partial; contract hardening required.**             |
| Trust the wall            | Inspect real model outputs, prompt, model, and price.                                      | Modal shows asset, model, prompt, and CTA; wall is curated static content and price provenance is not shown in the modal. | **Strong showcase; provenance needs explicit proof.** |

## 6. What is genuinely complete versus not

### Genuinely strong or substantially complete

The production-hardening work is real and valuable. The credit ledger, provider callbacks, payment references, signature verification, duplicate-event handling, CSRF protection, strict TypeScript, reproducible install, and release gates provide a serious technical foundation. The browser generation path is not a mock: it has durable run state, provider submission, asynchronous reconciliation, and result presentation. The public visual language is differentiated and coherent rather than generic, and the wall/modal pattern communicates model provenance better than most early-stage AI catalogues.

### Not 100% complete or aligned

The current state is not a faithful all-frontier model marketplace because most catalogue entries are marked generic and the UI does not disclose that. It is not a unified multimodal creator product for ordinary users because text/audio/music and canvas/workflows are admin-only. It is not a single coherent billing contract because UI/API/workflow cost calculations differ. It does not truthfully support every displayed payment method because crypto is relabeled card checkout. It does not yet provide a fully unified agent experience because proposal, application, persistence, authorization, and execution are separate paths with restricted access. It is also not operationally proven until live provider, staging payment, callback redelivery, and database evidence are recorded.

## 7. Priority remediation roadmap

### P0 — Fix product truth and financial consistency before broad launch

| P0 item                       | Required outcome                                                                                                                                         | Acceptance criteria                                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Truthful catalogue states** | Either remove generic entries from the public creator catalogue, label them explicitly as beta/generic, or verify and promote them to faithful mappings. | Every visible model has a verified provider mapping, active status, input schema, and fidelity badge; no generic entry appears as exact frontier access. |
| **Single cost engine**        | Use one server-owned cost function for browser, canvas, workflow API, and public API.                                                                    | Same model/input/duration/text length produces the same quote and debit from every entry point; automated contract tests cover all pricing units.        |
| **Correct payment labels**    | Remove crypto unless a real crypto rail exists, or integrate a real provider; show Alipay only where account/mode support is confirmed.                  | UI method label, provider payment method, callback path, and reconciliation record match exactly.                                                        |
| **Narrow public claims**      | Change “all models,” “payable everywhere,” and broad multimodal claims to match launch scope, or make the missing capabilities actually available.       | Public landing, simulator, catalog, account, and auth onboarding tell one consistent story.                                                              |

### P1 — Make the differentiating product accessible to creators

| P1 item                                 | Required outcome                                                                                                                                                                  | Acceptance criteria                                                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Creator-accessible workflows/canvas** | Remove the blanket admin-only gate or replace it with a deliberate beta entitlement that includes real creator users.                                                             | A normal test user can create, save, rename, run, inspect, and reload a workflow.                                            |
| **End-to-end agent mode**               | Persist the agent proposal against the authenticated user/workflow, require explicit confirmation when needed, apply operations transactionally, and launch with correct cost.    | A test user can describe a workflow, review operations/cost, approve, execute, and find the result in history after refresh. |
| **One verified model registry**         | Generate client catalogue, agent model list, DB seed/update data, API models, endpoint documentation, and pricing tests from one source or enforce bidirectional contract checks. | CI fails when a slug, endpoint, category, fidelity state, input schema, price, or API family drifts.                         |
| **Live integration evidence**           | Exercise staging with FedaPay, Stripe, KIE generation, redelivery, mismatch, refund, and insufficient-credit scenarios.                                                           | Launch log records IDs, timestamps, ledger references, callback behavior, and rollback evidence.                             |

### P2 — Improve conversion and visual coherence

| P2 item                                  | Required outcome                                                                                                                          | Acceptance criteria                                                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Show the creation experience earlier** | Add a real interactive creation preview or a direct “describe what you want” entry above the fold.                                        | First viewport communicates not only the catalogue and price model, but also the actual creator workflow. |
| **Auth-to-first-win onboarding**         | After sign-up, guide the user to a verified starter model, free/intro credit if intended, and first generation.                           | New user can reach first successful output with no unexplained dead end.                                  |
| **Truthful pricing UI**                  | Show price unit, expected debit, and payment availability in the same language across card, simulator, account, playground, and API docs. | No empty modality rows, no unlabeled generic models, and no method label/provider mismatch.               |
| **Responsive workspace audit**           | Test the canvas, model playground, wall modal, account, and payment widgets on narrow mobile widths.                                      | No clipped controls, inaccessible dialogs, hidden cost, or broken scroll/focus behavior.                  |

### P3 — Expand the long-term Cortexia vision

After the P0/P1 corrections, Cortexia can intentionally expand into the full vision: broader exact model coverage, model comparison/arena scoring, richer chat interfaces, multi-step agent memory, reusable templates, collaborative workflows, public API access for creators, and deeper Canva-like asset editing. Those are strategic expansion items, not substitutes for fixing current truthfulness and access mismatches.

## 8. Recommended target state for the next release

The most coherent next release is not “all 214 models for everyone.” It is a smaller, truthful creator product with three verified loops:

1. **Manual loop:** choose a verified image/video/voice model, see a server-owned quote, submit, receive a result, and find it in history.
2. **Payment loop:** pay through an accurately labeled mobile-money or card rail, receive exactly one ledger credit, and recover safely from callback redelivery or provider mismatch.
3. **Agent loop:** describe a simple multi-step workflow, review the generated plan and cost, approve it, run it, and inspect the output in a persistent canvas/history view.

Once these loops work for a normal creator account, expand the catalogue and modalities behind explicit fidelity labels. That sequence would make Cortexia’s product promise smaller but much more believable, and therefore more competitive.

## 9. Audit limitations and confidence

This audit inspected the local branch at revision `16525a6` and ran the public application locally. It did not use a real authenticated account, so creator-only pages were evaluated through source inspection and their route guards rather than through a signed-in visual session. It did not execute live KIE, FedaPay, Stripe, Neon, or R2 transactions, so provider availability, production database state, endpoint behavior, and real-money reconciliation remain unverified. The local browser also required `localhost` because the Vite development server rejected the temporary proxied host; this is an audit-environment limitation rather than evidence of a production-host defect.

The verdict is therefore high-confidence for source-level access restrictions, copy/catalogue mismatches, payment-method mapping, cost-path divergence, and public visual observations. It is medium-confidence for live provider correctness and production operational state until staging evidence is attached.

## References

[1]: ./PRODUCTION-PLAN.md "Cortexia original production plan and historical mock-state assessment"
[2]: ./cortexia8-production-readiness-stakeholder-deck.md "Cortexia8 production-readiness stakeholder deck source"
[3]: ./PRODUCTION-RUNBOOK.md "Cortexia8 production runbook"
[4]: ./LIVE-CUTOVER-CHECKLIST.md "Cortexia8 live cutover checklist"
[5]: ./src/routes/index.tsx "Cortexia public root and live/waitlist product surface"
[6]: ./src/routes/app.tsx "Cortexia authenticated app shell and navigation policy"
[7]: ./src/routes/app.models.tsx "Cortexia model catalogue access and category filtering"
[8]: ./src/lib/models-data.ts "Cortexia static model catalogue and fidelity metadata"
[9]: ./src/components/model-card.tsx "Cortexia model-card presentation component"
[10]: ./src/lib/api/generate.ts "Cortexia browser generation server function"
[11]: ./src/lib/api/shared.ts "Cortexia model lookup and unit-aware cost helper"
[12]: ./server/api/v1/generate.ts "Cortexia public API generation handler"
[13]: ./server/api/v1/workflows/run.ts "Cortexia public API workflow-run handler"
[14]: ./src/lib/api/payments.ts "Cortexia FedaPay and Stripe payment functions"
[15]: ./src/lib/agent.ts "Cortexia agent planning and provider calls"
[16]: ./src/lib/api/agent-apply.ts "Cortexia transactional agent-plan application"
[17]: ./src/routes/canvas/index.tsx "Cortexia canvas route and access gate"
[18]: ./src/routes/app.workflows.tsx "Cortexia workflow route and access gate"
[19]: ./src/routes/app.developers.tsx "Cortexia developer portal and API examples"
[20]: ./KIE-ENDPOINTS.md "Cortexia KIE endpoint reference"
[21]: https://docs.kie.ai/common-api/webhook-verification "KIE.ai webhook verification documentation"
[22]: https://docs.fedapay.com/integration-api/en/webhooks-en "FedaPay webhook documentation"
[23]: https://docs.stripe.com/webhooks "Stripe webhook documentation"
