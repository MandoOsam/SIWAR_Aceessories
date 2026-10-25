import type { Category } from "@/db/schema/categories.js";
import type { ProductImage } from "@/db/schema/productImages.js";
import type { NewProduct } from "@/db/schema/products.js";
import type { L10n } from "@/types/l10n.js";
import { slugify } from "@/lib/slug.js";
import { AppError } from "@/middlewares/errorHandler.js";
import * as categoryRepo from "./admin.repository.js";
import * as repo from "./admin.products.repository.js";
import type { AdminProductRow, ProductImageInput } from "./admin.products.repository.js";
import type { AdminProductDto } from "./admin.types.js";
import type {
  AdminProductListQuery,
  CreateProductInput,
  UpdateProductInput,
} from "./admin.schema.js";
import { listImagesForProducts } from "./repository.js";
import { toProductDto } from "./service.js";

function toAdminProductDto(row: AdminProductRow, images: ProductImage[]): AdminProductDto {
  return {
    ...toProductDto(row, images),
    status: row.product.status,
    lowStockThreshold: row.product.lowStockThreshold,
    seo: row.product.seo,
    updatedAt: row.product.updatedAt.toISOString(),
  };
}

function productNotFound(): AppError {
  return new AppError("NOT_FOUND", 404, "Product not found");
}

async function requireCategory(categoryId: string): Promise<Category> {
  const category = await categoryRepo.findCategoryById(categoryId);
  if (category === undefined) {
    throw new AppError("UNPROCESSABLE_ENTITY", 422, "Category does not exist");
  }
  return category;
}

function deriveSlug(name: L10n, slug?: string): string {
  const value = slug ?? slugify(name.en);
  if (value === "") {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "slug is required when the English name has no Latin characters",
    );
  }
  return value;
}

function deriveSku(slug: string, sku?: string): string {
  return sku ?? `SW-${slug.toUpperCase()}`.slice(0, 64);
}

/** Auto-fills the discount when the admin only supplies a compare-at price. */
function discountFrom(price: number, oldPrice: number): number {
  if (oldPrice <= 0) return 0;
  const percent = Math.round(((oldPrice - price) / oldPrice) * 100);
  return Math.min(100, Math.max(0, percent));
}

function assertPriceOrder(price: number, oldPrice: number | null): void {
  if (oldPrice !== null && oldPrice < price) {
    throw new AppError("VALIDATION_ERROR", 400, "oldPrice cannot be lower than price");
  }
}

function dedupe(values: readonly string[]): string[] {
  return [...new Set(values)];
}

/** Exactly one primary image; when the client marks none, the first one wins. */
function normalizeImages(
  images: CreateProductInput["images"],
  name: L10n,
): ProductImageInput[] | undefined {
  if (images === undefined) return undefined;
  const primaryIndex = images.findIndex((image) => image.isPrimary === true);
  return images.map((image, index) => ({
    url: image.url,
    alt: image.alt ?? name,
    isPrimary: primaryIndex === -1 ? index === 0 : index === primaryIndex,
    sortOrder: image.sortOrder ?? index,
  }));
}

async function ensureUnique(
  slug: string,
  sku: string,
  ignoreId?: string,
): Promise<void> {
  const bySlug = await repo.findProductBySlug(slug);
  if (bySlug !== undefined && bySlug.id !== ignoreId) {
    throw new AppError("CONFLICT", 409, "A product with this slug already exists");
  }
  const bySku = await repo.findProductBySku(sku);
  if (bySku !== undefined && bySku.id !== ignoreId) {
    throw new AppError("CONFLICT", 409, "A product with this SKU already exists");
  }
}

function groupImages(rows: ProductImage[]): Map<string, ProductImage[]> {
  const byProduct = new Map<string, ProductImage[]>();
  for (const image of rows) {
    const list = byProduct.get(image.productId);
    if (list === undefined) {
      byProduct.set(image.productId, [image]);
    } else {
      list.push(image);
    }
  }
  return byProduct;
}

export async function listProducts(query: AdminProductListQuery): Promise<{
  data: AdminProductDto[];
  total: number;
  page: number;
  limit: number;
}> {
  let categoryId: string | undefined;
  if (query.category !== undefined) {
    const category = await categoryRepo.findCategoryBySlug(query.category);
    if (category === undefined) {
      return { data: [], total: 0, page: query.page, limit: query.limit };
    }
    categoryId = category.id;
  }

  const { rows, total } = await repo.listAdminProducts({ ...query, categoryId });
  const images = groupImages(await listImagesForProducts(rows.map((row) => row.product.id)));

  return {
    data: rows.map((row) => toAdminProductDto(row, images.get(row.product.id) ?? [])),
    total,
    page: query.page,
    limit: query.limit,
  };
}

export async function getProduct(id: string): Promise<AdminProductDto> {
  const row = await repo.findAdminProductById(id);
  if (row === null) throw productNotFound();
  const images = await listImagesForProducts([id]);
  return toAdminProductDto(row, images);
}

