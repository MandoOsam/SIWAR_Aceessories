import { boolean, index, integer, jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: jsonb("name").$type<{ ar: string; en: string }>().notNull(),
    discountPercent: integer("discount_percent").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    target: jsonb("target").$type<{ products?: string[]; categories?: string[] }>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("campaigns_is_active_idx").on(table.isActive),
    index("campaigns_starts_at_idx").on(table.startsAt),
  ],
).enableRLS();

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
