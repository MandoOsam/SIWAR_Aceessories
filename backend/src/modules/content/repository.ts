import { asc, eq } from "drizzle-orm";

import { db } from "@/db/client.js";
import {
  contentBlocks,
  type ContentBlock,
  type NewContentBlock,
} from "@/db/schema/contentBlocks.js";
import { pages, type NewPage, type Page } from "@/db/schema/pages.js";
import {
  storeSettings,
  type NewStoreSettings,
  type StoreSettingsRow,
} from "@/db/schema/storeSettings.js";

/** Active blocks in display order; inactive rows never reach the storefront. */
export function listActiveBlocks(): Promise<ContentBlock[]> {
  return db
    .select()
    .from(contentBlocks)
    .where(eq(contentBlocks.isActive, true))
    .orderBy(asc(contentBlocks.sortOrder), asc(contentBlocks.key));
}

export function listBlocks(): Promise<ContentBlock[]> {
  return db
    .select()
    .from(contentBlocks)
    .orderBy(asc(contentBlocks.sortOrder), asc(contentBlocks.key));
}

export function findBlockByKey(key: string): Promise<ContentBlock | undefined> {
  return db.query.contentBlocks.findFirst({ where: eq(contentBlocks.key, key) });
}

/** Upsert so the dashboard can create new keys (`banner:1`) with the same call. */
export async function upsertBlock(values: NewContentBlock): Promise<ContentBlock> {
  const [block] = await db
    .insert(contentBlocks)
    .values(values)
    .onConflictDoUpdate({
      target: contentBlocks.key,
      set: {
        data: values.data,
        sortOrder: values.sortOrder ?? 0,
        isActive: values.isActive ?? true,
        updatedAt: new Date(),
      },
    })
    .returning();
  if (block === undefined) throw new Error("content block upsert returned no row");
  return block;
}

export async function deleteBlockByKey(key: string): Promise<boolean> {
  const rows = await db
    .delete(contentBlocks)
    .where(eq(contentBlocks.key, key))
    .returning({ id: contentBlocks.id });
  return rows.length > 0;
}

export function listPages(): Promise<Page[]> {
  return db.select().from(pages).orderBy(asc(pages.slug));
}

export function findPageBySlug(slug: string): Promise<Page | undefined> {
  return db.query.pages.findFirst({ where: eq(pages.slug, slug) });
}

export async function upsertPage(values: NewPage): Promise<Page> {
  const [page] = await db
    .insert(pages)
    .values(values)
    .onConflictDoUpdate({
      target: pages.slug,
      set: { title: values.title, body: values.body, updatedAt: new Date() },
    })
    .returning();
  if (page === undefined) throw new Error("page upsert returned no row");
  return page;
}

export async function deletePageBySlug(slug: string): Promise<boolean> {
  const rows = await db.delete(pages).where(eq(pages.slug, slug)).returning({ id: pages.id });
  return rows.length > 0;
}

/** The settings singleton; the app never creates a second row (D-076). */
export async function findSettings(): Promise<StoreSettingsRow | undefined> {
  const [row] = await db.select().from(storeSettings).orderBy(asc(storeSettings.createdAt)).limit(1);
  return row;
}

export async function updateSettings(
  id: string,
  values: Partial<NewStoreSettings>,
): Promise<StoreSettingsRow> {
  const [row] = await db
    .update(storeSettings)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(storeSettings.id, id))
    .returning();
  if (row === undefined) throw new Error("store settings update returned no row");
  return row;
}
