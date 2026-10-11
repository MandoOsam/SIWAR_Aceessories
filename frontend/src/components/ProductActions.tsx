import { useState } from "react";
import { Heart, Share2, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ROUTES } from "@/config/app";
import type { Product } from "@/services/types";
import { useCartStore } from "@/store/cartStore";
import { toast } from "@/store/toastStore";
import { cn } from "@/utils/cn";
import { buildCartItem } from "@/utils/product";

export interface ProductActionsProps {
  product: Product;
  selectedColor: string | undefined;
  selectedSize: string | undefined;
  quantity: number;
  /** True when the product is out of stock; disables both purchase buttons. */
  disabled?: boolean;
  className?: string;
}

/**
 * Purchase actions (05-ui-context.md §7.5). "Buy now" adds the line and routes to the cart for now;
 * F5 repoints it at checkout once that route exists. Wishlist is local state — F6 wires the real
 * store. Share uses the Web Share API when present and falls back to copying the URL.
 */
export function ProductActions({
  product,
  selectedColor,
  selectedSize,
  quantity,
  disabled = false,
  className,
}: ProductActionsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const addToCart = (): void => {
    addItem(buildCartItem(product, { color: selectedColor, size: selectedSize }, quantity));
  };

  const handleAddToCart = (): void => {
    addToCart();
    toast(t("product.toast.added"));
  };

  const handleBuyNow = (): void => {
    addToCart();
    navigate(ROUTES.cart);
  };

  const handleShare = async (): Promise<void> => {
    const url = window.location.href;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: t("brand.name"), url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast(t("product.actions.shareCopied"));
    } catch {
      // The customer dismissed the share sheet or blocked clipboard access: nothing to report.
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="primary"
          size="lg"
          onClick={handleAddToCart}
          disabled={disabled}
          className="flex-1"
        >
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          {disabled ? t("product.outOfStock") : t("product.addToCart")}
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={handleBuyNow}
          disabled={disabled}
          className="flex-1"
        >
          {t("product.actions.buyNow")}
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <IconButton
          label={isWishlisted ? t("product.actions.wishlistRemove") : t("product.actions.wishlistAdd")}
          icon={
            <Heart
              className={cn("h-5 w-5", isWishlisted && "fill-accent text-accent")}
              aria-hidden="true"
            />
          }
          aria-pressed={isWishlisted}
          onClick={() => setIsWishlisted((current) => !current)}
        />
        <IconButton
          label={t("product.actions.share")}
          icon={<Share2 className="h-5 w-5" aria-hidden="true" />}
          onClick={() => void handleShare()}
        />
      </div>
    </div>
  );
}

export default ProductActions;
