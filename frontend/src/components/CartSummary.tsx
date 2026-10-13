import { useState, type FormEvent } from "react";
import { Tag, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ROUTES } from "@/config/app";
import { useLocale } from "@/hooks/useLocale";
import { validateCoupon, type CouponError } from "@/services/api";
import {
  selectCartCount,
  selectDiscount,
  selectSubtotal,
  selectTotal,
  useCartStore,
} from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format";

type CartSummaryProps = {
  className?: string;
};

/**
 * Cart totals and the coupon field (05-ui-context.md §7.7): subtotal, shipping (a placeholder
 * until checkout knows the address), discount and total, plus "Continue shopping" / checkout.
 *
 * Used by both `CartPage` and `CartDrawer`; it closes the cart overlay before navigating so the
 * drawer never stays open over the destination page.
 */
export function CartSummary({ className }: CartSummaryProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const closeOverlay = useUiStore((state) => state.closeOverlay);

  const count = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectSubtotal);
  const discount = useCartStore(selectDiscount);
  const total = useCartStore(selectTotal);
  const coupon = useCartStore((state) => state.coupon);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);

  const [code, setCode] = useState("");
  const [error, setError] = useState<CouponError | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const isEmpty = count === 0;

  const handleApply = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const trimmed = code.trim();
    if (trimmed === "" || isApplying) {
      return;
    }
    setIsApplying(true);
    setError(null);
    try {
      const result = await validateCoupon(trimmed, subtotal);
      if (result.valid) {
        applyCoupon({
          code: result.code,
          type: result.type,
          value: result.value,
          maxDiscount: result.maxDiscount,
          freeShipping: result.freeShipping,
        });
        setCode("");
      } else {
        setError(result.error);
      }
    } catch {
      setError("invalid");
    } finally {
      setIsApplying(false);
    }
  };

  const go = (to: string): void => {
    closeOverlay();
    navigate(to);
  };

  return (
    <div className={cn("rounded-card border border-line bg-surface p-5", className)}>
      <h2 className="font-heading text-sm uppercase tracking-[0.24em] text-accent">
        {t("cart.summary.title")}
      </h2>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-fg-muted">{t("cart.summary.subtotal")}</dt>
          <dd className="text-fg">{formatPrice(subtotal, locale)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-fg-muted">{t("cart.summary.shipping")}</dt>
          <dd className="text-fg-muted">
            {coupon?.freeShipping === true
              ? t("cart.summary.shippingFree")
              : t("cart.summary.shippingCalculated")}
          </dd>
        </div>
        {discount > 0 ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-fg-muted">{t("cart.summary.discount")}</dt>
            <dd className="text-accent">{`−${formatPrice(discount, locale)}`}</dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-4 border-t border-line pt-3 text-base">
          <dt className="font-medium text-fg">{t("cart.summary.total")}</dt>
          <dd className="font-medium text-fg">{formatPrice(total, locale)}</dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-line pt-5">
        {coupon !== null ? (
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-fg">
              <Tag aria-hidden="true" className="size-4 text-accent" />
              {t("cart.coupon.applied", { code: coupon.code })}
            </span>
            <IconButton
              label={t("cart.coupon.remove")}
              onClick={removeCoupon}
              icon={<X aria-hidden="true" className="size-5" />}
            />
          </div>
        ) : (
          <form onSubmit={(event) => void handleApply(event)} className="space-y-2">
            <label htmlFor="cart-coupon" className="text-sm font-medium text-fg">
              {t("cart.coupon.label")}
            </label>
            <div className="flex gap-2">
              <input
                id="cart-coupon"
                value={code}
                autoComplete="off"
                placeholder={t("cart.coupon.placeholder")}
                onChange={(event) => {
                  setCode(event.target.value);
                  setError(null);
                }}
                className="min-h-11 min-w-0 flex-1 rounded-control border border-line bg-bg px-3 text-sm text-fg outline-none transition-colors duration-300 ease-smooth placeholder:text-fg-muted focus-visible:ring-2 focus-visible:ring-accent"
              />
              <Button type="submit" variant="secondary" disabled={isApplying || code.trim() === ""}>
                {isApplying ? t("cart.coupon.applying") : t("cart.coupon.apply")}
              </Button>
            </div>
            {error !== null ? (
              <p role="alert" className="text-sm text-accent-2">
                {t(`cart.coupon.errors.${error}`)}
              </p>
            ) : null}
          </form>
        )}
      </div>

      <div className="mt-5 space-y-2">
        <Button onClick={() => go(ROUTES.checkout)} disabled={isEmpty} className="w-full">
          {t("cart.checkout")}
        </Button>
        <Button variant="secondary" onClick={() => go(ROUTES.shop)} className="w-full">
          {t("cart.continueShopping")}
        </Button>
      </div>
    </div>
  );
}

export default CartSummary;
