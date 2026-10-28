import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";

/**
 * Saved delivery address (02-architecture section 6).
 *
 * The partial unique index enforces at most one default address per customer;
 * the service always clears the previous default before setting a new one in
 * the same transaction. Orders keep their own address snapshot, so editing or
 * deleting an address never rewrites order history.
 */
export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    governorate: varchar("governorate", { length: 80 }).notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    street: varchar("street", { length: 255 }).notNull(),
    building: varchar("building", { length: 60 }),
    apartment: varchar("apartment", { length: 60 }),
    phone: varchar("phone", { length: 30 }).notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("addresses_user_id_idx").on(table.userId),
    uniqueIndex("addresses_user_default_idx")
      .on(table.userId)
      .where(sql`${table.isDefault} = true`),
  ],
).enableRLS();

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
