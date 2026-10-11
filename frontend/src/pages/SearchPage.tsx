import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ButtonLink } from "@/components/ui/Button";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { ProductListLayout } from "@/components/ProductListLayout";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { ROUTES } from "@/config/app";
import { useProducts } from "@/hooks/useCatalog";
import { useLocale } from "@/hooks/useLocale";
import { FILTER_PARAM, useProductFilters } from "@/hooks/useProductFilters";
import { popularSearches } from "@/data/search";
import { localize } from "@/utils/format";

/**
 * `/search?q=` (05-ui-context.md §7.6): autocomplete field, results grid with the same filters /
 * sort / pagination as `/shop`, a "what are you looking for?" landing when `q` is empty, and a
 * friendly no-results state with suggested products. The query lives in `?q=` (owning the URL).
 */
export default function SearchPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const { filters } = useProductFilters();
  const query = filters.search.trim();

  const goToTerm = (term: string): void => {
    navigate(`${ROUTES.search}?${FILTER_PARAM.search}=${encodeURIComponent(term)}`);
  };

  if (query === "") {
    return (
      <div className="container-page pb-16 pt-6 lg:pb-20">
        <header className="border-b border-line pb-6">
          <h1 className="font-heading text-heading">{t("search.title")}</h1>
          <div className="mt-6 max-w-xl">
            <SearchAutocomplete query="" />
          </div>
        </header>

        <section className="mt-10 max-w-xl">
          <h2 className="font-heading text-heading-sm">{t("search.whatAreYouLookingFor")}</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {popularSearches.map((item) => (
              <li key={item.en}>
                <button
                  type="button"
                  onClick={() => goToTerm(localize(item, locale))}
                  className="min-h-11 rounded-pill border border-line px-4 text-sm text-fg transition-colors duration-500 ease-smooth hover:border-accent hover:text-accent"
                >
                  {localize(item, locale)}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  return (
    <ProductListLayout
      headerSlot={
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
              <li aria-current="page">{t("search.title")}</li>
            </ol>
          </nav>
          <h1 className="mt-4 font-heading text-heading">
            {t("search.resultsFor", { query })}
          </h1>
          <div className="mt-6 max-w-xl">
            <SearchAutocomplete query={query} />
          </div>
        </header>
      }
      showCategoryFilter
      documentTitle={t("search.meta.title", { query })}
      metaDescription={t("search.meta.description", { query })}
      emptyStateSlot={<SearchNoResults query={query} />}
    />
  );
}

/** No-results state: suggested best sellers plus a link to the whole shop. */
function SearchNoResults({ query }: { query: string }) {
  const { t } = useTranslation();
  const bestSellers = useProducts({ sort: "best-selling" });
  const suggestions = bestSellers.data?.data.slice(0, 4) ?? [];

  return (
    <div className="text-center">
      <h2 className="font-heading text-heading-sm">{t("search.noResultsFor", { query })}</h2>
      <p className="mx-auto mt-2 max-w-md text-fg-muted">{t("search.noResultsBody")}</p>

      {bestSellers.isPending ? (
        <ProductGridSkeleton className="mt-8" />
      ) : suggestions.length > 0 ? (
        <div className="mt-8 text-start">
          <h3 className="mb-4 font-heading text-xs uppercase tracking-[0.24em] text-fg-muted">
            {t("search.suggestedProducts")}
          </h3>
          <ProductGrid products={suggestions} />
        </div>
      ) : null}

      <ButtonLink to={ROUTES.shop} variant="secondary" className="mt-8">
        {t("shop.category.browseAll")}
      </ButtonLink>
    </div>
  );
}