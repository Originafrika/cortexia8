# KIE Provider Contract Notes

## Sources reviewed

The following KIE documentation pages were reviewed on 17 August 2026:

1. [KIE API Getting Started](https://docs.kie.ai/)
2. [KIE Market Get Task Details](https://docs.kie.ai/market/common/get-task-detail)
3. [GPT Image-2 Text to Image](https://docs.kie.ai/market/gpt/gpt-image-2-text-to-image)
4. [Seedream Text to Image](https://docs.kie.ai/market/seedream/seedream)
5. [Kling 2.6 Text to Video](https://docs.kie.ai/market/kling/text-to-video)
6. [Kling 2.6 Image to Video](https://docs.kie.ai/market/kling/image-to-video)
7. [Bytedance Seedance 2.0](https://docs.kie.ai/market/bytedance/seedance-2)

## Findings

KIE generation requests use `POST /api/v1/jobs/createTask` with a `model` identifier in the request body. The documentation URL path is not always the same as that identifier. For example, the Seedream documentation path ends in `market/seedream/seedream`, while the OpenAPI request enum uses `bytedance/seedream`. The Kling documentation path `market/kling/text-to-video` uses the request identifier `kling-2.6/text-to-video`. GPT Image-2 uses `gpt-image-2-text-to-image`, while its documentation path includes the `gpt/` grouping segment.

KIE documents a unified task-status endpoint at `GET /api/v1/jobs/recordInfo?taskId=...` and recommends callbacks for production workloads. Generated media URLs are temporary, so Cortexia’s webhook path must continue copying media to durable storage when configured.

The repository’s normalized contract module therefore treats `KIE-ENDPOINTS.md` paths as documentation references and applies explicit, reviewable aliases before comparing them to `CATALOGUE[*].kieEndpoint`. It fails on undocumented provider paths or unapproved catalogue-only identifiers, while allowing known catalogue additions and intentional duplicate provider identifiers.

## Repository decision

The executable contract is in `scripts/kie-endpoint-contract.ts` and `scripts/kie-endpoint-contract.test.ts`. The report wrapper is `scripts/verify-kie-coverage.ts`. All documented KIE model paths currently normalize to a catalogue provider identifier; catalogue-only additions and duplicate identifiers are explicit allowlists that should be revisited when KIE’s documentation is refreshed.
