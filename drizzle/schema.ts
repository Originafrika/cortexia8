import { pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

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
