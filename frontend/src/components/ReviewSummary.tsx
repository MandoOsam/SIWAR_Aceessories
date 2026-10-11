import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useLocale } from "@/hooks/useLocale";
import type { Review } from "@/services/types";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/format";

export interface ReviewSummaryProps {
  reviews: Review[];
  className?: string;
}

/** Buckets shown top-to-bottom, matching how customers scan ratings. */
const STAR_BUCKETS = [5, 4, 3, 2, 1] as const;
const STAR_VALUES = [0, 1, 2, 3, 4];

/**
 * Ratings overview (05-ui-context.md §7.5): the average, the total and a 5→1 star distribution.
 * Purely presentational — `ProductReviews` supplies the approved reviews.
 *
 * Bars grow from the logical start (`inlineSize`), so they flip correctly in Arabic without extra
 * classes, and each bar carries an `aria-label` because the visual fill is otherwise unreadable.
 */
export function ReviewSummary({ reviews, className }: ReviewSummaryProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const total = reviews.length;
  const average = total === 0 ? 0 : reviews.reduce((sum, review) => sum + review.rating, 0) / total;
  const averageText = average.toFixed(1);
  const filledStars = Math.round(average);

  const distribution = STAR_BUCKETS.map((star) => {
    const count = reviews.filter((review) => Math.round(review.rating) === star).length;
    const percent = total === 0 ? 0 : Math.round((count / total) * 100);
    return { star, count, percent };
  });

  return (
    <div className={cn("grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center", className)}>
      <div className="text-center sm:text-start">
        <p className="font-heading text-display leading-none text-fg">{averageText}</p>
        <div
          className="mt-2 flex items-center justify-center gap-1 sm:justify-start"
          aria-hidden="true"
        >
          {STAR_VALUES.map((index) => (
            <Star
              key={index}
              className={cn(
                "h-4 w-4",
                index < filledStars ? "fill-accent text-accent" : "text-fg-muted",
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-fg-muted">
          {t("product.reviews.summary.basedOn", { count: total })}
        </p>
        <span className="sr-only">
          {t("product.reviews.summary.averageLabel", { rating: averageText })}
        </span>
      </div>

      <div
        role="group"
        aria-label={t("product.reviews.summary.distributionLabel")}
        className="space-y-2"
      >
        {distribution.map(({ star, count, percent }) => (
          <div key={star} className="flex items-center gap-3 text-sm">
            <span className="flex w-10 items-center gap-1 text-fg-muted">
              <span>{formatNumber(star, locale)}</span>
              <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden="true" />
            </span>
            <span
              role="img"
              aria-label={t("product.reviews.summary.barLabel", {
                star,
                reviews: count,
                percent,
              })}
              className="relative h-2 flex-1 overflow-hidden rounded-pill bg-surface-2"
            >
              <span
                className="block h-full rounded-pill bg-accent"
                style={{ inlineSize: `${String(percent)}%` }}
              />
            </span>
            <span className="w-8 text-end text-fg-muted">{formatNumber(count, locale)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReviewSummary;
