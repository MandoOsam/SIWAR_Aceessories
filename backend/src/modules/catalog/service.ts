import type { Category } from "@/db/schema/categories.js";
import type { ProductImage } from "@/db/schema/productImages.js";
import * as repo from "./repository.js";
import type { ProductRow } from "./repository.js";
import type {
  CategoryDto,
  ProductDetailDto,
  ProductDto,
  ProductListFilters,
} from "./types.js";

/** Ratings come from reviews, which land in B6. Until then the API reports zeros. */
const RATING_PLACEHOLDER = 0;

export function toCategoryDto(category: Category): CategoryDto {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    imageUrl: category.imageUrl ?? "",
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
  };
}

export function toProductDto(row: ProductRow, images: ProductImage[]): ProductDto {
  const { product, category } = row;
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    description: product.description,
    category: toCategoryDto(category),
    price: Number(product.price),
    ...(product.oldPrice === null ? {} : { oldPrice: Number(product.oldPrice) }),
    ...(product.discountPercent === null ? {} : { discountPercent: product.discountPercent }),
    images: images.map((image) => ({
      url: image.url,
      alt: image.alt,
      isPrimary: image.isPrimary,
    })),
    colors: product.colors,
    ...(product.sizes.length === 0 ? {} : { sizes: product.sizes }),
    stock: product.stock,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    isFeatured: product.isFeatured,
    rating: RATING_PLACEHOLDER,
    reviewsCount: 0,
    material: product.material,
    ...(product.plating === null ? {} : { plating: product.plating }),
    waterResistant: product.waterResistant,
    hypoallergenic: product.hypoallergenic,
    createdAt: product.createdAt.toISOString(),
  };
}

async function toProductDtos(rows: ProductRow[]): Promise<ProductDto[]> {
  const images = await repo.listImagesForProducts(rows.map((row) => row.product.id));
  const byProduct = new Map<string, ProductImage[]>();
  for (const image of images) {
    const list = byProduct.get(image.productId);
    if (list === undefined) {
      byProduct.set(image.productId, [image]);
    } else {
      list.push(image);
    }
  }
  return rows.map((row) => toProductDto(row, byProduct.get(row.product.id) ?? []));
}

export async function listCategories(): Promise<CategoryDto[]> {
  const rows = await repo.listActiveCategories();
  return rows.map(toCategoryDto);
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDto | null> {
  const row = await repo.findActiveCategoryBySlug(slug);
  return row === undefined ? null : toCategoryDto(row);
}

export async function listProducts(
  input: Omit<ProductListFilters, "categoryId"> & { categorySlug?: string },
): Promise<{
  data: ProductDto[];
  total: number;
  page: number;
  limit: number;
}> {
  const { categorySlug, ...filters } = input;

  let categoryId: string | undefined;
  if (categorySlug !== undefined) {
    const category = await repo.findActiveCategoryBySlug(categorySlug);
    // An unknown category is an empty result, not a 404: filters are a search,
    // not a resource lookup.
    if (category === undefined) {
      return { data: [], total: 0, page: filters.page, limit: filters.limit };
    }
    categoryId = category.id;
  }

  const { rows, total } = await repo.listActiveProducts({ ...filters, categoryId });
  return {
    data: await toProductDtos(rows),
    total,
    page: filters.page,
    limit: filters.limit,
  };
}

const MATCHING_LIMIT = 4;
const RELATED_LIMIT = 8;

export async function getProductDetail(slug: string): Promise<ProductDetailDto | null> {
  const row = await repo.findActiveProductBySlug(slug);
  if (row === null) return null;

  const base: ProductListFilters = {
    sort: "newest",
    page: 1,
    limit: RELATED_LIMIT,
    excludeIds: [row.product.id],
  };

  const [matching, sameCategory, otherCategories] = await Promise.all([
    repo.listActiveProducts({
      ...base,
      categoryId: row.product.categoryId,
      limit: MATCHING_LIMIT,
    }),
    repo.listActiveProducts({ ...base, categoryId: row.product.categoryId }),
    repo.listActiveProducts({
      ...base,
      excludeCategoryId: row.product.categoryId,
      limit: RELATED_LIMIT,
    }),
  ]);

  const relatedRows = [...sameCategory.rows, ...otherCategories.rows].slice(0, RELATED_LIMIT);

  const [product] = await toProductDtos([row]);
  if (product === undefined) return null;

  return {
    product,
    matching: await toProductDtos(matching.rows),
    related: await toProductDtos(relatedRows),
  };
}
