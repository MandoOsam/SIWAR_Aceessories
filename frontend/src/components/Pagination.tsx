import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/utils/cn";
import { useProductFilters } from "@/hooks/useProductFilters";

export interface PaginationProps {
  /** Total number of products across all pages (from the list response). */
  total: number;
  /** Page size (from the list response). */
  limit: number;
  className?: string;
}

type PageItem = number | "gap";

/** Windowed page numbers with gaps, so a long catalogue never renders hundreds of buttons. */
function buildPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const items: PageItem[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("gap");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push("gap");
  items.push(total);
  return items;
}

const ITEM_CLASSES =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border px-2 text-sm " +
  "transition-colors duration-500 ease-smooth";

/**
 * URL-driven pagination (05-ui-context.md §7.3: pagination, not "load more").
 *
 * Reads and writes `page` through `useProductFilters`; total/limit come from the list response.
 * Shows "Page X of Y" and disables the arrows at the ends. Arrows mirror in RTL via `rtl-flip`
 * (03-code-standards.md §5).
 */
export function Pagination({ total, limit, className }: PaginationProps) {
  const { t } = useTranslation();
  const { filters, setPage } = useProductFilters();

  const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
  if (totalPages <= 1) {
    return null;
  }

  const current = Math.min(Math.max(filters.page, 1), totalPages);
  const items = buildPageItems(current, totalPages);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <p aria-live="polite" className="text-sm text-fg-muted">
        {t("shop.pagination.status", { page: current, total: totalPages })}
      </p>
      <nav aria-label={t("shop.pagination.label")}>
        <ul className="flex items-center gap-2">
          <li>
            <button
              type="button"
              onClick={() => setPage(current - 1)}
              disabled={current <= 1}
              aria-label={t("shop.pagination.previous")}
              className={cn(
                ITEM_CLASSES,
                "border-line text-fg hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40",
              )}
            >
              <ChevronLeft aria-hidden="true" className="size-4 rtl-flip" />
            </button>
          </li>

          {items.map((item, index) =>
            item === "gap" ? (
              <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-fg-muted">
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => setPage(item)}
                  aria-current={item === current ? "page" : undefined}
                  aria-label={t("shop.pagination.page", { page: item })}
                  className={cn(
                    ITEM_CLASSES,
                    item === current
                      ? "border-accent bg-accent text-on-accent"
                      : "border-line text-fg hover:border-accent hover:text-accent",
                  )}
                >
                  {item}
                </button>
              </li>
            ),
          )}

          <li>
            <button
              type="button"
              onClick={() => setPage(current + 1)}
              disabled={current >= totalPages}
              aria-label={t("shop.pagination.next")}
              className={cn(
                ITEM_CLASSES,
                "border-line text-fg hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40",
              )}
            >
              <ChevronRight aria-hidden="true" className="size-4 rtl-flip" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Pagination;
