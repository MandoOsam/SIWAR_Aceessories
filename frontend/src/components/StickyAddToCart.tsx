import { useEffect, useState, type RefObject } from "react";
import { ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { useLocale } from "@/hooks/useLocale";
import type { Product } from "@/services/types";
import { useCartStore } from "@/store/cartStore";
import { toast } from "@/store/toastStore";
import { cn } from "@/utils/cn";
import { formatPrice, localize } from "@/utils/format";
import { buildCartItem } from "@/utils/product";

export interface StickyAddToCartProps {
  product: Product;
  /** The main purchase block. The bar appears once this leaves the viewport. */
  anchorRef: RefObject<HTMLElement>;
  selectedColor: string | undefined;
  selectedSize: string | undefined;
  quantity: number;
  disabled?: boolean;
}

/**
 * Mobile sticky purchase bar (05-ui-context.md §7.5). Visibility is driven by an
 * `IntersectionObserver` on the main actions block (D-030): no scroll listener, and it hides
 * again as soon as the real button is back on screen. Desktop keeps the inline button only.
 */
export function StickyAddToCart({
  product,
  anchorRef,
  selectedColor,
  selectedSize,
  quantity,
  disabled = false,
}: StickyAddToCartProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const addItem = useCartStore((state) => state.addItem);
  const [isAnchorVisible, setIsAnchorVisible] = useState(true);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (anchor === null) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsAnchorVisible(entry?.isIntersecting ?? true),
      { threshold: 0 },
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [anchorRef]);

  const show = !isAnchorVisible;

  const handleAddToCart = (): void => {
    addItem(buildCartItem(product, { color: selectedColor, size: selectedSize }, quantity));
    toast(t("product.toast.added"));
  };

  return (
    <div
      aria-hidden={!show}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-glass backdrop-blur lg:hidden",
        "transition-transform duration-500 ease-smooth motion-reduce:transition-none",
        show ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-fg">{localize(product.name, locale)}</p>
          <p className="text-sm text-accent">{formatPrice(product.price, locale)}</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleAddToCart}
          disabled={disabled}
          tabIndex={show ? 0 : -1}
        >
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          {disabled ? t("product.outOfStock") : t("product.addToCart")}
        </Button>
      </div>
    </div>
  );
}

export default StickyAddToCart;
