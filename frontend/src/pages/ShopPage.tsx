import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/app";
import { useCategories, useProducts } from "@/hooks/useCatalog";
import { useProductFilters } from "@/hooks/useProductFilters";
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
 * `/shop` — the full catalogue (05-ui-context.md §7.3).
 *
 * All state lives in the URL via `useProductFilters`; the page only fetches (through
 * `useCatalog` → the service layer) and assembles the F3.2/F3.3 building blocks. The desktop
 * sidebar is sticky on `lg`, the mobile `FilterSheet` replaces it below `lg`.
 */
export default function ShopPage() {
  const { t } = useTranslation();
  const { query } = useProductFilters();
  const categoriesQuery = useCategories();
  const productsQuery = useProducts(query);

  // Minimal per-page SEO until the F7 pass: document title + meta description from i18n.
  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("shop.meta.title");

    const existing = document.querySelector('meta[name="description"]');
    const previousDescription = existing?.getAttribute("content") ?? "";
    let created: HTMLMetaElement | null = null;

    if (existing === null) {
      created = document.createElement("meta");
      created.name = "description";
      created.content = t("shop.meta.description");
      document.head.appendChild(created);
    } else {
      existing.setAttribute("content", t("shop.meta.description"));
    }

    return () => {
      document.title = previousTitle;
      existing?.setAttribute("content", previousDescription);
      created?.remove();
    };
  }, [t]);

  return (
    <main className="container-page pb-16 pt-6 lg:pb-20">
      <header className="border-b border-line pb-6">
        <nav aria-label={t("shop.page.breadcrumb.label")} className="text-sm text-fg-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                to={ROUTES.home}
                className="transition-colors duration-500 ease-smooth hover:text-accent"
              >
                {t("shop.page.breadcrumb.home")}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{t("shop.page.breadcrumb.shop")}</li>
          </ol>
        </nav>
        <h1 className="mt-4 font-heading text-heading">{t("shop.page.title")}</h1>
      </header>

      <div className="mt-8 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-10">
        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-24">
            {categoriesQuery.isPending ? <FilterPanelSkeleton /> : <FilterPanel />}
          </div>
        </aside>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <FilterSheet />
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
            <ProductGridEmpty className="mt-6" />
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