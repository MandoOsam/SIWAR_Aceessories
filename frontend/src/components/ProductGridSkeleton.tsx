import { useTranslation } from "react-i18next";

import { Skeleton } from "@/components/ui/Skeleton";

export interface ProductGridSkeletonProps {
  /** Number of placeholder cards; defaults to a full mobile grid plus one row. */
  count?: number;
  className?: string;
}

/**
 * Loading state for a product grid. Mirrors `ProductCard`'s block layout so the page does not jump
 * when the real products arrive (03-code-standards.md §5: every list has a loading state).
 */
export function ProductGridSkeleton({ count = 6, className }: ProductGridSkeletonProps) {
  const { t } = useTranslation();

  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{t("common.loading")}</span>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="aspect-[4/5] w-full" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductGridSkeleton;
