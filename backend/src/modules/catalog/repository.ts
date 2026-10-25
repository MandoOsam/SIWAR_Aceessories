import {
  and,
  arrayContains,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  lte,
  ne,
  notInArray,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { db } from "@/db/client.js";
import { categories } from "@/db/schema/categories.js";
import { productImages } from "@/db/schema/productImages.js";
import { products } from "@/db/schema/products.js";
import type { Product, ProductStatus } from "@/db/schema/products.js";
import type { Category } from "@/db/schema/categories.js";
import type { ProductImage } from "@/db/schema/productImages.js";
import type { ProductListFilters, ProductSort } from "./types.js";

export const PRODUCT_COLORS = ["gold", "silver", "rose-gold", "black"] as const;

const ACTIVE: ProductStatus = "active";

export type ProductRow = { product: Product; category: Category };

/** Escapes LIKE wildcards so a search for "50%" is a literal search. */
function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function orderBy(sort: ProductSort): SQL[] {
  switch (sort) {
    case "price-asc":
      return [asc(products.price)];
    case "price-desc":
      return [desc(products.price)];
    case "best-selling":
      return [desc(products.isBestSeller), desc(products.stock)];
    case "rating":
      // No ratings until reviews (B6); best sellers are the closest proxy.
      return [desc(products.isBestSeller), desc(products.isFeatured)];
    case "newest":
    default:
      return [desc(products.createdAt)];
  }
}

function buildConditions(filters: ProductListFilters): SQL[] {
  const conditions: SQL[] = [eq(products.status, ACTIVE)];

  if (filters.categoryId !== undefined) {
    conditions.push(eq(products.categoryId, filters.categoryId));
  }
  if (filters.excludeCategoryId !== undefined) {
    conditions.push(ne(products.categoryId, filters.excludeCategoryId));
  }
  if (filters.excludeIds !== undefined && filters.excludeIds.length > 0) {
    conditions.push(notInArray(products.id, filters.excludeIds));
  }
  if (filters.minPrice !== undefined) {
    conditions.push(gte(products.price, filters.minPrice.toFixed(2)));
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(lte(products.price, filters.maxPrice.toFixed(2)));
  }
  if (filters.inStock === true) {
    conditions.push(gte(products.stock, 1));
  }
  if (filters.color !== undefined) {
    conditions.push(arrayContains(products.colors, [filters.color]));
  }
  if (filters.size !== undefined) {
    conditions.push(arrayContains(products.sizes, [filters.size]));
  }
  if (filters.discount === true) {
    conditions.push(isNotNull(products.oldPrice));
  }
  if (filters.isNew === true) {
    conditions.push(eq(products.isNew, true));
  }
  if (filters.search !== undefined && filters.search !== "") {
    const pattern = `%${escapeLike(filters.search)}%`;
    const byName = or(
      ilike(sql`${products.name} ->> 'ar'`, pattern),
      ilike(sql`${products.name} ->> 'en'`, pattern),
      ilike(products.sku, pattern),
    );
    if (byName !== undefined) conditions.push(byName);
  }

  return conditions;
}

export function listActiveCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.slug));
}

export function findActiveCategoryBySlug(slug: string) {
  return db.query.categories.findFirst({
    where: and(eq(categories.slug, slug), eq(categories.isActive, true)),
  });
}

export async function listActiveProducts(
  filters: ProductListFilters,
): Promise<{ rows: ProductRow[]; total: number }> {
  const where = and(...buildConditions(filters));
  const offset = (filters.page - 1) * filters.limit;

  const [rows, countRows] = await Promise.all([
    db
      .select({ product: products, category: categories })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(...orderBy(filters.sort), asc(products.id))
      .limit(filters.limit)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(products)
      .where(where),
  ]);

  return { rows, total: countRows[0]?.total ?? 0 };
}

export async function findActiveProductBySlug(slug: string): Promise<ProductRow | null> {
  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.status, ACTIVE)));
  return rows[0] ?? null;
}

/** Ordered primary-first, then by `sortOrder`. */
export function listImagesForProducts(productIds: string[]): Promise<ProductImage[]> {
  if (productIds.length === 0) return Promise.resolve([]);
  return db
    .select()
    .from(productImages)
    .where(inArray(productImages.productId, productIds))
    .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder));
}
