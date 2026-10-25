import { boolean, index, integer, jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import type { ContentBlockData } from "@/types/content.js";

/**
 * Editable home content (02-architecture section 6). `key` identifies the
 * block: `hero` and `story` are singletons, `featured:<id>` are ordered
 * featured collections, and future keys (e.g. `banner:1`) stay free-form.
 */
export const contentBlocks = pgTable(
  "content_blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 80 }).notNull().unique(),
    data: jsonb("data").$type<ContentBlockData>().notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("content_blocks_sort_order_idx").on(table.sortOrder)],
).enableRLS();

export type ContentBlock = typeof contentBlocks.$inferSelect;
export type NewContentBlock = typeof contentBlocks.$inferInsert;
