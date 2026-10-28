import type { Review } from "@/db/schema/reviews.js";
import type { ReviewDto } from "@/types/reviews.js";

export function toReviewDto(review: Review): ReviewDto {
  return {
    id: review.id,
    ...(review.productId === null ? {} : { productId: review.productId }),
    authorName: review.authorName,
    rating: review.rating,
    text: review.text,
    images: review.images,
    status: review.status,
    isSeed: review.isSeed,
    isVerifiedPurchase: review.isVerifiedPurchase,
    showOnHome: review.showOnHome,
    createdAt: review.createdAt.toISOString(),
  };
}
