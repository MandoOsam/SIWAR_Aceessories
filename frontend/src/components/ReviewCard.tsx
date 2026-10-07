import { Star } from "lucide-react";

import type { Review } from "@/services/types";
import type { L10n } from "@/services/types";
import { cn } from "@/utils/cn";
import { useLocale } from "@/hooks/useLocale";
import { localize } from "@/utils/format";

interface ReviewCardProps {
  review: Review;
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  const { locale } = useLocale();

  return (
    <div className={cn("flex flex-col gap-4 rounded-card bg-surface p-6 shadow-sm", className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-sm font-medium text-fg">{review.authorName?.charAt(0) ?? "?"}</div>
        <div className="flex flex-1 flex-col">
          <span className="font-medium text-fg">{review.authorName}</span>
          <span className="text-xs text-fg-muted">{localize(review.governorate ?? {ar:"", en:""}, locale)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn("h-4 w-4", i < review.rating ? "fill-accent text-accent" : "text-fg-subtle")}
            aria-hidden="true"
          />
        ))}
        <span className="ms-1 text-xs text-fg-muted">{review.rating}/5</span>
      </div>
      <p className="text-sm text-fg-muted">{localize(review.text as L10n, locale)}</p>
      {/* No verified badge per requirements */}
    </div>
  );
}

export default ReviewCard;
