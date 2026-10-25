import { relations } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type { L10n, Seo } from "@/types/l10n.js";
import { products } from "./products.js";

/**
 * Category tree (02-architecture section 6). `parentId` is nullable so a
 * category can be top level or a child; deleting a parent detaches its
 * children instead of deleting them.
 */
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    name: jsonb("name").$type<L10n>().notNull(),
    description: jsonb("description").$type<L10n>().notNull(),
    imageUrl: text("image_url"),
    parentId: uuid("parent_id").references((): AnyPgColumn => categories.id, {
      onDelete: "set null",
    }),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    seo: jsonb("seo").$type<Seo>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("categories_parent_id_idx").on(table.parentId),
    index("categories_is_active_idx").on(table.isActive),
    index("categories_sort_order_idx").on(table.sortOrder),
  ],
).enableRLS();

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "category_parent",
  }),
  children: many(categories, { relationName: "category_parent" }),
  products: many(products),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
