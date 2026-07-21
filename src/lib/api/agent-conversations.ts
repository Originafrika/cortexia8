/**
 * CRUD server functions for agent conversations.
 *
 *   - createConversation  — create a new conversation for a workflow
 *   - saveMessage         — save a message (user or assistant) to a conversation
 *   - getConversation     — fetch all messages for a conversation
 *   - getConversationByWorkflow — get the latest conversation for a workflow
 */

import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/lib/db";
import { getRequestContext, HttpError, requireUserId, toJsonResponse } from "./auth";

// ---------------------------------------------------------------------------
// createConversation
// ---------------------------------------------------------------------------

export type CreateConversationInput = {
  workflowId: number;
};

export type CreateConversationResponse = {
  id: number;
};

export const createConversation = createServerFn({ method: "POST" })
  .validator((data: CreateConversationInput): CreateConversationInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid input");
    if (!Number.isInteger(data.workflowId)) throw new HttpError(400, "workflowId is required");
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(new Headers());
      const userId = await requireUserId(ctx);

      const rows = (await sql`
        INSERT INTO agent_conversations (workflow_id, user_id)
        VALUES (${data.workflowId}, ${userId})
        RETURNING id
      `) as { id: number }[];

      return { id: rows[0].id } satisfies CreateConversationResponse;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });

// ---------------------------------------------------------------------------
// saveMessage
// ---------------------------------------------------------------------------

export type SaveMessageInput = {
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  proposedPlan?: any;
};

export type SaveMessageResponse = {
  id: number;
};

export const saveMessage = createServerFn({ method: "POST" })
  .validator((data: SaveMessageInput): SaveMessageInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid input");
    if (!Number.isInteger(data.conversationId)) throw new HttpError(400, "conversationId is required");
    if (data.role !== "user" && data.role !== "assistant") throw new HttpError(400, "role must be user or assistant");
    if (typeof data.content !== "string" || !data.content.trim()) throw new HttpError(400, "content is required");
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(new Headers());
      await requireUserId(ctx);

      const rows = (await sql`
        INSERT INTO agent_messages (conversation_id, role, content, proposed_plan)
        VALUES (${data.conversationId}, ${data.role}, ${data.content}, ${data.proposedPlan ? JSON.stringify(data.proposedPlan) : null}::jsonb)
        RETURNING id
      `) as { id: number }[];

      return { id: rows[0].id } satisfies SaveMessageResponse;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });

// ---------------------------------------------------------------------------
// getConversation
// ---------------------------------------------------------------------------

export type GetConversationInput = {
  conversationId: number;
};

export type AgentMessageRow = {
  id: number;
  role: string;
  content: string;
  proposedPlan: any;
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
    if (!Number.isInteger(data.conversationId)) throw new HttpError(400, "conversationId is required");
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(new Headers());
      await requireUserId(ctx);

      // Fetch conversation
      const cRows = (await sql`
        SELECT id, workflow_id
        FROM agent_conversations
        WHERE id = ${data.conversationId}
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
      throw toJsonResponse(err);
    }
  });

// ---------------------------------------------------------------------------
// getConversationByWorkflow — latest conversation for a given workflow
// ---------------------------------------------------------------------------

export type GetByWorkflowInput = {
  workflowId: number;
};

export const getConversationByWorkflow = createServerFn({ method: "GET" })
  .validator((data: GetByWorkflowInput): GetByWorkflowInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid input");
    if (!Number.isInteger(data.workflowId)) throw new HttpError(400, "workflowId is required");
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(new Headers());
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
      throw toJsonResponse(err);
    }
  });
