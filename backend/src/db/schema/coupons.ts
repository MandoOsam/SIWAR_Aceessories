import { boolean, integer, numeric, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import type { CouponType } from "@/types/orders.js";

/**
 * Coupons (02-architecture section 6). Codes are stored uppercase; the
 * service normalises user input before lookup. `free_shipping` was added in
 * B5 for the storefront `FREESHIP` coupon (D-082); use `type = fixed` with
 * `value = 0` alongside the flag.
 *
 * Money is numeric(10,2) like the rest of the catalogue; the API converts it
 * to a number.
 */
export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  type: varchar("type", { length: 10 }).$type<CouponType>().notNull(),
  value: numeric("value", { precision: 10, scale: 2 }).notNull(),
  minOrder: numeric("min_order", { precision: 10, scale: 2 }).notNull().default("0"),
  maxDiscount: numeric("max_discount", { precision: 10, scale: 2 }),
  freeShipping: boolean("free_shipping").notNull().default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
