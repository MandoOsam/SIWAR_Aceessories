import { AppError } from "@/middlewares/errorHandler.js";
import * as repo from "./repository.js";
import { toReviewDto } from "./mapper.js";
import type { CreateReviewBody, ListReviewsQuery } from "./schema.js";
import type { AuthUser } from "@/modules/auth/types.js";
import type { ReviewDto } from "@/types/reviews.js";

type ReviewList = { data: ReviewDto[]; total: number; page: number; limit: number };

async function paginatedList(
  query: ListReviewsQuery,
  productId?: string,
): Promise<ReviewList> {
  const rows = await repo.listPublicReviews({
    ...(productId === undefined ? {} : { productId }),
    ...(query.showOnHome === undefined ? {} : { showOnHome: query.showOnHome }),
    page: query.page,
    limit: query.limit,
  });
  return {
    data: rows.rows.map(toReviewDto),
    total: rows.total,
    page: query.page,
    limit: query.limit,
  };
}

export function listReviews(query: ListReviewsQuery): Promise<ReviewList> {
  return paginatedList(query, query.productId);
}

/**
 * `GET /products/:id/reviews`. An unknown product has no reviews: it answers an
 * empty list (like an unknown category) instead of a 404, so the product page
 * only needs its own not-found state.
 */
export async function listProductReviews(
  productId: string,
  query: ListReviewsQuery,
): Promise<ReviewList> {
  const product = await repo.findActiveProductById(productId);
  if (product === undefined) {
    return { data: [], total: 0, page: query.page, limit: query.limit };
  }
  return paginatedList(query, productId);
}

export async function createReview(
  productId: string,
  input: CreateReviewBody,
  user: AuthUser | undefined,
): Promise<ReviewDto> {
  const product = await repo.findActiveProductById(productId);
  if (product === undefined) {
    throw new AppError("NOT_FOUND", 404, "Product not found");
  }

  let isVerifiedPurchase = false;
  if (user !== undefined) {
    const existing = await repo.findReviewByUserAndProduct(user.id, productId);
    if (existing !== undefined) {
      throw new AppError("CONFLICT", 409, "You have already reviewed this product");
    }
    isVerifiedPurchase = await repo.hasPurchasedProduct(user.id, productId);
  }

  const review = await repo.insertReview({
    productId,
    userId: user?.id ?? null,
    authorName: input.authorName,
    rating: input.rating,
    text: input.text,
    images: input.images ?? [],
    status: "pending",
    isSeed: false,
    showOnHome: false,
    isVerifiedPurchase,
  });

  return toReviewDto(review);
}
