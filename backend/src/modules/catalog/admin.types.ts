import type { ProductStatus } from "@/db/schema/products.js";
import type { Seo } from "@/types/l10n.js";
import type { CategoryDto, ProductDto } from "./types.js";

/** Admin category shape: the public fields plus moderation and counting data. */
export type AdminCategoryDto = CategoryDto & {
  seo: Seo | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

/** Admin product shape: the storefront fields plus the columns drafts need. */
export type AdminProductDto = ProductDto & {
  status: ProductStatus;
  lowStockThreshold: number;
  seo: Seo | null;
  updatedAt: string;
};
