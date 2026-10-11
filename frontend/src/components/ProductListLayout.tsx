import { useEffect, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { useCategories, useProducts } from "@/hooks/useCatalog";
import { useProductFilters } from "@/hooks/useProductFilters";
import type { CategorySlug } from "@/services/types";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { FilterPanel } from "@/components/FilterPanel";
import { FilterPanelSkeleton } from "@/components/FilterPanelSkeleton";
import { FilterSheet } from "@/components/FilterSheet";
import { Pagination } from "@/components/Pagination";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductGridEmpty } from "@/components/ProductGridEmpty";
import { ProductGridError } from "@/components/ProductGridError";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { SortSelect } from "@/components/SortSelect";

/**
 * Shared body of `/shop` and `/category/:slug` (05-ui-context.md §7.3): desktop filter sidebar
 * (sticky on `lg`), mobile `FilterSheet`, aria-live results counter, active-filter chips and the
 * product grid with skeleton / empty / error / pagination states.
 *
 * The URL is the single source of truth (`useProductFilters`). When the route owns the category
 * (`ownedCategory`), the hook runs with `manageCategory: false` so `category` is never read or
 * written in the query string — the slug comes from the URL path and is injected into the
 * products query directly.
 */
export type ProductListLayoutProps = {
  /** Page header (breadcrumb + title, or the category banner). Rendered at the top. */
  headerSlot: ReactNode;
  /** Route hint; `false` on `/category/:slug` hides the Category radios in the panel. */
  showCategoryFilter: boolean;
  /** Set to the route slug on `/category/:slug`; the URL never carries a `category` param. */
  ownedCategory?: CategorySlug;
  /** Translated `<title>`, e.g. "Shop | SIWAR". */
  documentTitle: string;
  /** Translated meta description. */
  metaDescription: string;
  /** Replaces the default `ProductGridEmpty` when the query returns no products (search page). */
  emptyStateSlot?: ReactNode;
};

export function ProductListLayout({
  headerSlot,
  showCategoryFilter,
  ownedCategory,
  documentTitle,
  metaDescription,
  emptyStateSlot,
}: ProductListLayoutProps) {
  const { t } = useTranslation();
  const { query } = useProductFilters({ manageCategory: ownedCategory === undefined });
  const categoriesQuery = useCategories();

  // The route slug is part of the query key; memoise so react-query sees a stable identity.
  const effectiveQuery = useMemo(
    () => (ownedCategory === undefined ? query : { ...query, category: ownedCategory }),
    [query, ownedCategory],
  );
  const productsQuery = useProducts(effectiveQuery);

  // Minimal per-page SEO until the F7 pass: document title + meta description from i18n.
  useEffect(() => {
    const previousTitle = document.title;
    document.title = documentTitle;

    const existing = document.querySelector('meta[name="description"]');
    const previousDescription = existing?.getAttribute("content") ?? "";
    let created: HTMLMetaElement | null = null;

    if (existing === null) {
      created = document.createElement("meta");
      created.name = "description";
      created.content = metaDescription;
      document.head.appendChild(created);
    } else {
      existing.setAttribute("content", metaDescription);
    }

    return () => {
      document.title = previousTitle;
      existing?.setAttribute("content", previousDescription);
      created?.remove();
    };
  }, [documentTitle, metaDescription]);

  return (
    <main className="container-page pb-16 pt-6 lg:pb-20">
      {headerSlot}

      <div className="mt-8 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-10">
        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-24">
            {categoriesQuery.isPending ? (
              <FilterPanelSkeleton />
            ) : (
              <FilterPanel category={ownedCategory} showCategory={showCategoryFilter} />
            )}
          </div>
        </aside>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <FilterSheet category={ownedCategory} showCategory={showCategoryFilter} />
              <SortSelect />
            </div>
            <p aria-live="polite" className="text-sm text-fg-muted">
              {t("shop.results.count", { count: productsQuery.data?.total ?? 0 })}
            </p>
          </div>

          <ActiveFilterChips className="mt-4" />

          {productsQuery.isPending ? (
            <ProductGridSkeleton className="mt-6" />
          ) : productsQuery.isError ? (
            <ProductGridError onRetry={() => void productsQuery.refetch()} className="mt-6" />
          ) : productsQuery.data !== undefined && productsQuery.data.data.length === 0 ? (
            emptyStateSlot !== undefined ? (
              <div className="mt-6">{emptyStateSlot}</div>
            ) : (
              <ProductGridEmpty className="mt-6" />
            )
          ) : productsQuery.data !== undefined ? (
            <>
              <ProductGrid products={productsQuery.data.data} className="mt-6" />
              <Pagination
                total={productsQuery.data.total}
                limit={productsQuery.data.limit}
                className="mt-10"
              />
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default ProductListLayout;