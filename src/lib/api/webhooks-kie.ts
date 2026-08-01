/**
 * POST /api/webhooks/kie — kie.ai task-completion callback (TanStack Start wrapper).
 *
 * Thin createServerFn wrapper around the core handler in webhooks-kie-core.ts.
 * The Nitro route (server/api/webhooks/kie.ts) imports the core directly
 * to avoid the createServerFn dependency chain.
 */

import { createServerFn } from "@tanstack/react-start";
import { extractTaskId, type WebhookPayload } from "@/lib/kie-api/webhook";
import { HttpError } from "./auth";
import { handleWebhook, type WebhookInput, type WebhookResponse } from "./webhooks-kie-core";

export type { WebhookInput, WebhookResponse };
export { handleWebhook };

export const kieWebhook = createServerFn({ method: "POST" })
  .validator((data: WebhookInput): WebhookInput => {
    if (!data || typeof data !== "object") {
      throw new HttpError(400, "Invalid body");
    }
    return data;
  })
  .handler(async ({ data }) => {
    try {
      return await handleWebhook(data);
    } catch (err) {
      if (err instanceof HttpError) {
        return {
          ok: false,
          taskId: extractTaskId(data),
          action: "rejected" as const,
          reason: err.message,
        } satisfies WebhookResponse;
      }
      throw new HttpError(500, "Internal server error");
    }
  });
