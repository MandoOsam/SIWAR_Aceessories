import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/utils/cn";
import { formatPrice, localize } from "@/utils/format";
import { useLocale } from "@/hooks/useLocale";
import { useCategories } from "@/hooks/useCatalog";
import { useProductFilters } from "@/hooks/useProductFilters";

type Chip = {
  key: string;
  label: string;
  onRemove: () => void;
};

export interface ActiveFilterChipsProps {
  className?: string;
}

/**
 * Removable chips for every active filter (05-ui-context.md §7.3).
 *
 * State comes from `useProductFilters`, so removing a chip is a URL change like any other filter.
 * The price range is one chip that clears `minPrice` and `maxPrice` together via `setFilters`.
 */
export function ActiveFilterChips({ className }: ActiveFilterChipsProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { data: categories } = useCategories();
  const { filters, removeFilter, setFilters, clearFilters } = useProductFilters();

  const chips: Chip[] = [];

  if (filters.category !== undefined) {
    const match = categories?.find((category) => category.slug === filters.category);
    chips.push({
      key: "category",
      label: match === undefined ? filters.category : localize(match.name, locale),
      onRemove: () => removeFilter("category"),
    });
  }

  const { minPrice, maxPrice } = filters;
  let priceLabel: string | undefined;
  if (minPrice !== undefined && maxPrice !== undefined) {
    priceLabel = t("shop.filters.priceRange", {
      min: formatPrice(minPrice, locale),
      max: formatPrice(maxPrice, locale),
    });
  } else if (minPrice !== undefined) {
    priceLabel = t("shop.filters.priceFrom", { min: formatPrice(minPrice, locale) });
  } else if (maxPrice !== undefined) {
    priceLabel = t("shop.filters.priceTo", { max: formatPrice(maxPrice, locale) });
  }
  if (priceLabel !== undefined) {
    chips.push({
      key: "price",
      label: priceLabel,
      onRemove: () => setFilters({ minPrice: undefined, maxPrice: undefined }),
    });
  }

  if (filters.rating !== undefined) {
    chips.push({
      key: "rating",
      label: t("shop.filters.ratingChip", { rating: filters.rating }),
      onRemove: () => removeFilter("rating"),
    });
  }
  if (filters.inStock === true) {
    chips.push({
      key: "inStock",
      label: t("shop.filters.inStockOnly"),
      onRemove: () => removeFilter("inStock"),
    });
  }
  if (filters.color !== undefined) {
    chips.push({
      key: "color",
      label: t(`shop.colors.${filters.color}`),
      onRemove: () => removeFilter("color"),
    });
  }
  if (filters.size !== undefined) {
    chips.push({
      key: "size",
      label: t("shop.filters.sizeChip", { size: filters.size }),
      onRemove: () => removeFilter("size"),
    });
  }
  if (filters.discount === true) {
    chips.push({
      key: "discount",
      label: t("shop.filters.onSale"),
      onRemove: () => removeFilter("discount"),
    });
  }
  if (filters.isNew === true) {
    chips.push({
      key: "isNew",
      label: t("shop.filters.newOnly"),
      onRemove: () => removeFilter("isNew"),
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <h2 className="sr-only">{t("shop.filters.active")}</h2>
      <ul className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <li key={chip.key}>
            <button
              type="button"
              onClick={chip.onRemove}
              aria-label={t("shop.filters.remove", { filter: chip.label })}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-pill border border-line px-4 text-sm text-fg",
                "transition-colors duration-500 ease-smooth hover:border-accent hover:text-accent",
              )}
            >
              <span>{chip.label}</span>
              <X aria-hidden="true" className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={clearFilters}
        className={cn(
          "min-h-11 px-2 text-xs uppercase tracking-[0.14em] text-fg-muted underline-offset-4",
          "transition-colors duration-500 ease-smooth hover:text-accent hover:underline",
        )}
      >
        {t("shop.filters.clearAll")}
      </button>
    </div>
  );
}

export default ActiveFilterChips;
