import { index, jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import type { NotificationPayload, NotificationType } from "@/types/notifications.js";

/**
 * In-app notification (02-architecture section 6). `target` is either the
 * literal `admin` (the staff inbox) or a customer's user id; it is intentionally
 * not a foreign key so one admin row can serve every staff member.
 */
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    target: varchar("target", { length: 64 }).notNull(),
    type: varchar("type", { length: 20 }).$type<NotificationType>().notNull(),
    payload: jsonb("payload").$type<NotificationPayload>().notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("notifications_target_idx").on(table.target),
    index("notifications_read_at_idx").on(table.readAt),
    index("notifications_created_at_idx").on(table.createdAt),
  ],
).enableRLS();

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
