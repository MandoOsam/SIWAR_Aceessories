import type { Category } from "@/db/schema/categories.js";
import { slugify } from "@/lib/slug.js";
import { AppError } from "@/middlewares/errorHandler.js";
import * as repo from "./admin.repository.js";
import type { AdminCategoryDto } from "./admin.types.js";
import type {
  AdminCategoryListQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./admin.schema.js";
import { toCategoryDto } from "./service.js";

function toAdminCategoryDto(category: Category, productCount: number): AdminCategoryDto {
  return {
    ...toCategoryDto(category),
    seo: category.seo,
    productCount,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

function notFound(): AppError {
  return new AppError("NOT_FOUND", 404, "Category not found");
}

async function assertParent(parentId: string | null | undefined, selfId: string | null): Promise<void> {
  if (parentId === null || parentId === undefined) return;

  if (parentId === selfId) {
    throw new AppError("VALIDATION_ERROR", 400, "A category cannot be its own parent");
  }
  if ((await repo.findCategoryById(parentId)) === undefined) {
    throw new AppError("UNPROCESSABLE_ENTITY", 422, "Parent category does not exist");
  }
}

/** Walks up the tree so re-parenting cannot create a loop. */
async function assertNoCycle(id: string, parentId: string): Promise<void> {
  let cursor: string | null = parentId;
  for (let depth = 0; cursor !== null && depth < 50; depth += 1) {
    if (cursor === id) {
      throw new AppError("VALIDATION_ERROR", 400, "Category hierarchy cannot contain a loop");
    }
    cursor = (await repo.findCategoryById(cursor))?.parentId ?? null;
  }
}

export async function listCategories(query: AdminCategoryListQuery): Promise<AdminCategoryDto[]> {
  const rows = await repo.listAdminCategories(query);
  return rows.map((row) => toAdminCategoryDto(row, row.productCount));
}

export async function createCategory(input: CreateCategoryInput): Promise<AdminCategoryDto> {
  const slug = input.slug ?? slugify(input.name.en);
  if (slug === "") {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "slug is required when the English name has no Latin characters",
    );
  }
  if ((await repo.findCategoryBySlug(slug)) !== undefined) {
    throw new AppError("CONFLICT", 409, "A category with this slug already exists");
  }
  await assertParent(input.parentId, null);

  const category = await repo.insertCategory({
    slug,
    name: input.name,
    description: input.description ?? { ar: "", en: "" },
    imageUrl: input.imageUrl ?? null,
    parentId: input.parentId ?? null,
    sortOrder: input.sortOrder ?? 0,
    isActive: input.isActive ?? true,
    seo: input.seo ?? null,
  });
  return toAdminCategoryDto(category, 0);
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<AdminCategoryDto> {
  const existing = await repo.findCategoryById(id);
  if (existing === undefined) throw notFound();

  if (input.slug !== undefined && input.slug !== existing.slug) {
    const clash = await repo.findCategoryBySlug(input.slug);
    if (clash !== undefined && clash.id !== id) {
      throw new AppError("CONFLICT", 409, "A category with this slug already exists");
    }
  }
  await assertParent(input.parentId, id);
  if (input.parentId !== undefined && input.parentId !== null) {
    await assertNoCycle(id, input.parentId);
  }

  const category = await repo.updateCategory(id, input);
  if (category === null) throw notFound();
  return toAdminCategoryDto(category, await repo.countProductsInCategory(id));
}

export async function deleteCategory(id: string): Promise<void> {
  if ((await repo.findCategoryById(id)) === undefined) throw notFound();

  const productCount = await repo.countProductsInCategory(id);
  if (productCount > 0) {
    throw new AppError(
      "CONFLICT",
      409,
      `Category still has ${productCount} product(s); move or delete them first`,
    );
  }

  const deleted = await repo.deleteCategory(id);
  if (!deleted) throw notFound();
}
