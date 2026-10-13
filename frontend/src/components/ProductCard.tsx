import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/utils/cn";
import { formatPrice, localize } from "@/utils/format";
import type { Product } from "@/services/types";
import { useLocale } from "@/hooks/useLocale";
import { IconButton } from "@/components/ui/IconButton";
import { useCartStore } from "@/store/cartStore";
import { toast } from "@/store/toastStore";
import { useWishlistStore } from "@/store/wishlist";
import { buildCartItem } from "@/utils/product";

export interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) => state.items.includes(product.id));

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const secondaryImage = product.images.find((img) => !img.isPrimary) || primaryImage;
  const displayImage = isHovered && product.images.length > 1 ? secondaryImage : primaryImage;

  const isOutOfStock = product.stock <= 0;
  const discount =
    product.discountPercent ??
    (product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : undefined);
  const showDiscountBadge = discount !== undefined && discount > 0;
  const showNewBadge = product.isNew;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast(isWishlisted ? t("product.toast.wishlistRemoved") : t("product.toast.wishlistAdded"));
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(buildCartItem(product, {}, 1));
    toast(t("product.toast.added"));
  };

  return (
    <article
      className={cn("group relative flex flex-col", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.slug}`} className="flex flex-col">
        <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-surface-2">
          {displayImage && !imageError ? (
            <img
              src={displayImage.url}
              alt={localize(displayImage.alt, locale)}
              loading="lazy"
              width={600}
              height={750}
              className="absolute inset-0 size-full object-cover object-center transition-transform duration-700 ease-smooth group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-2 text-fg-muted">
              {t("common.loading")}
            </div>
          )}

          {/* Badges */}
          <div className="absolute start-3 top-3 flex flex-col gap-2">
            {showNewBadge && (
              <span className="rounded-pill bg-accent px-2 py-1 text-xs font-medium text-on-accent">
                {t("product.new")}
              </span>
            )}
            {showDiscountBadge && (
              <span className="rounded-pill bg-accent-2 px-2 py-1 text-xs font-medium text-on-accent">
                -{discount}%
              </span>
            )}
            {isOutOfStock && (
              <span className="rounded-pill bg-surface-2 px-2 py-1 text-xs font-medium text-fg-muted">
                {t("product.outOfStock")}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="absolute end-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-500 ease-smooth group-hover:opacity-100 md:flex">
            <IconButton
              onClick={handleWishlistClick}
              label={t("nav.wishlist")}
              aria-pressed={isWishlisted}
              className="bg-surface/80 backdrop-blur-sm hover:bg-surface"
              icon={<Heart className={cn("h-5 w-5", isWishlisted && "fill-accent text-accent")} />}
            />
            {!isOutOfStock && (
              <IconButton
                onClick={handleQuickAddClick}
                label={t("product.addToCart")}
                className="bg-surface/80 backdrop-blur-sm hover:bg-surface"
                icon={<ShoppingCart className="h-5 w-5" />}
              />
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
                <span className="text-xs text-fg-muted">
                  {product.rating} ({product.reviewsCount})
                </span>
              </div>
            )}
          </div>
          <h3 className="font-body text-sm font-medium text-fg line-clamp-2">
            {localize(product.name, locale)}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-fg">
              {formatPrice(product.price, locale)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-xs text-fg-muted line-through">
                {formatPrice(product.oldPrice, locale)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;
