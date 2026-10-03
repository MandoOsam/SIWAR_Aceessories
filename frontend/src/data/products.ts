import type { Category, Product, ProductColor, ProductImage } from "@/services/types";

import { findCategoryBySlug } from "./categories";
import { seeds, type ProductSeed, type Tone } from "./productSeeds";

const PLACEHOLDER = "/assets/placeholder";

/**
 * Mock catalogue exposed through the service layer.
 *
 * `GET /products` returns exactly this shape, so `src/services/catalogService.ts` can serve mock
 * data and the real API without any change above it (02-architecture.md §4).
 *
 * TODO(Mando): the seed list in `./productSeeds.ts` is placeholder content.
 */
function buildImages(seed: ProductSeed): ProductImage[] {
  const tones: Tone[] = seed.colors.map((color) => (color === "rose-gold" ? "rose" : color));
  const uniqueTones = [...new Set(tones.length > 0 ? tones : ["gold" as Tone])];

  // One image per colour variant; the first one is the primary (02-architecture.md §6).
  return uniqueTones.map((tone, index) => ({
    url: `${PLACEHOLDER}/product-${tone}.svg`,
    alt: { ar: seed.nameAr, en: seed.nameEn },
    isPrimary: index === 0,
  }));
}

/** Products always carry the category name so lists never need a second lookup. */
function requireCategory(slug: ProductSeed["category"]): Category {
  const category = findCategoryBySlug(slug);
  if (category === undefined) {
    throw new Error(`Mock data error: product category "${slug}" does not exist`);
  }
  return category;
}

export const products: Product[] = seeds.map((seed) => {
  const category = requireCategory(seed.category);
  const oldPrice = seed.oldPrice ?? undefined;
  const discountPercent =
    oldPrice !== undefined && oldPrice > seed.price
      ? Math.round(((oldPrice - seed.price) / oldPrice) * 100)
      : undefined;

  return {
    id: seed.slug,
    slug: seed.slug,
    name: { ar: seed.nameAr, en: seed.nameEn },
    description: { ar: seed.descriptionAr, en: seed.descriptionEn },
    category,
    price: seed.price,
    oldPrice,
    discountPercent,
    images: buildImages(seed),
    colors: seed.colors satisfies ProductColor[],
    sizes: seed.sizes,
    stock: seed.stock,
    isNew: seed.isNew ?? false,
    isBestSeller: seed.isBestSeller ?? false,
    isFeatured: seed.isFeatured ?? false,
    rating: seed.rating,
    reviewsCount: seed.reviewsCount,
    material: "stainless-steel",
    waterResistant: true,
    hypoallergenic: true,
    createdAt: seed.createdAt,
  };
});
