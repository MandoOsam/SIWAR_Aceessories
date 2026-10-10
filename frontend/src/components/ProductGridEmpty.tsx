import type { ReactNode } from "react";
import { PackageOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { useProductFilters } from "@/hooks/useProductFilters";

export interface ProductGridEmptyProps {
  title?: string;
  description?: string;
  /** Overrides the default "clear filters" button, e.g. a link back to the shop. */
  action?: ReactNode;
  className?: string;
}

/**
 * Zero-results state for the product grid (05-ui-context.md §7.3).
 *
 * Self-contained: when any filter is active it offers a "clear filters" button that resets the URL
 * through `useProductFilters`, matching the chips. Callers can override the copy or the action
 * (search and invalid-category pages do this in F3.5/F3.6).
 */
export function ProductGridEmpty({ title, description, action, className }: ProductGridEmptyProps) {
  const { t } = useTranslation();
  const { filters, clearFilters } = useProductFilters();

  const hasActiveFilters =
    filters.category !== undefined ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.rating !== undefined ||
    filters.inStock === true ||
    filters.color !== undefined ||
    filters.size !== undefined ||
    filters.discount === true ||
    filters.isNew === true;

  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-4 py-16 text-center",
        className,
      )}
    >
      <PackageOpen aria-hidden="true" className="size-10 text-accent" />
      <h2 className="font-heading text-heading-sm text-fg">{title ?? t("shop.empty.title")}</h2>
      <p className="max-w-md text-sm text-fg-muted">
        {description ?? t("shop.empty.description")}
      </p>
      {action ??
        (hasActiveFilters ? (
          <Button variant="secondary" onClick={clearFilters} className="mt-2">
            {t("shop.empty.action")}
          </Button>
        ) : null)}
    </div>
  );
}

export default ProductGridEmpty;
