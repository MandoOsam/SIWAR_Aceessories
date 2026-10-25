import { index, jsonb, numeric, pgSequence, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import type {
  DbPaymentMethod,
  DeliveryOptionId,
  OrderAddress,
  OrderState,
  PaymentStatus,
} from "@/types/orders.js";
import { users } from "./users.js";

/**
 * Order numbers are allocated from a sequence (not `count + 1`) so two
 * concurrent checkouts can never receive the same `SW-xxxxx` number
 * (D-081). Starts at 10025, matching the storefront mock.
 */
export const orderNumberSequence = pgSequence("order_number_seq", { startWith: 10025 });

/**
 * Order header (02-architecture section 6). Prices are recomputed on the
 * server at checkout (03-code-standards section 4); the customer row keeps
 * the contact snapshot even if the guest never registers.
 *
 * `delivery_option_id` was added in B5 because the storefront `Order` contract
 * exposes the chosen delivery option and the fee cannot be re-derived later.
 */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    number: varchar("number", { length: 20 }).notNull().unique(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    customerName: varchar("customer_name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 30 }).notNull(),
    email: varchar("email", { length: 254 }),
    address: jsonb("address").$type<OrderAddress>().notNull(),
    deliveryOptionId: varchar("delivery_option_id", { length: 20 })
      .$type<DeliveryOptionId>()
      .notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    shipping: numeric("shipping", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    couponCode: varchar("coupon_code", { length: 40 }),
    paymentMethod: varchar("payment_method", { length: 20 }).$type<DbPaymentMethod>().notNull(),
    paymentStatus: varchar("payment_status", { length: 12 })
      .$type<PaymentStatus>()
      .notNull()
      .default("unpaid"),
    paymentProofUrl: text("payment_proof_url"),
    status: varchar("status", { length: 20 }).$type<OrderState>().notNull().default("pending"),
    trackingNumber: varchar("tracking_number", { length: 80 }),
    courier: varchar("courier", { length: 80 }),
    internalNote: text("internal_note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("orders_created_at_idx").on(table.createdAt),
    index("orders_status_idx").on(table.status),
    index("orders_payment_status_idx").on(table.paymentStatus),
    index("orders_phone_idx").on(table.phone),
    index("orders_user_id_idx").on(table.userId),
  ],
).enableRLS();

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
