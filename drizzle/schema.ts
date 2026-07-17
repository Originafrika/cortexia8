import {
  boolean,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

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
  }),
);
