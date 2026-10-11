import { Bookmark, ShoppingBag, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { QuantityStepper } from "@/components/QuantityStepper";
import { IconButton } from "@/components/ui/IconButton";
import { ROUTES } from "@/config/app";
import { useLocale } from "@/hooks/useLocale";
import type { CartItem as CartLine } from "@/store/cartStore";
import { cn } from "@/utils/cn";
import { formatPrice, localize } from "@/utils/format";

type CartItemProps = {
  item: CartLine;
  /** `cart` shows the quantity stepper and "save for later"; `saved` shows "move to cart". */
  mode?: "cart" | "saved";
  onQtyChange?: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
  onSaveForLater?: (key: string) => void;
  onMoveToCart?: (key: string) => void;
  className?: string;
};

/**
 * A single cart line (05-ui-context.md §7.7): product snapshot image, bilingual name, chosen
 * variant, unit price, quantity and line total, with "save for later" and remove actions.
 *
 * One component serves both the cart list and the "saved for later" list so the two stay visually
 * identical; only the secondary action changes.
 */
export function CartItem({
  item,
  mode = "cart",
  onQtyChange,
  onRemove,
  onSaveForLater,
  onMoveToCart,
  className,
}: CartItemProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const name = localize(item.name, locale);

  const variantParts: string[] = [];
  if (item.variant.color !== undefined) {
    variantParts.push(t(`shop.colors.${item.variant.color}`));
  }
  if (item.variant.size !== undefined) {
    variantParts.push(t("cart.item.size", { size: item.variant.size }));
  }

  return (
    <article className={cn("flex gap-4 border-b border-line py-4", className)}>
      <Link
        to={ROUTES.product(item.slug)}
        tabIndex={-1}
        aria-hidden="true"
        className="shrink-0"
      >
        <img
          src={item.imageUrl}
          alt=""
          width={80}
          height={80}
          loading="lazy"
          className="size-20 rounded-control border border-line bg-surface-2 object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-medium text-fg">
              <Link
                to={ROUTES.product(item.slug)}
                className="transition-colors duration-500 ease-smooth hover:text-accent"
              >
                {name}
              </Link>
            </h3>
            {variantParts.length > 0 ? (
              <p className="mt-0.5 text-sm text-fg-muted">{variantParts.join(" · ")}</p>
            ) : null}
            <p className="mt-0.5 text-sm text-fg-muted">{formatPrice(item.price, locale)}</p>
          </div>
          <p className="shrink-0 font-medium text-fg">
            {formatPrice(item.price * item.qty, locale)}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {mode === "cart" ? (
            <QuantityStepper
              value={item.qty}
              onChange={(qty) => onQtyChange?.(item.key, qty)}
              max={item.maxQty}
            />
          ) : (
            <span className="text-sm text-fg-muted">{t("cart.item.quantity", { qty: item.qty })}</span>
          )}

          <div className="flex items-center gap-1">
            {mode === "cart" && onSaveForLater !== undefined ? (
              <button
                type="button"
                onClick={() => onSaveForLater(item.key)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-control px-3 text-sm text-fg-muted transition-colors duration-500 ease-smooth hover:text-accent"
              >
                <Bookmark aria-hidden="true" className="size-4" />
                {t("cart.item.save")}
              </button>
            ) : null}

            {mode === "saved" && onMoveToCart !== undefined ? (
              <button
                type="button"
                onClick={() => onMoveToCart(item.key)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-control px-3 text-sm text-fg-muted transition-colors duration-500 ease-smooth hover:text-accent"
              >
                <ShoppingBag aria-hidden="true" className="size-4" />
                {t("cart.item.moveToCart")}
              </button>
            ) : null}

            <IconButton
              label={t("cart.item.removeLabel", { name })}
              onClick={() => onRemove(item.key)}
              icon={<Trash2 aria-hidden="true" className="size-5" />}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export default CartItem;
