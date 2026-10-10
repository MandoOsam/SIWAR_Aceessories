import { useId } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/utils/cn";
import { PRODUCT_SORTS, type ProductSort } from "@/services/types";
import { useProductFilters } from "@/hooks/useProductFilters";

const SORT_LABEL_KEY: Record<ProductSort, string> = {
  newest: "shop.sort.newest",
  "best-selling": "shop.sort.bestSelling",
  "price-asc": "shop.sort.priceAsc",
  "price-desc": "shop.sort.priceDesc",
  rating: "shop.sort.rating",
};

export interface SortSelectProps {
  className?: string;
}

/**
 * Sort control for the product listings.
 *
 * Reads and writes `sort` through `useProductFilters`, so the value lives in the URL and survives a
 * refresh (05-ui-context.md §7.3). A native `<select>` keeps it keyboard- and mobile-friendly.
 */
export function SortSelect({ className }: SortSelectProps) {
  const { t } = useTranslation();
  const selectId = useId();
  const { filters, setSort } = useProductFilters();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <label htmlFor={selectId} className="shrink-0 text-sm text-fg-muted">
        {t("shop.sortLabel")}
      </label>
      <select
        id={selectId}
        value={filters.sort}
        onChange={(event) => {
          const value = event.target.value;
          if ((PRODUCT_SORTS as readonly string[]).includes(value)) {
            setSort(value as ProductSort);
          }
        }}
        className={cn(
          "min-h-11 rounded-control border border-line bg-surface-2 px-3 text-sm text-fg",
          "transition-colors duration-500 ease-smooth hover:border-accent focus-visible:border-accent",
        )}
      >
        {PRODUCT_SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {t(SORT_LABEL_KEY[sort])}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SortSelect;
