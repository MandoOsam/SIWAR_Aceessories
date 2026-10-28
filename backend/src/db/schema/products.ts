import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type { L10n, Seo } from "@/types/l10n.js";
import { categories } from "./categories.js";
import { productImages } from "./productImages.js";

export const PRODUCT_STATUSES = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

/**
 * Catalog product (02-architecture section 6).
 *
 * Money is `numeric(10,2)` (exact, no floating point in the database) and is
 * converted to a number at the API boundary, because the frontend contract
 * types `price` as `number`.
 *
 * `categoryId` is NOT NULL and `onDelete: restrict`: a product always has a
 * category, so the API never has to invent one. Deleting a category that still
 * holds products is rejected instead of silently orphaning them.
 */
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    sku: varchar("sku", { length: 64 }).notNull().unique(),
    name: jsonb("name").$type<L10n>().notNull(),
    description: jsonb("description").$type<L10n>().notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    oldPrice: numeric("old_price", { precision: 10, scale: 2 }),
    discountPercent: integer("discount_percent"),
    stock: integer("stock").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
    rating: numeric("rating", { precision: 2, scale: 1 }).notNull().default("0"),
    reviewsCount: integer("reviews_count").notNull().default(0),
    status: varchar("status", { length: 20 }).$type<ProductStatus>().notNull().default("draft"),
    isNew: boolean("is_new").notNull().default(false),
    isBestSeller: boolean("is_best_seller").notNull().default(false),
    isFeatured: boolean("is_featured").notNull().default(false),
    colors: text("colors")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    sizes: text("sizes")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    material: varchar("material", { length: 60 }).notNull().default("stainless-steel"),
    plating: jsonb("plating").$type<L10n>(),
    waterResistant: boolean("water_resistant").notNull().default(false),
    hypoallergenic: boolean("hypoallergenic").notNull().default(false),
    seo: jsonb("seo").$type<Seo>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("products_category_id_idx").on(table.categoryId),
    index("products_status_idx").on(table.status),
    index("products_price_idx").on(table.price),
    index("products_rating_idx").on(table.rating),
    index("products_created_at_idx").on(table.createdAt),
  ],
).enableRLS();

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
