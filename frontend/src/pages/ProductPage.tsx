import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ProductGallery } from "@/components/ProductGallery";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { ROUTES } from "@/config/app";
import { useLocale } from "@/hooks/useLocale";
import { useProduct } from "@/hooks/useProduct";
import { localize } from "@/utils/format";

/**
 * `/products/:slug` — F4.1 foundation (05-ui-context.md §7.5).
 *
 * This phase lands the gallery and the product identity (name, breadcrumb, `<title>`), plus the
 * loading / error / not-found states. The info column, variants, actions, reviews and
 * related/matching lists are added in F4.2–F4.4.
 */
export default function ProductPage() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { product, isLoading, isError, isNotFound, refetch } = useProduct(slug);

  const productName = product === null ? "" : localize(product.name, locale);

  useEffect(() => {
    if (product === null) return;
    const previousTitle = document.title;
    document.title = t("product.page.meta.title", { name: productName });
    return () => {
      document.title = previousTitle;
    };
  }, [product, productName, t]);

  if (isLoading) {
    return (
      <div className="container-page py-10 lg:py-14" aria-busy="true">
        <Skeleton className="h-4 w-40" />
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Skeleton className="aspect-[4/5] w-full rounded-card" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-24" />
            <SkeletonText lines={4} />
          </div>
        </div>
        <span className="sr-only">{t("product.page.loading")}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container-page flex min-h-[55vh] flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="font-heading text-heading">{t("common.error")}</h1>
        <Button onClick={() => void refetch()}>{t("common.retry")}</Button>
      </div>
    );
  }

  if (isNotFound || product === null) {
    return (
      <div className="container-page flex min-h-[55vh] flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="font-heading text-heading">{t("product.page.notFound.title")}</h1>
        <p className="max-w-md text-fg-muted">{t("product.page.notFound.body")}</p>
        <ButtonLink to={ROUTES.shop} variant="secondary" className="mt-6">
          {t("product.page.browseAll")}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <nav aria-label={t("product.page.breadcrumb.label")} className="text-sm text-fg-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              to={ROUTES.home}
              className="transition-colors duration-500 ease-smooth hover:text-accent"
            >
              {t("product.page.breadcrumb.home")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              to={ROUTES.shop}
              className="transition-colors duration-500 ease-smooth hover:text-accent"
            >
              {t("product.page.breadcrumb.shop")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{productName}</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="space-y-4">
          <h1 className="font-heading text-heading">{productName}</h1>
          {/* Info column, variants and actions are added in F4.2. */}
        </div>
      </div>
    </div>
  );
}
