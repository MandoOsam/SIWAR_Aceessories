import { index, integer, jsonb, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import type { L10n } from "@/types/l10n.js";
import type { OrderVariant } from "@/types/orders.js";
import { orders } from "./orders.js";
import { products } from "./products.js";

/**
 * Order line snapshot (02-architecture section 6). The name, image and price
 * are copied at checkout so later catalogue edits never rewrite history.
 * `product_id` is nullable with `set null`: an order survives a hard product
 * delete (D-081), and the snapshot still renders.
 */
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    nameSnapshot: jsonb("name_snapshot").$type<L10n>().notNull(),
    imageUrl: text("image_url"),
    variant: jsonb("variant").$type<OrderVariant>(),
    qty: integer("qty").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)],
).enableRLS();

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
