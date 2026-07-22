import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  role: text("role").notNull().default("user"),
  creditsBalance: numeric("credits_balance", { precision: 12, scale: 6 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waitlist = pgTable(
  "waitlist",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    profession: text("profession").notNull(),
    referral_code: text("referral_code").notNull(),
    referred_by: text("referred_by"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("waitlist_email_idx").on(table.email),
    referralCodeIdx: uniqueIndex("waitlist_referral_code_idx").on(table.referral_code),
  }),
);

export const models = pgTable(
  "models",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    provider: text("provider").notNull(),
    category: text("category").notNull(),
    apiFamily: text("api_family"),
    kieEndpoint: text("kie_endpoint").notNull(),
    inputSchema: jsonb("input_schema").notNull(),
    outputType: text("output_type").notNull(),
    pricingUnit: text("pricing_unit").notNull(),
    providerCostUsd: numeric("provider_cost_usd", { precision: 12, scale: 6 })
      .notNull()
      .default("0"),
    cortexiaPriceUsd: numeric("cortexia_price_usd", { precision: 12, scale: 6 })
      .notNull()
      .default("0"),
    fidelityStatus: text("fidelity_status").notNull().default("generique"),
    supportsReferenceUpload: boolean("supports_reference_upload")
      .notNull()
      .default(false),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("models_slug_idx").on(table.slug),
    endpointIdx: uniqueIndex("models_endpoint_idx").on(table.kieEndpoint),
    categoryIdx: index("models_category_idx").on(table.category),
    activeIdx: index("models_active_idx").on(table.active),
  }),
);

export const workflows = pgTable(
  "workflows",
  {
    id: serial("id").primaryKey(),
    userId: serial("user_id").references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("workflows_user_idx").on(table.userId),
  }),
);

export const workflowNodes = pgTable(
  "workflow_nodes",
  {
    id: serial("id").primaryKey(),
    workflowId: serial("workflow_id")
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("model"),
    modelSlug: text("model_slug")
      .notNull()
      .references(() => models.slug),
    status: text("status").notNull().default("unconfigured"),
    config: jsonb("config").notNull().default({}),
    canvasX: text("canvas_x").notNull().default("0"),
    canvasY: text("canvas_y").notNull().default("0"),
    canvasWidth: text("canvas_width").notNull().default("220"),
    canvasHeight: text("canvas_height").notNull().default("120"),
  },
  (table) => ({
    workflowIdx: index("workflow_nodes_workflow_idx").on(table.workflowId),
  }),
);

export const workflowEdges = pgTable(
  "workflow_edges",
  {
    id: serial("id").primaryKey(),
    workflowId: serial("workflow_id")
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    sourceNodeId: serial("source_node_id")
      .notNull()
      .references(() => workflowNodes.id, { onDelete: "cascade" }),
    sourceOutputKey: text("source_output_key").notNull().default("out"),
    targetNodeId: serial("target_node_id")
      .notNull()
      .references(() => workflowNodes.id, { onDelete: "cascade" }),
    targetInputKey: text("target_input_key").notNull().default("in"),
  },
  (table) => ({
    workflowIdx: index("workflow_edges_workflow_idx").on(table.workflowId),
    sourceIdx: index("workflow_edges_source_idx").on(table.sourceNodeId),
    targetIdx: index("workflow_edges_target_idx").on(table.targetNodeId),
  }),
);

export const runs = pgTable(
  "runs",
  {
    id: serial("id").primaryKey(),
    workflowId: serial("workflow_id")
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    userId: serial("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull().default("pending"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    totalCostUsd: numeric("total_cost_usd", { precision: 12, scale: 6 })
      .notNull()
      .default("0"),
  },
  (table) => ({
    workflowIdx: index("runs_workflow_idx").on(table.workflowId),
    userIdx: index("runs_user_idx").on(table.userId),
  }),
);

export const runNodeExecutions = pgTable(
  "run_node_executions",
  {
    id: serial("id").primaryKey(),
    runId: serial("run_id")
      .notNull()
      .references(() => runs.id, { onDelete: "cascade" }),
    workflowNodeId: serial("workflow_node_id")
      .notNull()
      .references(() => workflowNodes.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),
    kieTaskId: text("kie_task_id"),
    inputParams: jsonb("input_params").notNull().default({}),
    outputAssetId: integer("output_asset_id"),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    costUsd: numeric("cost_usd", { precision: 12, scale: 6 })
      .notNull()
      .default("0"),
  },
  (table) => ({
    runIdx: index("rne_run_idx").on(table.runId),
    kieTaskIdx: index("rne_kie_task_idx").on(table.kieTaskId),
    statusIdx: index("rne_status_idx").on(table.status),
  }),
);

export const assets = pgTable(
  "assets",
  {
    id: serial("id").primaryKey(),
    userId: serial("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    runNodeExecutionId: serial("run_node_execution_id").references(
      () => runNodeExecutions.id,
      { onDelete: "set null" },
    ),
    modelSlug: text("model_slug").references(() => models.slug),
    type: text("type").notNull(),
    storageUrl: text("storage_url").notNull(),
    previewUrl: text("preview_url"),
    metadata: jsonb("metadata").notNull().default({}),
    isPublicWall: boolean("is_public_wall").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("assets_user_idx").on(table.userId),
    rneIdx: index("assets_rne_idx").on(table.runNodeExecutionId),
    typeIdx: index("assets_type_idx").on(table.type),
  }),
);

export const creditsLedger = pgTable(
  "credits_ledger",
  {
    id: serial("id").primaryKey(),
    userId: serial("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 6 }).notNull(),
    type: text("type").notNull(),
    reference: text("reference"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("credits_ledger_user_idx").on(table.userId),
    typeIdx: index("credits_ledger_type_idx").on(table.type),
  }),
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: serial("id").primaryKey(),
    userId: serial("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("Clé"),
    keyHash: text("key_hash").notNull().unique(),
    prefix: text("prefix").notNull().default(""),
    permissions: jsonb("permissions").notNull().default([]),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastUsedAt: timestamp("last_used_at"),
  },
  (table) => ({
    userIdx: index("api_keys_user_idx").on(table.userId),
  }),
);

export const paymentTransactions = pgTable(
  "payment_transactions",
  {
    id: serial("id").primaryKey(),
    userId: serial("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerTransactionId: text("provider_transaction_id"),
    amountLocal: numeric("amount_local", { precision: 12, scale: 6 }).notNull(),
    currency: text("currency").notNull(),
    amountUsdCredited: numeric("amount_usd_credited", {
      precision: 12,
      scale: 6,
    }).notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("payment_transactions_user_idx").on(table.userId),
    providerIdx: index("payment_transactions_provider_idx").on(table.provider),
    statusIdx: index("payment_transactions_status_idx").on(table.status),
  }),
);

export const agentConversations = pgTable(
  "agent_conversations",
  {
    id: serial("id").primaryKey(),
    workflowId: serial("workflow_id")
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    userId: serial("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    workflowIdx: index("agent_conversations_workflow_idx").on(table.workflowId),
    userIdx: index("agent_conversations_user_idx").on(table.userId),
  }),
);

export const agentMessages = pgTable(
  "agent_messages",
  {
    id: serial("id").primaryKey(),
    conversationId: serial("conversation_id")
      .notNull()
      .references(() => agentConversations.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: text("content").notNull(),
    proposedPlan: jsonb("proposed_plan"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    conversationIdx: index("agent_messages_conversation_idx").on(table.conversationId),
  }),
);
