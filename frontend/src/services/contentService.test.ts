import { describe, expect, it } from "vitest";

import { selectProductReviews } from "@/services/contentService";
import type { Review } from "@/services/types";

/**
 * Review visibility rules for the product page (D-028).
 *
 * Pure function, so no timers or DOM are needed. What matters: only approved reviews are public,
 * seeded samples appear under every product (they carry no `productId`), and a real review is tied
 * to its own product.
 */
function buildReview(overrides: Partial<Review>): Review {
  return {
    id: "review",
    authorName: "Customer",
    rating: 5,
    text: { ar: "نص", en: "text" },
    images: [],
    status: "approved",
    isSeed: false,
    isVerifiedPurchase: false,
    showOnHome: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("selectProductReviews", () => {
  it("shows seeded samples under every product", () => {
    const seed = buildReview({ id: "seed", isSeed: true });

    expect(selectProductReviews([seed], "product-1")).toEqual([seed]);
    expect(selectProductReviews([seed], "product-2")).toEqual([seed]);
  });

  it("keeps only reviews linked to the requested product", () => {
    const mine = buildReview({ id: "mine", productId: "product-1" });
    const other = buildReview({ id: "other", productId: "product-2" });

    expect(selectProductReviews([mine, other], "product-1")).toEqual([mine]);
  });

  it("excludes pending and hidden reviews", () => {
    const pending = buildReview({ id: "pending", productId: "product-1", status: "pending" });
    const hidden = buildReview({ id: "hidden", productId: "product-1", status: "hidden" });

    expect(selectProductReviews([pending, hidden], "product-1")).toHaveLength(0);
  });
});
