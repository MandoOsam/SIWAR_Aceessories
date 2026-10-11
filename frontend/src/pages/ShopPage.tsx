import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ProductListLayout } from "@/components/ProductListLayout";
import { ROUTES } from "@/config/app";

/**
 * `/shop` — the full catalogue (05-ui-context.md §7.3). All state lives in the URL through
 * `useProductFilters`; the shared `ProductListLayout` fetches and assembles the F3.2/F3.3 building
 * blocks, so this page only supplies the header and the SEO strings.
 */
export default function ShopPage() {
  const { t } = useTranslation();

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
              <li aria-current="page">{t("shop.page.breadcrumb.shop")}</li>
            </ol>
          </nav>
          <h1 className="mt-4 font-heading text-heading">{t("shop.page.title")}</h1>
        </header>
      }
      showCategoryFilter
      documentTitle={t("shop.meta.title")}
      metaDescription={t("shop.meta.description")}
    />
  );
}