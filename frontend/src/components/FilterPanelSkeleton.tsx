import { useTranslation } from "react-i18next";

import { cn } from "@/utils/cn";
import { Skeleton } from "@/components/ui/Skeleton";

export interface FilterPanelSkeletonProps {
  className?: string;
}

/**
 * Shimmer placeholder matching the profile of `FilterPanel` while the categories (and thus the
 * panel) load (03-code-standards.md §6).
 */
export function FilterPanelSkeleton({ className }: FilterPanelSkeletonProps) {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={t("common.loading")}
      className={cn("flex flex-col gap-5", className)}
    >
      {[0, 1, 2, 3].map((group) => (
        <div
          key={group}
          className="flex flex-col gap-3 border-t border-line pt-5 first:border-t-0 first:pt-0"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      ))}
    </div>
  );
}

export default FilterPanelSkeleton;