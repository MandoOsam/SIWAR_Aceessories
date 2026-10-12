import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import type { AddressData, CustomerData } from "@/components/checkout/checkoutSchemas";
import { useLocale } from "@/hooks/useLocale";
import type { CartItem } from "@/store/cartStore";
import type { PaymentMethod, ShippingOption } from "@/services/types";
import { formatPrice, localize } from "@/utils/format";

export interface ReviewStepProps {
  items: CartItem[];
  customer: CustomerData;
  address: AddressData;
  governorateLabel: string;
  delivery: ShippingOption | undefined;
  payment: PaymentMethod | undefined;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  onEdit: (step: number) => void;
}

const STEP_INDEX = { customer: 0, address: 1, delivery: 2, payment: 3 } as const;

/** Checkout step 5 — read-only summary. Totals are a preview; `createOrder` returns the real one. */
export function ReviewStep({
  items,
  customer,
  address,
  governorateLabel,
  delivery,
  payment,
  subtotal,
  discount,
  shippingFee,
  total,
  onEdit,
}: ReviewStepProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const line = (label: string, value: string | undefined) =>
    value !== undefined && value !== "" ? (
      <p className="text-sm text-fg-muted">
        <span className="text-fg">{label}: </span>
        {value}
      </p>
    ) : null;

  const section = (title: string, step: number, body: ReactNode) => (
    <section className="rounded-card border border-line p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="font-heading text-base text-fg">{title}</h3>
        <Button variant="ghost" size="sm" onClick={() => onEdit(step)}>
          {t("checkout.review.edit")}
        </Button>
      </div>
      <div className="space-y-1">{body}</div>
    </section>
  );

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h2 className="font-heading text-heading-sm">{t("checkout.review.title")}</h2>
        <p className="text-sm text-fg-muted">{t("checkout.review.body")}</p>
      </header>

      <ul className="divide-y divide-line rounded-card border border-line">
        {items.map((item) => (
          <li key={item.key} className="flex items-center justify-between gap-4 p-4">
            <span className="text-sm text-fg">
              {localize(item.name, locale)}
              <span className="ms-2 text-fg-muted">× {item.qty}</span>
            </span>
            <span className="text-sm text-fg">{formatPrice(item.price * item.qty, locale)}</span>
          </li>
        ))}
      </ul>

      {section(
        t("checkout.customer.title"),
        STEP_INDEX.customer,
        <>
          {line(t("checkout.customer.name"), customer.name)}
          {line(t("checkout.customer.phone"), customer.phone)}
          {line(t("checkout.customer.email"), customer.email)}
        </>,
      )}

      {section(
        t("checkout.address.title"),
        STEP_INDEX.address,
        <>
          {line(t("checkout.address.governorate"), governorateLabel)}
          {line(t("checkout.address.city"), address.city)}
          {line(t("checkout.address.street"), address.street)}
          {line(t("checkout.address.building"), address.building)}
          {line(t("checkout.address.apartment"), address.apartment)}
          {line(t("checkout.address.notes"), address.notes)}
        </>,
      )}

      {section(
        t("checkout.delivery.title"),
        STEP_INDEX.delivery,
        delivery !== undefined ? (
          <>
            <p className="text-sm text-fg">{localize(delivery.name, locale)}</p>
            <p className="text-sm text-fg-muted">
              {shippingFee === 0
                ? t("checkout.delivery.free")
                : formatPrice(shippingFee, locale)}
            </p>
          </>
        ) : null,
      )}

      {section(
        t("checkout.payment.title"),
        STEP_INDEX.payment,
        payment !== undefined ? (
          <p className="text-sm text-fg">{localize(payment.name, locale)}</p>
        ) : null,
      )}

      <dl className="space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-fg-muted">{t("cart.summary.subtotal")}</dt>
          <dd className="text-fg">{formatPrice(subtotal, locale)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-fg-muted">{t("cart.summary.shipping")}</dt>
          <dd className="text-fg">
            {shippingFee === 0 ? t("cart.summary.shippingFree") : formatPrice(shippingFee, locale)}
          </dd>
        </div>
        {discount > 0 ? (
          <div className="flex items-center justify-between">
            <dt className="text-fg-muted">{t("cart.summary.discount")}</dt>
            <dd className="text-fg">-{formatPrice(discount, locale)}</dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between border-t border-line pt-2 text-base font-medium">
          <dt>{t("cart.summary.total")}</dt>
          <dd>{formatPrice(total, locale)}</dd>
        </div>
      </dl>
    </div>
  );
}

export default ReviewStep;
