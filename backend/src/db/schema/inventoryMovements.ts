import { index, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { products } from "./products.js";

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    delta: integer("delta").notNull(),
    reason: varchar("reason", { length: 128 }).notNull(),
    actorId: uuid("actor_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("inventory_movements_product_id_idx").on(table.productId)],
).enableRLS();

export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type NewInventoryMovement = typeof inventoryMovements.$inferInsert;
