import type { L10n } from "@/types/l10n.js";

export const REVIEW_STATUSES = ["pending", "approved", "hidden"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

/** Public/admin review shape (`Review` in the frontend contract types). */
export type ReviewDto = {
  id: string;
  productId?: string;
  authorName: string;
  rating: number;
  text: L10n;
  images: string[];
  status: ReviewStatus;
  isSeed: boolean;
  isVerifiedPurchase: boolean;
  showOnHome: boolean;
  createdAt: string;
};

/** Body of `POST /products/:id/reviews` (02-architecture section 7). */
export type ReviewInput = {
  authorName: string;
  rating: number;
  text: L10n;
  images?: string[];
};
