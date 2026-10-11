/**
 * Content service — home blocks, static pages, reviews and public settings.
 *
 * All of it is editable from the admin dashboard, so nothing here may be hard-coded in a
 * component (05-ui-context.md section 6).
 */

import { homeContent, staticPages, storeSettings } from "@/data/content";
import { reviews } from "@/data/reviews";
import { IS_MOCK_MODE } from "@/config/env";

import { getList, getOne, post } from "./http";
import { simulateLatency } from "./mockAdapter";
import type {
  HomeContent,
  ProductReviewInput,
  Review,
  StaticPage,
  StoreSettings,
} from "./types";

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

/**
 * Pure filter behind `getProductReviews`.
 *
 * Separated from the async endpoint so it can be unit-tested without timers. Seeded samples carry
 * no `productId`, so they are shown under every product (D-028); a real review must match the
 * requested product. Only `approved` reviews are ever public.
 */
export function selectProductReviews(all: Review[], productId: string): Review[] {
  return all.filter(
    (review) => review.status === "approved" && (review.isSeed || review.productId === productId),
  );
}

/** `GET /products/:id/reviews` — approved reviews only. */
export async function getProductReviews(
  productId: string,
  signal?: AbortSignal,
): Promise<Review[]> {
  if (!IS_MOCK_MODE) {
    const response = await getList<Review>(
      `/products/${encodeURIComponent(productId)}/reviews`,
      signal,
    );
    return response.data;
  }
  await simulateLatency(signal);
  return selectProductReviews(reviews, productId);
}

/**
 * `POST /products/:id/reviews` — the new review is stored with `status: "pending"` for moderation
 * (02-architecture.md §7). In mock mode it is pushed into the in-memory list so a later
 * `getProductReviews` call (after moderation) can see it; nothing is persisted across reloads.
 */
export async function submitProductReview(
  productId: string,
  input: ProductReviewInput,
  signal?: AbortSignal,
): Promise<Review> {
  if (!IS_MOCK_MODE) {
    return post<Review>(`/products/${encodeURIComponent(productId)}/reviews`, input, signal);
  }
  await simulateLatency(signal);
  const review: Review = {
    id: `local-${String(Date.now())}`,
    productId,
    authorName: input.authorName,
    rating: input.rating,
    text: input.text,
    images: input.images ?? [],
    status: "pending",
    isSeed: false,
    isVerifiedPurchase: false,
    showOnHome: false,
    createdAt: new Date().toISOString(),
  };
  reviews.push(review);
  return review;
}

/** `GET /settings/public` */
export async function getPublicSettings(signal?: AbortSignal): Promise<StoreSettings> {
  if (!IS_MOCK_MODE) {
    return getOne<StoreSettings>("/settings/public", signal);
  }
  await simulateLatency(signal);
  return storeSettings;
}
