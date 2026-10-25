import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { sql } from "drizzle-orm";

import { db, pool } from "@/db/client.js";

const here = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(here, "../src/db/migrations");

/** Applies all committed migrations to the test database (idempotent). */
export async function runMigrations(): Promise<void> {
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { migrate } = await import("drizzle-orm/node-postgres/migrator");
  const migratorDb = drizzle(pool);
  await migrate(migratorDb, { migrationsFolder: MIGRATIONS_FOLDER });
}

/** Empties all app tables between tests. */
export async function truncateAll(): Promise<void> {
  await db.execute(
    sql`TRUNCATE TABLE "order_events", "order_items", "orders", "coupons", "product_images", "products", "categories", "content_blocks", "pages", "store_settings", "sessions", "users" RESTART IDENTITY CASCADE`,
  );
  await db.execute(sql`ALTER SEQUENCE "order_number_seq" RESTART WITH 10025`);
}

export async function closeDb(): Promise<void> {
  await pool.end();
}
