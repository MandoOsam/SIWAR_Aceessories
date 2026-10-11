import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/utils/cn";
import { localize } from "@/utils/format";
import { useLocale } from "@/hooks/useLocale";
import { useCategories } from "@/hooks/useCatalog";
import { useProductFilters } from "@/hooks/useProductFilters";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  PRODUCT_COLORS,
  type CategorySlug,
} from "@/services/types";

/**
 * Single-value filter sets stay on the frozen F3.1 contract (`color?: ProductColor`,
 * `size?: string`). True multi-select is deferred to a later sub-phase that changes the contract
 * first — see `06-progress-tracker.md` decision D-022.
 */
const RING_SIZES = ["6", "7", "8", "9"] as const;
const RATING_VALUES = [4, 3, 2, 1] as const;
const CATEGORY_RADIO_GROUP = "siwar-category-filter";

export interface FilterPanelProps {
  /** Route-owned category (e.g. `/category/rings`); falls back to `filters.category`. */
  category?: CategorySlug;
  /** Hide the Category group (the route owns it, so there is nothing to filter by). */
  showCategory?: boolean;
  className?: string;
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-5 first:border-t-0 first:pt-0">
      <legend className="mb-4 font-heading text-xs uppercase tracking-[0.24em] text-fg-muted">
        {title}
      </legend>
      <div className="flex flex-col gap-1">{children}</div>
    </fieldset>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-fg">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 shrink-0 accent-accent"
      />
      <span>{label}</span>
    </label>
  );
}

function PillButton({
  selected,
  label,
  onClick,
  children,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-control border px-4 text-sm",
        "transition-colors duration-500 ease-smooth",
        selected
          ? "border-accent bg-accent text-on-accent"
          : "border-line text-fg hover:border-accent hover:text-accent",
      )}
    >
      {children}
    </button>
  );
}

function PriceInput({
  value,
  onValueChange,
  onCommit,
  label,
  placeholder,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onCommit: () => void;
  label: string;
  placeholder: string;
}) {
  return (
    <label className="flex-1">
      <span className="sr-only">{label}</span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onBlur={onCommit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onCommit();
          }
        }}
        placeholder={placeholder}
        aria-label={label}
        className={cn(
          "w-full rounded-control border border-line bg-surface px-3 py-2 text-sm text-fg",
          "placeholder:text-fg-muted transition-colors duration-500 ease-smooth focus:border-accent",
        )}
      />
    </label>
  );
}

/**
 * Desktop filters sidebar (05-ui-context.md §7.3): category, price range, rating, availability,
 * colour, size (rings only), discount and new arrivals. Every control reads and writes the URL
 * through `useProductFilters`, so the sheet and the sidebar never hold their own copy.
 */
