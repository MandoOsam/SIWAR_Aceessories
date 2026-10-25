import { and, asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/db/client.js";
import { categories } from "@/db/schema/categories.js";
import type { Category } from "@/db/schema/categories.js";
import { productImages } from "@/db/schema/productImages.js";
import type { ProductImage } from "@/db/schema/productImages.js";
import { products } from "@/db/schema/products.js";
import type { NewProduct, Product, ProductStatus } from "@/db/schema/products.js";
import type { L10n } from "@/types/l10n.js";
import { escapeLike } from "./repository.js";

export type AdminProductRow = { product: Product; category: Category };

export type ProductImageInput = {
  url: string;
  alt: L10n;
  isPrimary: boolean;
  sortOrder: number;
};

export type AdminProductFilters = {
  status?: ProductStatus;
  categoryId?: string;
  search?: string;
  sort: "newest" | "oldest" | "price-asc" | "price-desc";
  page: number;
  limit: number;
};

function orderBy(sort: AdminProductFilters["sort"]): SQL[] {
  switch (sort) {
    case "oldest":
      return [asc(products.createdAt)];
    case "price-asc":
      return [asc(products.price)];
    case "price-desc":
      return [desc(products.price)];
    case "newest":
    default:
      return [desc(products.createdAt)];
  }
}

function buildConditions(filters: AdminProductFilters): SQL[] {
  const conditions: SQL[] = [];
  if (filters.status !== undefined) conditions.push(eq(products.status, filters.status));
  if (filters.categoryId !== undefined) {
    conditions.push(eq(products.categoryId, filters.categoryId));
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

export async function listAdminProducts(
  filters: AdminProductFilters,
): Promise<{ rows: AdminProductRow[]; total: number }> {
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
    db.select({ total: sql<number>`count(*)::int` }).from(products).where(where),
  ]);

  return { rows, total: countRows[0]?.total ?? 0 };
}

export async function findAdminProductById(id: string): Promise<AdminProductRow | null> {
  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, id));
  return rows[0] ?? null;
}

export function findProductBySlug(slug: string): Promise<Product | undefined> {
  return db.query.products.findFirst({ where: eq(products.slug, slug) });
}

export function findProductBySku(sku: string): Promise<Product | undefined> {
  return db.query.products.findFirst({ where: eq(products.sku, sku) });
}

function imageRows(productId: string, images: ProductImageInput[]) {
  return images.map((image) => ({ productId, ...image }));
}

/** Product + gallery are written together; a half-created product must never be visible. */
export async function insertProductWithImages(
  values: NewProduct,
  images: ProductImageInput[],
): Promise<{ product: Product; images: ProductImage[] }> {
  return db.transaction(async (tx) => {
    const [product] = await tx.insert(products).values(values).returning();
    if (product === undefined) throw new Error("product insert returned no row");

    const inserted =
      images.length === 0
        ? []
        : await tx.insert(productImages).values(imageRows(product.id, images)).returning();

    return { product, images: inserted };
  });
}

/**
 * Updates the product and, when `images` is provided, replaces the whole
 * gallery (simplest predictable behaviour for a form that edits the list).
 */
export async function updateProductWithImages(
  id: string,
  values: Partial<NewProduct>,
  images?: ProductImageInput[],
): Promise<{ product: Product; images: ProductImage[] } | null> {
  return db.transaction(async (tx) => {
    const [product] = await tx
      .update(products)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    if (product === undefined) return null;

    if (images !== undefined) {
      await tx.delete(productImages).where(eq(productImages.productId, id));
      if (images.length > 0) {
        await tx.insert(productImages).values(imageRows(id, images));
      }
    }

    const rows = await tx
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder));

    return { product, images: rows };
  });
}

/** Gallery rows are removed by the `product_images` cascade. */
export async function deleteProduct(id: string): Promise<boolean> {
  const rows = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
  return rows.length > 0;
}
