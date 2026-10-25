import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import type {
  ContactSettings,
  PaymentMethod,
  ShippingSettings,
  SocialLink,
  TrustBadges,
} from "@/types/content.js";
import type { Seo } from "@/types/l10n.js";

/**
 * Store settings singleton (02-architecture section 6). Only `PATCH` exists in
 * the admin API and the repository always touches the first row, so extra rows
 * are impossible through the app. `store_name`/`currency` were added in B4 so
 * `GET /settings/public` matches the storefront `StoreSettings` contract
 * (D-076).
 */
export const storeSettings = pgTable("store_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeName: varchar("store_name", { length: 120 }).notNull().default("SIWAR"),
  currency: varchar("currency", { length: 3 }).notNull().default("EGP"),
  shipping: jsonb("shipping").$type<ShippingSettings>().notNull(),
  paymentMethods: jsonb("payment_methods").$type<PaymentMethod[]>().notNull(),
  trustBadges: jsonb("trust_badges").$type<TrustBadges>().notNull(),
  social: jsonb("social").$type<SocialLink[]>().notNull(),
  contact: jsonb("contact").$type<ContactSettings>().notNull(),
  seo: jsonb("seo").$type<Seo>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export type StoreSettingsRow = typeof storeSettings.$inferSelect;
export type NewStoreSettings = typeof storeSettings.$inferInsert;
