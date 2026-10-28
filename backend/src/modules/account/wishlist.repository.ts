import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db/client.js";
import { products, type Product } from "@/db/schema/products.js";
import { wishlistItems } from "@/db/schema/wishlistItems.js";
import { AppError } from "@/middlewares/errorHandler.js";

function notFound(): AppError {
  return new AppError("NOT_FOUND", 404, "Product not found");
}

export async function listProductIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ productId: wishlistItems.productId })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, userId))
    .orderBy(desc(wishlistItems.createdAt));
  return rows.map((row) => row.productId);
}

export async function addProduct(userId: string, productId: string): Promise<void> {
  await db
    .insert(wishlistItems)
    .values({ userId, productId })
    .onConflictDoNothing({
      target: [wishlistItems.userId, wishlistItems.productId],
    });
}

export async function removeProduct(userId: string, productId: string): Promise<boolean> {
  const [row] = await db
    .delete(wishlistItems)
    .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)))
    .returning({ productId: wishlistItems.productId });
  return row !== undefined;
}

/** The POST handler maps unknown/inactive products to 404 to match the API contract. */
export async function ensureProductExists(productId: string): Promise<Product> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  const product = rows[0];
  if (product === undefined) throw notFound();
  if (product.status !== "active") throw notFound();
  return product;
}

/** Batch helper used if we ever need to hydrate; wishlist ids are the source of truth. */
export async function listProductsForIds(productIds: string[]): Promise<Product[]> {
  if (productIds.length === 0) return [];
  return db.select().from(products).where(inArray(products.id, productIds));
}
