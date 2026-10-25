import { and, asc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/db/client.js";
import { categories } from "@/db/schema/categories.js";
import type { Category, NewCategory } from "@/db/schema/categories.js";
import { products } from "@/db/schema/products.js";
import { escapeLike } from "./repository.js";

export type AdminCategoryRow = Category & { productCount: number };

function searchCondition(search: string): SQL | undefined {
  const pattern = `%${escapeLike(search)}%`;
  return or(
    ilike(sql`${categories.name} ->> 'ar'`, pattern),
    ilike(sql`${categories.name} ->> 'en'`, pattern),
    ilike(categories.slug, pattern),
  );
}

/**
 * Admin category list: includes inactive rows and a live product count so the
 * dashboard can warn before a delete.
 */
export async function listAdminCategories(filters: {
  search?: string;
  isActive?: boolean;
}): Promise<AdminCategoryRow[]> {
  const conditions: SQL[] = [];
  if (filters.isActive !== undefined) {
    conditions.push(eq(categories.isActive, filters.isActive));
  }
  if (filters.search !== undefined && filters.search !== "") {
    const byName = searchCondition(filters.search);
    if (byName !== undefined) conditions.push(byName);
  }

  const rows = await db
    .select({
      category: categories,
      productCount: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.slug));

  return rows.map((row) => ({ ...row.category, productCount: row.productCount }));
}

export function findCategoryById(id: string): Promise<Category | undefined> {
  return db.query.categories.findFirst({ where: eq(categories.id, id) });
}

export function findCategoryBySlug(slug: string): Promise<Category | undefined> {
  return db.query.categories.findFirst({ where: eq(categories.slug, slug) });
}

export async function countProductsInCategory(categoryId: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.categoryId, categoryId));
  return row?.total ?? 0;
}

export async function insertCategory(values: NewCategory): Promise<Category> {
  const [category] = await db.insert(categories).values(values).returning();
  if (category === undefined) throw new Error("category insert returned no row");
  return category;
}

export async function updateCategory(
  id: string,
  values: Partial<NewCategory>,
): Promise<Category | null> {
  const [category] = await db
    .update(categories)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  return category ?? null;
}

/** Returns false when the row was already gone. Children are detached (set null) by the FK. */
export async function deleteCategory(id: string): Promise<boolean> {
  const rows = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
  return rows.length > 0;
}
