/**
 * Public surface of the API layer.
 *
 * Routes are exported as `createServerFn` factories. Each one compiles
 * to a real HTTP endpoint at `/_serverFn/{stableHash}` on Vercel.
 *
 * Webhook URL discovery:
 *   import { getWebhookUrl } from "@/lib/api";
 *   getWebhookUrl()  // → https://<APP_URL>/_serverFn/<hash>
 *
 * Clients should embed the webhook URL into kie.ai's callBackUrl field
 * once per deploy. The function-level `url` property is stable per build.
 */

import { kieWebhook } from "./webhooks-kie";
import type { GenerateInput, GenerateResponse } from "./generate";
import type { RunInput, RunResponse } from "./canvas-run";
import type { CanvasOp, GraphOpsResponse } from "./canvas-graph-ops";
import type { WebhookInput, WebhookResponse } from "./webhooks-kie";
import type { StatusInput, GenerationStatus } from "./generation-status";

export { generate } from "./generate";
export type { GenerateInput, GenerateResponse };
export { runCanvas } from "./canvas-run";
export type { RunInput, RunResponse };
export { graphOps } from "./canvas-graph-ops";
export type { CanvasOp, GraphOpsResponse };
export { kieWebhook } from "./webhooks-kie";
export type { WebhookInput, WebhookResponse };
export { generationStatus } from "./generation-status";
export type { StatusInput, GenerationStatus };
export { getHistory } from "./history";
export type { HistoryInput, HistoryItem, HistoryResponse };
export { verifyFedaPayTransaction, createStripeCheckout, stripeWebhook } from "./payments";
export type {
  FedaPayVerifyInput,
  PaymentResponse,
  StripeCheckoutInput,
  StripeCheckoutResponse,
  StripeWebhookResponse,
} from "./payments";
export { getUserBalance } from "./balance";
export type { BalanceInput, BalanceResponse } from "./balance";
export { createApiKey, listApiKeys, revokeApiKey } from "./api-keys";
export type { CreateKeyResult, ApiKeyRow } from "./api-keys";

export {
  getActiveModelBySlug,
  resolveUploads,
  nodeCostUsd,
  topoLevels,
  type ModelRow,
} from "./shared";

/**
 * Best-effort: return the full URL kie.ai should call back. Returns
 * `null` if APP_URL is missing — callers should fall back to polling.
 */
export function getWebhookUrl(): string | null {
  const base =
    process.env.APP_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}${kieWebhook.url}`;
}
