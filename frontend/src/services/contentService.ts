/**
 * Content service — home blocks, static pages, reviews and public settings.
 *
 * All of it is editable from the admin dashboard, so nothing here may be hard-coded in a
 * component (05-ui-context.md section 6).
 */

import { homeContent, staticPages, storeSettings } from "@/data/content";
import { reviews } from "@/data/reviews";
import { IS_MOCK_MODE } from "@/config/env";

import { getList, getOne } from "./http";
import { simulateLatency } from "./mockAdapter";
import type { HomeContent, Review, StaticPage, StoreSettings } from "./types";

/** `GET /content/home` */
export async function getHomeContent(signal?: AbortSignal): Promise<HomeContent> {
  if (!IS_MOCK_MODE) {
    return getOne<HomeContent>("/content/home", signal);
  }
  await simulateLatency(signal);
  return homeContent;
}

/** `GET /content/pages/:slug` */
export async function getStaticPage(
  slug: string,
  signal?: AbortSignal,
): Promise<StaticPage | null> {
  if (!IS_MOCK_MODE) {
    return getOne<StaticPage | null>(`/content/pages/${encodeURIComponent(slug)}`, signal);
  }
  await simulateLatency(signal);
  return staticPages.find((page) => page.slug === slug) ?? null;
}

/** `GET /content/pages` — used by the footer sitemap. */
export async function listStaticPages(signal?: AbortSignal): Promise<StaticPage[]> {
  if (!IS_MOCK_MODE) {
    const response = await getList<StaticPage>("/content/pages", signal);
    return response.data;
  }
  await simulateLatency(signal);
  return staticPages;
}

/** `GET /reviews` — approved reviews only; seeded ones never claim a verified purchase. */
export async function listReviews(
  options: { productId?: string; showOnHome?: boolean } = {},
  signal?: AbortSignal,
): Promise<Review[]> {
  if (!IS_MOCK_MODE) {
    const params = new URLSearchParams();
    if (options.productId !== undefined) params.set("productId", options.productId);
    if (options.showOnHome === true) params.set("showOnHome", "true");
    const query = params.toString();
    const response = await getList<Review>(`/reviews${query === "" ? "" : `?${query}`}`, signal);
    return response.data;
  }
  await simulateLatency(signal);
  return reviews.filter((review) => {
    if (review.status !== "approved") return false;
    if (options.productId !== undefined && review.productId !== options.productId) return false;
    if (options.showOnHome === true && !review.showOnHome) return false;
    return true;
  });
}

/** `GET /settings/public` */
export async function getPublicSettings(signal?: AbortSignal): Promise<StoreSettings> {
  if (!IS_MOCK_MODE) {
    return getOne<StoreSettings>("/settings/public", signal);
  }
  await simulateLatency(signal);
  return storeSettings;
}
