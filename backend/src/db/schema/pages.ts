import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import type { L10n } from "@/types/l10n.js";

/**
 * Static pages (02-architecture section 6): about, contact, shipping,
 * returns, privacy, terms. Copy is bilingual jsonb so it can be edited from
 * the dashboard without a deploy.
 */
export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  title: jsonb("title").$type<L10n>().notNull(),
  body: jsonb("body").$type<L10n>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
