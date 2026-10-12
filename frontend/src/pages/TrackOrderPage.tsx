import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";

import { OrderTimeline } from "@/components/OrderTimeline";
import { EGYPT_MOBILE_REGEX } from "@/components/checkout/checkoutSchemas";
import { CONTROL_CLASSES, Field } from "@/components/checkout/fields";
import { Button } from "@/components/ui/Button";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useLocale } from "@/hooks/useLocale";
import { getOrderByNumberAndPhone } from "@/services/api";
import type { Order } from "@/services/types";
import { formatDate, formatPrice } from "@/utils/format";

const trackSchema = z.object({
  number: z.string().trim().min(1),
  phone: z.string().trim().regex(EGYPT_MOBILE_REGEX),
});

/**
 * `/track-order` (05-ui-context.md §7.9): guest lookup by order number + mobile number.
 *
 * The number can be prefilled from `?number=` (the success page links here). The form is a
 * controlled Zod-validated pair (D-035); a match renders the timeline, a miss shows a friendly
 * message.
 */
export default function TrackOrderPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [searchParams] = useSearchParams();

  const [number, setNumber] = useState(searchParams.get("number") ?? "");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState({ number: false, phone: false });
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [failed, setFailed] = useState(false);

  useDocumentMeta(t("order.track.meta.title"), t("order.track.meta.description"));

  const canSubmit = trackSchema.safeParse({ number, phone }).success;
  const numberError =
    touched.number && !trackSchema.shape.number.safeParse(number).success
      ? t("order.track.errors.number")
      : undefined;
  const phoneError =
    touched.phone && !trackSchema.shape.phone.safeParse(phone).success
      ? t("order.track.errors.phone")
      : undefined;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setTouched({ number: true, phone: true });
    if (!trackSchema.safeParse({ number, phone }).success) {
      return;
    }
    setIsSearching(true);
    setFailed(false);
    setSearched(false);
    setOrder(null);
    try {
      setOrder(await getOrderByNumberAndPhone(number, phone));
      setSearched(true);
    } catch {
      setFailed(true);
      setSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container-page pb-16 pt-10 lg:pb-20">
      <div className="mx-auto max-w-xl space-y-8">
        <header className="space-y-2">
          <h1 className="font-heading text-heading">{t("order.track.title")}</h1>
          <p className="text-fg-muted">{t("order.track.body")}</p>
        </header>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5" noValidate>
          <Field id="track-number" label={t("order.track.number")} error={numberError}>
            {({ describedBy, invalid }) => (
              <input
                id="track-number"
                name="number"
                type="text"
                autoComplete="off"
                value={number}
                onChange={(event) => setNumber(event.target.value)}
                onBlur={() => setTouched((state) => ({ ...state, number: true }))}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                placeholder={t("order.track.numberPlaceholder")}
                className={CONTROL_CLASSES}
              />
            )}
          </Field>

          <Field id="track-phone" label={t("order.track.phone")} error={phoneError}>
            {({ describedBy, invalid }) => (
              <input
                id="track-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                onBlur={() => setTouched((state) => ({ ...state, phone: true }))}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                placeholder={t("order.track.phonePlaceholder")}
                className={CONTROL_CLASSES}
              />
            )}
          </Field>

          <Button type="submit" disabled={!canSubmit || isSearching}>
            {isSearching ? t("order.track.searching") : t("order.track.submit")}
          </Button>
        </form>

        <div aria-live="polite">
          {failed ? (
            <p role="alert" className="text-fg-muted">
              {t("order.track.errors.generic")}
            </p>
          ) : searched && order === null ? (
            <div className="space-y-2 rounded-card border border-line p-5">
              <h2 className="font-heading text-heading-sm">{t("order.track.notFound.title")}</h2>
              <p className="text-fg-muted">{t("order.track.notFound.body")}</p>
            </div>
          ) : order !== null ? (
            <div className="space-y-6 rounded-card border border-line p-5">
              <div className="space-y-1">
                <h2 className="font-heading text-heading-sm">
                  {t("order.track.resultTitle", { number: order.number })}
                </h2>
                <p className="text-sm text-fg-muted">
                  {t("order.track.totalLabel", { total: formatPrice(order.total, locale) })}
                </p>
                {order.estimatedDelivery !== undefined ? (
                  <p className="text-sm text-fg-muted">
                    {t("order.track.estimatedDeliveryLabel", {
                      date: formatDate(order.estimatedDelivery, locale),
                    })}
                  </p>
                ) : null}
              </div>
              <OrderTimeline status={order.status} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
