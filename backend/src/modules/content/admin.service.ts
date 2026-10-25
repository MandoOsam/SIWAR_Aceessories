import type { NewPage, NewStoreSettings } from "@/db/schema/index.js";
import { AppError } from "@/middlewares/errorHandler.js";
import { issueDetails } from "@/middlewares/validate.js";
import type { AdminStoreSettings, ContentBlockData } from "@/types/content.js";
import * as repo from "./repository.js";
import { blockDataSchema } from "./schema.js";
import {
  toAdminContentBlockDto,
  toAdminPageDto,
  type AdminContentBlockDto,
  type AdminPageDto,
} from "./types.js";
import type { ContentBlockBody, PageBody, UpdateSettingsInput } from "./admin.schema.js";
import type { StoreSettingsRow } from "@/db/schema/storeSettings.js";

/** Validates the free-form body against the schema chosen by the key (D-077). */
function parseBlockData(key: string, data: ContentBlockData): ContentBlockData {
  const result = blockDataSchema(key).safeParse(data);
  if (!result.success) {
    const details = issueDetails(result.error.issues).map((issue) => ({
      ...issue,
      path: issue.path === "" ? "data" : `data.${issue.path}`,
    }));
    throw new AppError("VALIDATION_ERROR", 400, "Invalid content data", details);
  }
  return result.data;
}

function toAdminSettingsDto(row: StoreSettingsRow): AdminStoreSettings {
  return {
    storeName: row.storeName,
    currency: row.currency,
    shipping: row.shipping,
    paymentMethods: row.paymentMethods,
    trustBadges: row.trustBadges,
    social: row.social,
    contact: row.contact,
    seo: row.seo ?? null,
  };
}

function blockNotFound(): AppError {
  return new AppError("NOT_FOUND", 404, "Content block not found");
}

function pageNotFound(): AppError {
  return new AppError("NOT_FOUND", 404, "Page not found");
}

export async function listBlocks(): Promise<AdminContentBlockDto[]> {
  const rows = await repo.listBlocks();
  return rows.map(toAdminContentBlockDto);
}

export async function getBlock(key: string): Promise<AdminContentBlockDto> {
  const block = await repo.findBlockByKey(key);
  if (block === undefined) throw blockNotFound();
  return toAdminContentBlockDto(block);
}

/** PUT is an upsert so the dashboard can add a new block key in one call (D-078). */
export async function putBlock(
  key: string,
  input: ContentBlockBody,
): Promise<{ block: AdminContentBlockDto; created: boolean }> {
  const existing = await repo.findBlockByKey(key);
  const block = await repo.upsertBlock({
    key,
    data: parseBlockData(key, input.data),
    sortOrder: input.sortOrder ?? existing?.sortOrder ?? 0,
    isActive: input.isActive ?? existing?.isActive ?? true,
  });
  return { block: toAdminContentBlockDto(block), created: existing === undefined };
}

export async function deleteBlock(key: string): Promise<void> {
  if (!(await repo.deleteBlockByKey(key))) throw blockNotFound();
}

export async function listPages(): Promise<AdminPageDto[]> {
  const rows = await repo.listPages();
  return rows.map(toAdminPageDto);
}

export async function getPage(slug: string): Promise<AdminPageDto> {
  const page = await repo.findPageBySlug(slug);
  if (page === undefined) throw pageNotFound();
  return toAdminPageDto(page);
}

export async function putPage(
  slug: string,
  input: PageBody,
): Promise<{ page: AdminPageDto; created: boolean }> {
  const existing = await repo.findPageBySlug(slug);
  const page = await repo.upsertPage({ slug, title: input.title, body: input.body } satisfies NewPage);
  return { page: toAdminPageDto(page), created: existing === undefined };
}

export async function deletePage(slug: string): Promise<void> {
  if (!(await repo.deletePageBySlug(slug))) throw pageNotFound();
}

export async function getSettings(): Promise<AdminStoreSettings> {
  const row = await repo.findSettings();
  if (row === undefined) {
    throw new AppError("NOT_FOUND", 404, "Store settings are not configured");
  }
  return toAdminSettingsDto(row);
}

export async function updateSettings(input: UpdateSettingsInput): Promise<AdminStoreSettings> {
  const row = await repo.findSettings();
  if (row === undefined) {
    throw new AppError("NOT_FOUND", 404, "Store settings are not configured");
  }

  const values = input as Partial<NewStoreSettings>;
  return toAdminSettingsDto(await repo.updateSettings(row.id, values));
}