export async function createProduct(input: CreateProductInput): Promise<AdminProductDto> {
  const category = await requireCategory(input.categoryId);
  const slug = deriveSlug(input.name, input.slug);
  const sku = deriveSku(slug, input.sku);
  await ensureUnique(slug, sku);

  const oldPrice = input.oldPrice ?? null;
  const price = input.price;
  assertPriceOrder(price, oldPrice);

  const discountPercent =
    input.discountPercent !== undefined
      ? input.discountPercent
      : oldPrice === null
        ? null
        : discountFrom(price, oldPrice);

  const images = normalizeImages(input.images, input.name) ?? [];

  const values: NewProduct = {
    slug,
    sku,
    name: input.name,
    description: input.description,
    categoryId: category.id,
    price: price.toFixed(2),
    oldPrice: oldPrice === null ? null : oldPrice.toFixed(2),
    discountPercent,
    stock: input.stock ?? 0,
    lowStockThreshold: input.lowStockThreshold ?? 5,
    status: input.status ?? "draft",
    isNew: input.isNew ?? false,
    isBestSeller: input.isBestSeller ?? false,
    isFeatured: input.isFeatured ?? false,
    colors: dedupe(input.colors ?? []),
    sizes: dedupe(input.sizes ?? []),
    material: input.material ?? "stainless-steel",
    plating: input.plating ?? null,
    waterResistant: input.waterResistant ?? false,
    hypoallergenic: input.hypoallergenic ?? false,
    seo: input.seo ?? null,
  };

  const created = await repo.insertProductWithImages(values, images);
  return toAdminProductDto({ product: created.product, category }, created.images);
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<AdminProductDto> {
  const existing = await repo.findAdminProductById(id);
  if (existing === null) throw productNotFound();

  const current = existing.product;
  const slug = input.slug ?? current.slug;
  const sku = input.sku ?? current.sku;
  if (input.slug !== undefined || input.sku !== undefined) {
    await ensureUnique(slug, sku, id);
  }

  let category = existing.category;
  if (input.categoryId !== undefined) {
    category = await requireCategory(input.categoryId);
  }

  const price = input.price ?? Number(current.price);
  const oldPrice =
    input.oldPrice !== undefined
      ? input.oldPrice
      : current.oldPrice === null
        ? null
        : Number(current.oldPrice);
  assertPriceOrder(price, oldPrice);

  let discountPercent: number | null | undefined;
  if (input.discountPercent !== undefined) {
    discountPercent = input.discountPercent;
  } else if (input.oldPrice !== undefined) {
    discountPercent = oldPrice === null ? null : discountFrom(price, oldPrice);
  }

  const values: Partial<NewProduct> = {
    ...(input.slug === undefined ? {} : { slug }),
    ...(input.sku === undefined ? {} : { sku }),
    ...(input.name === undefined ? {} : { name: input.name }),
    ...(input.description === undefined ? {} : { description: input.description }),
    ...(input.categoryId === undefined ? {} : { categoryId: category.id }),
    ...(input.price === undefined ? {} : { price: price.toFixed(2) }),
    ...(input.oldPrice === undefined
      ? {}
      : { oldPrice: oldPrice === null ? null : oldPrice.toFixed(2) }),
    ...(discountPercent === undefined ? {} : { discountPercent }),
    ...(input.stock === undefined ? {} : { stock: input.stock }),
    ...(input.lowStockThreshold === undefined
      ? {}
      : { lowStockThreshold: input.lowStockThreshold }),
    ...(input.status === undefined ? {} : { status: input.status }),
    ...(input.isNew === undefined ? {} : { isNew: input.isNew }),
    ...(input.isBestSeller === undefined ? {} : { isBestSeller: input.isBestSeller }),
    ...(input.isFeatured === undefined ? {} : { isFeatured: input.isFeatured }),
    ...(input.colors === undefined ? {} : { colors: dedupe(input.colors) }),
    ...(input.sizes === undefined ? {} : { sizes: dedupe(input.sizes) }),
    ...(input.material === undefined ? {} : { material: input.material }),
    ...(input.plating === undefined ? {} : { plating: input.plating }),
    ...(input.waterResistant === undefined ? {} : { waterResistant: input.waterResistant }),
    ...(input.hypoallergenic === undefined
      ? {}
      : { hypoallergenic: input.hypoallergenic }),
    ...(input.seo === undefined ? {} : { seo: input.seo }),
  };

  const images = normalizeImages(input.images, input.name ?? current.name);
  const updated = await repo.updateProductWithImages(id, values, images);
  if (updated === null) throw productNotFound();

  return toAdminProductDto({ product: updated.product, category }, updated.images);
}

export async function deleteProduct(id: string): Promise<void> {
  if ((await repo.findAdminProductById(id)) === null) throw productNotFound();
  const deleted = await repo.deleteProduct(id);
  if (!deleted) throw productNotFound();
}
