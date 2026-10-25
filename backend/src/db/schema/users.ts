import { relations } from "drizzle-orm";
import { boolean, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { sessions } from "./sessions.js";

export const USER_ROLES = ["customer", "super_admin", "manager", "support", "content"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/**
 * Row Level Security is declared here (not hand-written into the migration SQL)
 * so Drizzle tracks it in the snapshot and every future migration keeps it on.
 * RLS with no policies means the public Supabase REST API cannot read the
 * table; only the backend's own database role can (02-architecture §6).
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  displayName: jsonb("display_name").$type<{ ar: string; en: string }>(),
  role: varchar("role", { length: 20 }).$type<UserRole>().notNull().default("customer"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
