import type { ContentBlock } from "@/db/schema/contentBlocks.js";
import type { Page } from "@/db/schema/pages.js";
import type { AdminStoreSettings, ContentBlockData } from "@/types/content.js";

/** Admin view of a block: includes inactive rows and the key for the URL. */
export type AdminContentBlockDto = {
  id: string;
  key: string;
  data: ContentBlockData;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminPageDto = {
  id: string;
  slug: string;
  title: Page["title"];
  body: Page["body"];
  createdAt: string;
  updatedAt: string;
};

export type AdminSettingsDto = AdminStoreSettings;

export function toAdminContentBlockDto(block: ContentBlock): AdminContentBlockDto {
  return {
    id: block.id,
    key: block.key,
    data: block.data,
    sortOrder: block.sortOrder,
    isActive: block.isActive,
    createdAt: block.createdAt.toISOString(),
    updatedAt: block.updatedAt.toISOString(),
  };
}

export function toAdminPageDto(page: Page): AdminPageDto {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    body: page.body,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
  };
}
