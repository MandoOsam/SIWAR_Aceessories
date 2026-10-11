import { useState } from "react";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useLocale } from "@/hooks/useLocale";
import type { Product } from "@/services/types";
import { cn } from "@/utils/cn";
import { formatNumber, formatPrice, localize } from "@/utils/format";
import { resolveStockStatus, type StockStatus } from "@/utils/product";

export interface ProductInfoProps {
  product: Product;
  /** Anchor of the reviews section; defaults to `#reviews` (built in F4.3). */
  reviewsHref?: string;
  className?: string;
}

const RATING_STARS = [0, 1, 2, 3, 4];

/**
 * Product identity block (05-ui-context.md §7.5): name, rating, price with discount, truncated
 * description and stock status. Renders the page's `<h1>`; the info column's variants/actions are
 * separate F4.2 components assembled in F4.4.
 */
export function ProductInfo({ product, reviewsHref = "#reviews", className }: ProductInfoProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);

  const status: StockStatus = resolveStockStatus(product.stock);
  const filledStars = Math.round(product.rating);
  const hasDiscount = product.oldPrice !== undefined && product.oldPrice > product.price;

  return (
    <div className={cn("space-y-4", className)}>
      <h1 className="font-heading text-heading text-fg">{localize(product.name, locale)}</h1>

      <div className="flex flex-wrap items-center gap-4">
        <span
          role="img"
          aria-label={t("product.info.ratingLabel", { rating: product.rating })}
          className="flex items-center gap-1"
        >
          {RATING_STARS.map((index) => (
            <Star
              key={index}
              className={cn(
                "h-4 w-4",
                index < filledStars ? "fill-accent text-accent" : "text-fg-muted",
              )}
              aria-hidden="true"
            />
          ))}
        </span>
        <a
          href={reviewsHref}
          className="text-sm text-fg-muted transition-colors duration-300 ease-smooth hover:text-accent"
        >
          {t("product.info.reviews", { count: product.reviewsCount })}
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-2xl font-semibold text-fg">
          {formatPrice(product.price, locale)}
        </span>
        {hasDiscount && product.oldPrice !== undefined && (
          <>
            <span className="text-base text-fg-muted line-through">
              {formatPrice(product.oldPrice, locale)}
            </span>
            <span className="rounded-pill bg-accent-2 px-2 py-1 text-xs font-medium text-on-accent">
              {t("product.info.discount", { percent: product.discountPercent ?? 0 })}
            </span>
          </>
        )}
      </div>

      <p
        className={cn(
          "text-sm leading-relaxed text-fg-muted",
          !isExpanded && "line-clamp-3",
        )}
      >
        {localize(product.description, locale)}
      </p>
      <button
        type="button"
        onClick={() => setIsExpanded((expanded) => !expanded)}
        aria-expanded={isExpanded}
        className="text-sm font-medium text-accent transition-colors duration-300 ease-smooth hover:text-accent-2"
      >
        {isExpanded ? t("product.info.readLess") : t("product.info.readMore")}
      </button>

      <p
        className={cn(
          "inline-flex w-fit items-center rounded-pill border px-3 py-1 text-xs font-medium",
          status === "out-of-stock" && "border-line text-fg-muted",
          status === "low-stock" && "border-accent-2 text-accent-2",
          status === "in-stock" && "border-accent text-accent",
        )}
      >
        {status === "out-of-stock" && t("product.info.stock.out")}
        {status === "low-stock" && t("product.info.stock.low", { left: product.stock })}
        {status === "in-stock" && t("product.info.stock.in", { available: formatNumber(product.stock, locale) })}
      </p>
    </div>
  );
}

export default ProductInfo;
