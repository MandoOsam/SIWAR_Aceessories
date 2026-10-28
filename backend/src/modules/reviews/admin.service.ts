import { db } from "@/db/client.js";
import { AppError } from "@/middlewares/errorHandler.js";
import { toReviewDto } from "./mapper.js";
import * as repo from "./repository.js";
import type { AdminListReviewsQuery, ModerateReviewBody } from "./schema.js";
import type { ReviewDto } from "@/types/reviews.js";

type ReviewList = { data: ReviewDto[]; total: number; page: number; limit: number };

export async function listReviews(query: AdminListReviewsQuery): Promise<ReviewList> {
  const rows = await repo.listAdminReviews(query);
  return {
    data: rows.rows.map(toReviewDto),
    total: rows.total,
    page: query.page,
    limit: query.limit,
  };
}

/** Approve/hide a review or toggle its home-page placement. */
export async function moderateReview(
  id: string,
  input: ModerateReviewBody,
): Promise<ReviewDto> {
  return db.transaction(async (tx) => {
    const existing = await repo.findReviewForUpdate(tx, id);
    if (existing === undefined) {
      throw new AppError("NOT_FOUND", 404, "Review not found");
    }

    const updated = await repo.updateReviewStatus(tx, id, {
      ...(input.status === undefined ? {} : { status: input.status }),
      ...(input.showOnHome === undefined ? {} : { showOnHome: input.showOnHome }),
    });
    if (updated === undefined) {
      throw new AppError("NOT_FOUND", 404, "Review not found");
    }

    if (updated.productId !== null) {
      await repo.recalculateProductRating(tx, updated.productId);
    }
    return toReviewDto(updated);
  });
}

export async function deleteReview(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    const existing = await repo.findReviewForUpdate(tx, id);
    if (existing === undefined) {
      throw new AppError("NOT_FOUND", 404, "Review not found");
    }
    await repo.deleteReview(tx, id);
    if (existing.productId !== null) {
      await repo.recalculateProductRating(tx, existing.productId);
    }
  });
}
