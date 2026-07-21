ALTER TABLE "workflow_nodes" ADD COLUMN "status" text NOT NULL DEFAULT 'unconfigured';

CREATE TABLE "agent_conversations" (
	"id" serial PRIMARY KEY,
	"workflow_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agent_conversations_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "agent_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);

CREATE INDEX "agent_conversations_workflow_idx" ON "agent_conversations" ("workflow_id");
CREATE INDEX "agent_conversations_user_idx" ON "agent_conversations" ("user_id");

CREATE TABLE "agent_messages" (
	"id" serial PRIMARY KEY,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"proposed_plan" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agent_messages_conversation_id_agent_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."agent_conversations"("id") ON DELETE cascade ON UPDATE no action
);

CREATE INDEX "agent_messages_conversation_idx" ON "agent_messages" ("conversation_id");
