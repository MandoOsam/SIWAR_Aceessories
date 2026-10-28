import type { ProductDto } from "@/modules/catalog/types.js";
import * as catalogService from "@/modules/catalog/service.js";
import * as repo from "./wishlist.repository.js";

export async function listWishlist(userId: string): Promise<{ data: ProductDto[] }> {
  const ids = await repo.listProductIds(userId);
  const products = await catalogService.listProductsByIds(ids);
  return { data: products };
}

export async function addToWishlist(userId: string, productId: string): Promise<void> {
  await repo.ensureProductExists(productId);
  await repo.addProduct(userId, productId);
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  await repo.removeProduct(userId, productId);
}
