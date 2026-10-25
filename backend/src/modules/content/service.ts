import { logger } from "@/lib/logger.js";
import { AppError } from "@/middlewares/errorHandler.js";
import type {
  ContentBlockData,
  FeaturedCollection,
  HeroContent,
  HomeContent,
  StaticPage,
  StoreSettings,
  StoryContent,
} from "@/types/content.js";
import * as repo from "./repository.js";
import {
  blockDataSchema,
  FEATURED_BLOCK_PREFIX,
  featuredIdFromKey,
  HERO_BLOCK_KEY,
  STORY_BLOCK_KEY,
} from "./schema.js";

/**
 * Validates a stored block against the schema for its key. Data written through
 * the admin API is already valid, so a failure here means the row was edited
 * outside the app: log it and answer with a server error instead of serving a
 * half-broken page.
 */
function readBlockData<T>(key: string, data: ContentBlockData): T {
  const result = blockDataSchema(key).safeParse(data);
  if (!result.success) {
    logger.error({ key, issues: result.error.issues }, "Invalid content block data");
    throw new AppError("INTERNAL_ERROR", 500, "Content block is misconfigured");
  }
  return result.data as T;
}

function toFeaturedCollection(key: string, data: ContentBlockData): FeaturedCollection | null {
  const id = featuredIdFromKey(key);
  if (id === null) return null;
  return { id, ...readBlockData<Omit<FeaturedCollection, "id">>(key, data) };
}

function toStaticPage(row: { slug: string; title: StaticPage["title"]; body: StaticPage["body"] }) {
  return { slug: row.slug, title: row.title, body: row.body } satisfies StaticPage;
}

/** `GET /content/home`: hero + story singletons and the ordered featured blocks. */
export async function getHomeContent(): Promise<HomeContent> {
  const blocks = await repo.listActiveBlocks();

  const hero = blocks.find((block) => block.key === HERO_BLOCK_KEY);
  const story = blocks.find((block) => block.key === STORY_BLOCK_KEY);
  if (hero === undefined || story === undefined) {
    throw new AppError("NOT_FOUND", 404, "Home content is not configured");
  }

  const featuredCollections = blocks
    .filter((block) => block.key.startsWith(FEATURED_BLOCK_PREFIX))
    .map((block) => toFeaturedCollection(block.key, block.data))
    .filter((collection): collection is FeaturedCollection => collection !== null);

  return {
    hero: readBlockData<HeroContent>(hero.key, hero.data),
    story: readBlockData<StoryContent>(story.key, story.data),
    featuredCollections,
  };
}

/** `GET /content/pages`: list for the footer sitemap. */
export async function listPages(): Promise<StaticPage[]> {
  const rows = await repo.listPages();
  return rows.map(toStaticPage);
}

/** `GET /content/pages/:slug`: null (not 404) so the storefront can show its empty state. */
export async function getPageBySlug(slug: string): Promise<StaticPage | null> {
  const row = await repo.findPageBySlug(slug);
  return row === undefined ? null : toStaticPage(row);
}

/** `GET /settings/public`: enabled payment methods only, and never the SEO block. */
export async function getPublicSettings(): Promise<StoreSettings> {
  const row = await repo.findSettings();
  if (row === undefined) {
    throw new AppError("NOT_FOUND", 404, "Store settings are not configured");
  }

  return {
    storeName: row.storeName,
    currency: row.currency,
    shipping: row.shipping,
    paymentMethods: row.paymentMethods.filter((method) => method.isEnabled),
    trustBadges: row.trustBadges,
    social: row.social,
    contact: row.contact,
  };
}
