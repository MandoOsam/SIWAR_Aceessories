import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { MaterialBlock } from "@/components/MaterialBlock";
import { ProductActions } from "@/components/ProductActions";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInfo } from "@/components/ProductInfo";
import { QuantityStepper } from "@/components/QuantityStepper";
import { StickyAddToCart } from "@/components/StickyAddToCart";
import { VariantSelector } from "@/components/VariantSelector";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { ToastViewport } from "@/components/ui/Toast";
import { ROUTES } from "@/config/app";
import { useLocale } from "@/hooks/useLocale";
import { useProduct } from "@/hooks/useProduct";
import { useRelatedProducts } from "@/hooks/useRelatedProducts";
import type { ProductColor } from "@/services/types";
import { localize } from "@/utils/format";
import { FALLBACK_MAX_QTY } from "@/utils/product";

// Below-the-fold sections are code-split (D-039) so framer-motion (accordion, sliders) and zod
// (review form) stay off the critical path that paints the product identity above the fold.
const Accordion = lazy(() => import("@/components/Accordion"));
const ProductReviews = lazy(() => import("@/components/ProductReviews"));
const MatchingProducts = lazy(() => import("@/components/MatchingProducts"));
const RelatedProducts = lazy(() => import("@/components/RelatedProducts"));
const RecentlyViewedProducts = lazy(() => import("@/components/RecentlyViewedProducts"));

const OG_LOCALE: Record<string, string> = { ar: "ar_EG", en: "en_EG" };

interface Selection {
  productId: string;
  color: ProductColor | undefined;
  size: string | undefined;
  quantity: number;
}

/** Creates or updates a `<meta>` tag and returns a cleanup that restores the previous state. */
function upsertMeta(attribute: "name" | "property", key: string, content: string): () => void {
  const existing = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  const previous = existing?.getAttribute("content") ?? null;
  const meta = existing ?? document.createElement("meta");
  if (existing === null) {
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
  return () => {
    if (previous === null) {
      meta.remove();
    } else {
      meta.setAttribute("content", previous);
    }
  };
}

/**
 * `/products/:slug` — F4 assembly (05-ui-context.md §7.5).
 *
 * The variant selection (colour, size, quantity) is **page-local state** (D-030) held here and passed
 * down, so it never leaks between products. Below-the-fold sections are lazily loaded, and the page
 * owns its own `<title>` / description / Open Graph tags (D-040). `RootLayout` owns `<main>` (D-023),
 * so this page renders an `<article>`.
 */
export default function ProductPage() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { product, isLoading, isError, isNotFound, refetch } = useProduct(slug);
  const { related, matching } = useRelatedProducts(slug);

  const [selection, setSelection] = useState<Selection | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const productName = product === null ? "" : localize(product.name, locale);

  useEffect(() => {
    if (product === null) return;
    const previousTitle = document.title;
    document.title = t("product.page.meta.title", { name: productName });
    return () => {
      document.title = previousTitle;
    };
  }, [product, productName, t]);

  useEffect(() => {
    if (product === null) return;
    const description = localize(product.description, locale);
    const image = product.images[0]?.url;
    const cleanups = [
      upsertMeta("name", "description", description),
      upsertMeta("property", "og:title", productName),
      upsertMeta("property", "og:description", description),
      upsertMeta("property", "og:type", "product"),
      upsertMeta("property", "og:locale", OG_LOCALE[locale] ?? locale),
      ...(image === undefined ? [] : [upsertMeta("property", "og:image", image)]),
    ];
    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [product, productName, locale]);

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

  const current: Selection =
    selection !== null && selection.productId === product.id
      ? selection
      : {
          productId: product.id,
          color: product.colors[0],
          size: product.sizes?.[0],
          quantity: 1,
        };

  const update = (patch: Partial<Omit<Selection, "productId">>): void => {
    setSelection({ ...current, ...patch, productId: product.id });
  };

  const isOutOfStock = product.stock <= 0;
  const maxQuantity =
    product.stock > 0 ? Math.min(product.stock, FALLBACK_MAX_QTY) : FALLBACK_MAX_QTY;

  const accordionItems = [
    { id: "shipping", title: t("product.details.shipping.title"), content: <p>{t("product.details.shipping.body")}</p> },
    { id: "returns", title: t("product.details.returns.title"), content: <p>{t("product.details.returns.body")}</p> },
    { id: "material", title: t("product.details.material.title"), content: <p>{t("product.details.material.body")}</p> },
  ];

  return (
    <article className="container-page py-10 lg:py-14">
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
          <li>
            <Link
              to={ROUTES.category(product.category.slug)}
              className="transition-colors duration-500 ease-smooth hover:text-accent"
            >
              {localize(product.category.name, locale)}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{productName}</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="space-y-8">
          <ProductInfo product={product} />
          <VariantSelector
            colors={product.colors}
            selectedColor={current.color}
            onColorChange={(color) => update({ color })}
            sizes={product.sizes}
            selectedSize={current.size}
            onSizeChange={(size) => update({ size })}
            disabled={isOutOfStock}
          />
          <QuantityStepper
            value={current.quantity}
            onChange={(quantity) => update({ quantity })}
            max={maxQuantity}
            disabled={isOutOfStock}
          />
          <div ref={actionsRef}>
            <ProductActions
              product={product}
              selectedColor={current.color}
              selectedSize={current.size}
              quantity={current.quantity}
              disabled={isOutOfStock}
            />
          </div>
          <MaterialBlock plating={product.plating} />
          <Suspense fallback={null}>
            <Accordion items={accordionItems} />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={null}>
        <ProductReviews productId={product.id} />
        <MatchingProducts products={matching} />
        <RelatedProducts products={related} />
        <RecentlyViewedProducts currentProduct={product} />
      </Suspense>

      <StickyAddToCart
        product={product}
        anchorRef={actionsRef}
        selectedColor={current.color}
        selectedSize={current.size}
        quantity={current.quantity}
        disabled={isOutOfStock}
      />
      <ToastViewport />
    </article>
  );
}
