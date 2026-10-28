import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type { L10n } from "@/types/l10n.js";
import type { ReviewStatus } from "@/types/reviews.js";
import { products } from "./products.js";
import { users } from "./users.js";

/**
 * Customer review (02-architecture section 6).
 *
 * `productId` is nullable so seeded testimonials (D-028) can live without a
 * product; `userId` is nullable because guests may submit a review. The
 * denormalised `products.rating` / `products.reviews_count` columns are
 * recalculated from approved rows on every moderation change (D-085).
 *
 * The unique index keeps one review per signed-in customer and product;
 * guests are not deduplicated because they have no stable identity.
 */
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    authorName: varchar("author_name", { length: 120 }).notNull(),
    rating: integer("rating").notNull(),
    text: jsonb("text").$type<L10n>().notNull(),
    images: text("images")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    status: varchar("status", { length: 12 }).$type<ReviewStatus>().notNull().default("pending"),
    isSeed: boolean("is_seed").notNull().default(false),
    showOnHome: boolean("show_on_home").notNull().default(false),
    isVerifiedPurchase: boolean("is_verified_purchase").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("reviews_product_id_idx").on(table.productId),
    index("reviews_status_idx").on(table.status),
    index("reviews_show_on_home_idx").on(table.showOnHome),
    index("reviews_created_at_idx").on(table.createdAt),
    uniqueIndex("reviews_user_product_idx").on(table.userId, table.productId),
    check("reviews_rating_check", sql`${table.rating} between 1 and 5`),
  ],
).enableRLS();

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