export function FilterPanel({
  category,
  showCategory = true,
  className,
}: FilterPanelProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { filters, setFilter, setFilters, toggleFilter, removeFilter } =
    useProductFilters();
  const categoriesQuery = useCategories();

  const activeCategory = category ?? filters.category;

  const [minInput, setMinInput] = useState(String(filters.minPrice ?? ""));
  const [maxInput, setMaxInput] = useState(String(filters.maxPrice ?? ""));

  useEffect(() => {
    setMinInput(filters.minPrice === undefined ? "" : String(filters.minPrice));
  }, [filters.minPrice]);
  useEffect(() => {
    setMaxInput(filters.maxPrice === undefined ? "" : String(filters.maxPrice));
  }, [filters.maxPrice]);

  const readNumber = (value: string): number | undefined => {
    if (value.trim() === "") return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  };

  const commitPrices = (): void => {
    const minPrice = readNumber(minInput);
    const maxPrice = readNumber(maxInput);
    if (minPrice !== filters.minPrice || maxPrice !== filters.maxPrice) {
      setFilters({ minPrice, maxPrice });
    }
  };

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {showCategory ? (
        <FilterGroup title={t("shop.filters.section.category")}>
          {categoriesQuery.isPending ? (
            <div role="status" aria-busy="true" className="flex flex-col gap-1">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : (
            <>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-fg">
                <input
                  type="radio"
                  name={CATEGORY_RADIO_GROUP}
                  checked={filters.category === undefined}
                  onChange={() => removeFilter("category")}
                  className="size-4 shrink-0 accent-accent"
                />
                <span>{t("shop.filters.all")}</span>
              </label>
              {(categoriesQuery.data ?? []).map((item) => (
                <label
                  key={item.id}
                  className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-fg"
                >
                  <input
                    type="radio"
                    name={CATEGORY_RADIO_GROUP}
                    checked={filters.category === item.slug}
                    onChange={() => setFilter("category", item.slug)}
                    className="size-4 shrink-0 accent-accent"
                  />
                  <span>{localize(item.name, locale)}</span>
                </label>
              ))}
            </>
          )}
        </FilterGroup>
      ) : null}

      <FilterGroup title={t("shop.filters.section.price")}>
        <div className="flex items-center gap-2">
          <PriceInput
            value={minInput}
            onValueChange={setMinInput}
            onCommit={commitPrices}
            label={t("shop.filters.minPriceLabel")}
            placeholder={t("shop.filters.minPriceLabel")}
          />
          <span aria-hidden="true" className="text-fg-muted">
            –
          </span>
          <PriceInput
            value={maxInput}
            onValueChange={setMaxInput}
            onCommit={commitPrices}
            label={t("shop.filters.maxPriceLabel")}
            placeholder={t("shop.filters.maxPriceLabel")}
          />
        </div>
      </FilterGroup>

      <FilterGroup title={t("shop.filters.section.rating")}>
        <div className="flex flex-wrap gap-2">
          {RATING_VALUES.map((rating) => {
            const selected = filters.rating === rating;
            return (
              <PillButton
                key={rating}
                selected={selected}
                label={t("shop.filters.ratingChip", { rating })}
                onClick={() => (selected ? removeFilter("rating") : setFilter("rating", rating))}
              >
                <span className="flex items-center gap-1.5">
                  <Star aria-hidden="true" className="size-3.5" />
                  <span>{rating}+</span>
                </span>
              </PillButton>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title={t("shop.filters.section.availability")}>
        <ToggleRow
          label={t("shop.filters.inStockOnly")}
          checked={filters.inStock === true}
          onChange={() => toggleFilter("inStock")}
        />
      </FilterGroup>

      <FilterGroup title={t("shop.filters.section.color")}>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_COLORS.map((color) => {
            const selected = filters.color === color;
            return (
              <PillButton
                key={color}
                selected={selected}
                label={t(`shop.colors.${color}`)}
                onClick={() => (selected ? removeFilter("color") : setFilter("color", color))}
              >
                {t(`shop.colors.${color}`)}
              </PillButton>
            );
          })}
        </div>
      </FilterGroup>

      {activeCategory === "rings" ? (
        <FilterGroup title={t("shop.filters.section.size")}>
          <div className="flex flex-wrap gap-2">
            {RING_SIZES.map((size) => {
              const selected = filters.size === size;
              return (
                <PillButton
                  key={size}
                  selected={selected}
                  label={t("shop.filters.sizeChip", { size })}
                  onClick={() => (selected ? removeFilter("size") : setFilter("size", size))}
                >
                  {size}
                </PillButton>
              );
            })}
          </div>
        </FilterGroup>
      ) : null}

      <FilterGroup title={t("shop.filters.section.discount")}>
        <ToggleRow
          label={t("shop.filters.onSale")}
          checked={filters.discount === true}
          onChange={() => toggleFilter("discount")}
        />
      </FilterGroup>

      <FilterGroup title={t("shop.filters.section.new")}>
        <ToggleRow
          label={t("shop.filters.newOnly")}
          checked={filters.isNew === true}
          onChange={() => toggleFilter("isNew")}
        />
      </FilterGroup>
    </div>
  );
}

export default FilterPanel;