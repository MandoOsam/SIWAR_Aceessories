import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import type { OrderState } from "@/types/orders.js";
import { orders } from "./orders.js";
import { users } from "./users.js";

/**
 * Append-only order timeline (02-architecture section 6). Every status change
 * writes a row; `actor_id` is the staff user for admin actions and null for
 * customer/system events. Rows are never updated or deleted.
 */
export const orderEvents = pgTable(
  "order_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).$type<OrderState>().notNull(),
    note: text("note"),
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("order_events_order_id_idx").on(table.orderId, table.createdAt)],
).enableRLS();

export type OrderEvent = typeof orderEvents.$inferSelect;
export type NewOrderEvent = typeof orderEvents.$inferInsert;
