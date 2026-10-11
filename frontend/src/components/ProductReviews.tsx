import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";
import ReviewSummary from "@/components/ReviewSummary";
import { ProductGridError } from "@/components/ProductGridError";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProductReviews } from "@/hooks/useProductReviews";
import { cn } from "@/utils/cn";

/** Reviews revealed per "Show more" click. */
const PAGE_SIZE = 10;
const SKELETON_COUNT = 3;

export interface ProductReviewsProps {
  productId: string;
  className?: string;
}

/**
 * Reviews section for the product page (05-ui-context.md §7.5).
 *
 * Reads approved reviews through the existing `useProductReviews` hook (the service already filters
 * out non-approved and never marks seeded samples as verified purchases — §10). Shows 10 at a time,
 * and always renders the form so a customer with no visible reviews can be the first. The section
 * carries `id="reviews"`, the anchor the product info's review link points at.
 */
export function ProductReviews({ productId, className }: ProductReviewsProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { reviews, isLoading, isError, submit } = useProductReviews(productId);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const handleRetry = (): void => {
    void queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
  };

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className={cn("container-page py-12", className)}
    >
      <h2 id="reviews-heading" className="font-heading text-heading text-fg">
        {t("product.reviews.title")}
      </h2>

      {isLoading && (
        <div
          role="status"
          aria-busy="true"
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <span className="sr-only">{t("product.reviews.loading")}</span>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <div key={index} className="space-y-3 rounded-card bg-surface p-6">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <ProductGridError
          title={t("product.reviews.error.title")}
          description={t("product.reviews.error.description")}
          onRetry={handleRetry}
        />
      )}

      {!isLoading && !isError && reviews.length === 0 && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-card border border-line bg-surface px-6 py-12 text-center">
          <MessageSquare className="h-8 w-8 text-accent" aria-hidden="true" />
          <h3 className="font-heading text-heading-sm text-fg">
            {t("product.reviews.empty.title")}
          </h3>
          <p className="max-w-md text-sm text-fg-muted">{t("product.reviews.empty.body")}</p>
        </div>
      )}

      {!isLoading && !isError && reviews.length > 0 && (
        <>
          <ReviewSummary reviews={reviews} className="mt-6" />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, visibleCount).map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
          {visibleCount < reviews.length && (
            <div className="mt-8 text-center">
              <Button variant="secondary" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                {t("product.reviews.list.showMore")}
              </Button>
            </div>
          )}
        </>
      )}

      <div className="mt-12 max-w-2xl">
        <ReviewForm onSubmit={submit} />
      </div>
    </section>
  );
}

export default ProductReviews;
