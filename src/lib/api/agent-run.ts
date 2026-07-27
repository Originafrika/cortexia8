/**
 * Server function wrapper for the agent.
 * Keeps the API key server-side and prevents client-side exposure.
 */

import { createServerFn } from "@tanstack/react-start";
import { runAgent, type AgentConfig, type AgentResponse } from "@/lib/agent";
import { getRequestContext, requireUserId, HttpError, toJsonResponse } from "./auth";

export type AgentRunInput = {
  message: string;
  workflowId?: number;
  config?: AgentConfig;
  graphState?: {
    nodes: Array<{ id: string; slug: string }>;
    edges: Array<{ source: string; target: string }>;
  };
  sessionToken?: string;
};

export const agentRun = createServerFn({ method: "POST" })
  .validator((data: AgentRunInput): AgentRunInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid body");
    if (!data.message || typeof data.message !== "string") {
      throw new HttpError(400, "message is required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(data.sessionToken);
      const userId = await requireUserId(ctx);

      const config: AgentConfig = data.config ?? { model: "gpt-5-2" };
      return await runAgent(data.message, config, data.graphState);
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });
