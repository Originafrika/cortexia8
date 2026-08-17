/**
 * CRUD server functions for agent conversations.
 *
 *   - createConversation  — create a new conversation for a workflow
 *   - saveMessage         — save a message (user or assistant) to a conversation
 *   - getConversation     — fetch all messages for a conversation
 *   - getConversationByWorkflow — get the latest conversation for a workflow
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sql } from "@/lib/db";
import type { AgentResponse } from "@/lib/agent";
import { getRequestContext, HttpError, requireUserId } from "./auth";

// ---------------------------------------------------------------------------
// createConversation
// ---------------------------------------------------------------------------

export type CreateConversationInput = {
  workflowId: number;
  sessionToken?: string;
};

export type CreateConversationResponse = {
  id: number;
};

export const createConversation = createServerFn({ method: "POST" })
  .validator((data: CreateConversationInput): CreateConversationInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid input");
    if (!Number.isInteger(data.workflowId)) throw new HttpError(400, "workflowId is required");
    return { workflowId: data.workflowId, sessionToken: data.sessionToken };
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(data.sessionToken);
      const userId = await requireUserId(ctx);

      const rows = (await sql`
        INSERT INTO agent_conversations (workflow_id, user_id)
        VALUES (${data.workflowId}, ${userId})
        RETURNING id
      `) as { id: number }[];

      return { id: rows[0].id } satisfies CreateConversationResponse;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, "Internal server error");
    }
  });

// ---------------------------------------------------------------------------
// saveMessage
// ---------------------------------------------------------------------------

const graphOperationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ADD_NODE"),
    modelSlug: z.string(),
    position: z.object({ x: z.number(), y: z.number() }).optional(),
  }),
  z.object({
    type: z.literal("CONNECT_NODES"),
    source: z.string(),
    target: z.string(),
  }),
  z.object({
    type: z.literal("UPDATE_NODE"),
    nodeId: z.string(),
    params: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
  }),
  z.object({
    type: z.literal("REMOVE_NODE"),
    nodeId: z.string(),
  }),
]);

const agentResponseSchema: z.ZodType<AgentResponse> = z.object({
  text: z.string(),
  operations: z.array(graphOperationSchema),
  estimatedCost: z.number(),
  language: z.string(),
});

export type SaveMessageInput = {
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  proposedPlan?: AgentResponse;
  sessionToken?: string;
};

export type SaveMessageResponse = {
  id: number;
};

export const saveMessage = createServerFn({ method: "POST" })
  .validator((data: SaveMessageInput): SaveMessageInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid input");
    if (!Number.isInteger(data.conversationId))
      throw new HttpError(400, "conversationId is required");
    if (data.role !== "user" && data.role !== "assistant")
      throw new HttpError(400, "role must be user or assistant");
    if (typeof data.content !== "string" || !data.content.trim())
      throw new HttpError(400, "content is required");
    return {
      ...data,
      proposedPlan: data.proposedPlan ? agentResponseSchema.parse(data.proposedPlan) : undefined,
    };
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(data.sessionToken);
      await requireUserId(ctx);

      const rows = (await sql`
        INSERT INTO agent_messages (conversation_id, role, content, proposed_plan)
        VALUES (${data.conversationId}, ${data.role}, ${data.content}, ${data.proposedPlan ? JSON.stringify(data.proposedPlan) : null}::jsonb)
        RETURNING id
      `) as { id: number }[];

      return { id: rows[0].id } satisfies SaveMessageResponse;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, "Internal server error");
    }
  });

// ---------------------------------------------------------------------------
// getConversation
// ---------------------------------------------------------------------------

export type GetConversationInput = {
  conversationId: number;
  sessionToken?: string;
};

export type AgentMessageRow = {
  id: number;
  role: "user" | "assistant";
  content: string;
  proposedPlan: AgentResponse | null;
  createdAt: string;
};

export type GetConversationResponse = {
  id: number;
  workflowId: number;
  messages: AgentMessageRow[];
};

export const getConversation = createServerFn({ method: "GET" })
  .validator((data: GetConversationInput): GetConversationInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid input");
    if (!Number.isInteger(data.conversationId))
      throw new HttpError(400, "conversationId is required");
    return { conversationId: data.conversationId, sessionToken: data.sessionToken };
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(data.sessionToken);
      const userId = await requireUserId(ctx);

      // Fetch conversation — verify ownership
      const cRows = (await sql`
        SELECT id, workflow_id
        FROM agent_conversations
        WHERE id = ${data.conversationId} AND user_id = ${userId}
        LIMIT 1
      `) as { id: number; workflow_id: number }[];

      if (cRows.length === 0) {
        throw new HttpError(404, "Conversation not found");
      }

      const conv = cRows[0];

      // Fetch messages
      const mRows = (await sql`
        SELECT
          id,
          role,
          content,
          proposed_plan AS "proposedPlan",
          created_at AS "createdAt"
        FROM agent_messages
        WHERE conversation_id = ${data.conversationId}
        ORDER BY id ASC
      `) as AgentMessageRow[];

      return {
        id: conv.id,
        workflowId: conv.workflow_id,
        messages: mRows,
      } satisfies GetConversationResponse;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, "Internal server error");
    }
  });

// ---------------------------------------------------------------------------
// getConversationByWorkflow — latest conversation for a given workflow
// ---------------------------------------------------------------------------

export type GetByWorkflowInput = {
  workflowId: number;
  sessionToken?: string;
};

export const getConversationByWorkflow = createServerFn({ method: "GET" })
  .validator((data: GetByWorkflowInput): GetByWorkflowInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid input");
    if (!Number.isInteger(data.workflowId)) throw new HttpError(400, "workflowId is required");
    return { workflowId: data.workflowId, sessionToken: data.sessionToken };
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(data.sessionToken);
      await requireUserId(ctx);

      // Find latest conversation for this workflow
      const cRows = (await sql`
        SELECT id, workflow_id
        FROM agent_conversations
        WHERE workflow_id = ${data.workflowId}
        ORDER BY created_at DESC
        LIMIT 1
      `) as { id: number; workflow_id: number }[];

      if (cRows.length === 0) {
        return null;
      }

      const conv = cRows[0];

      // Fetch messages
      const mRows = (await sql`
        SELECT
          id,
          role,
          content,
          proposed_plan AS "proposedPlan",
          created_at AS "createdAt"
        FROM agent_messages
        WHERE conversation_id = ${conv.id}
        ORDER BY id ASC
      `) as AgentMessageRow[];

      return {
        id: conv.id,
        workflowId: conv.workflow_id,
        messages: mRows,
      } satisfies GetConversationResponse;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, "Internal server error");
    }
  });
