import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ButtonLink } from "@/components/ui/Button";
import { ProductListLayout } from "@/components/ProductListLayout";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTES } from "@/config/app";
import { useCategories } from "@/hooks/useCatalog";
import { useLocale } from "@/hooks/useLocale";
import { localize } from "@/utils/format";
import { CATEGORY_SLUGS, type CategorySlug } from "@/services/types";

function isCategorySlug(value: string | undefined): value is CategorySlug {
  return value !== undefined && (CATEGORY_SLUGS as readonly string[]).includes(value);
}

/**
 * `/category/:slug` — one category's catalogue (05-ui-context.md §7.4): a banner (image, bilingual
 * name and description) over the shared `ProductListLayout`, with the category owned by the URL
 * path. An invalid slug renders a friendly "category not found" state — never a silent redirect.
 */
export default function CategoryPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { slug } = useParams();
  const categoriesQuery = useCategories();
  const category = categoriesQuery.data?.find((item) => item.slug === slug);

  if (!isCategorySlug(slug)) {
    return (
      <section className="container-page flex min-h-[55vh] flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="font-heading text-heading">{t("shop.category.notFound.title")}</h1>
        <p className="max-w-md text-fg-muted">{t("shop.category.notFound.body")}</p>
        <ButtonLink to={ROUTES.shop} variant="secondary" className="mt-6">
          {t("shop.category.browseAll")}
        </ButtonLink>
      </section>
    );
  }

  const headerSlot = (
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
          <li>
            <Link
              to={ROUTES.shop}
              className="transition-colors duration-500 ease-smooth hover:text-accent"
            >
              {t("shop.page.breadcrumb.shop")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">
            {category === undefined ? (
              <Skeleton className="inline-block h-4 w-24" />
            ) : (
              localize(category.name, locale)
            )}
          </li>
        </ol>
      </nav>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
        {category === undefined ? (
          <>
            <Skeleton className="aspect-video w-full sm:aspect-[4/3] sm:w-64" />
            <div className="flex-1">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="mt-4 h-5 w-full max-w-md" />
            </div>
          </>
        ) : (
          <>
            <div className="aspect-video w-full shrink-0 overflow-hidden rounded-card sm:aspect-[4/3] sm:w-64">
              <img src={category.imageUrl} alt="" className="size-full object-cover" />
            </div>
            <div className="flex-1">
              <h1 className="font-heading text-heading">{localize(category.name, locale)}</h1>
              <p className="mt-3 max-w-xl text-fg-muted">
                {localize(category.description, locale)}
              </p>
            </div>
          </>
        )}
      </div>
    </header>
  );

  return (
    <ProductListLayout
      headerSlot={headerSlot}
      showCategoryFilter={false}
      ownedCategory={slug}
      documentTitle={
        category === undefined
          ? t("shop.meta.title")
          : t("shop.category.meta.title", { name: localize(category.name, locale) })
      }
      metaDescription={
        category === undefined ? t("shop.meta.description") : localize(category.description, locale)
      }
    />
  );
}