import type { L10n } from "@/types/l10n.js";

/** Public category shape (`Category` in the frontend contract types). */
export type CategoryDto = {
  id: string;
  slug: string;
  name: L10n;
  description: L10n;
  imageUrl: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
};

/** Public image shape (`ProductImage` in the frontend contract types). */
export type ProductImageDto = {
  url: string;
  alt: L10n;
  isPrimary: boolean;
};

/**
 * Public product shape (`Product` in the frontend contract types).
 * `rating` and `reviewsCount` are denormalised from approved reviews (D-085).
 */
export type ProductDto = {
  id: string;
  slug: string;
  sku: string;
  name: L10n;
  description: L10n;
  category: CategoryDto;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  images: ProductImageDto[];
  colors: string[];
  sizes?: string[];
  stock: number;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  rating: number;
  reviewsCount: number;
  material: string;
  plating?: L10n;
  waterResistant: boolean;
  hypoallergenic: boolean;
  createdAt: string;
};

export type ProductDetailDto = {
  product: ProductDto;
  related: ProductDto[];
  matching: ProductDto[];
};

export type ProductColor = "gold" | "silver" | "rose-gold" | "black";

export type ProductSort = "newest" | "best-selling" | "price-asc" | "price-desc" | "rating";

export type ProductListFilters = {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  /** Minimum average rating ("4+" in the storefront filter). */
  rating?: number;
  inStock?: boolean;
  color?: ProductColor;
  size?: string;
  discount?: boolean;
  isNew?: boolean;
  search?: string;
  sort: ProductSort;
  page: number;
  limit: number;
  /** Products to leave out (the product own page). */
  excludeIds?: string[];
  /** Used by the related list: everything outside the current category. */
  excludeCategoryId?: string;
};
