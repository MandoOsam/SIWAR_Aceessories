import { useEffect } from "react";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { OrderTimeline } from "@/components/OrderTimeline";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTES } from "@/config/app";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useLocale } from "@/hooks/useLocale";
import { getOrderById } from "@/services/api";
import { useCartStore } from "@/store/cartStore";
import { formatDate, formatPrice } from "@/utils/format";

const EASE_SMOOTH: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * `/order/success/:id` (05-ui-context.md §7.9): confirms a placed order.
 *
 * Reads the order back from the service, re-clears the cart (defense in depth if the user lands
 * here directly) and offers tracking. The celebration badge animates unless the visitor prefers
 * reduced motion.
 */
export default function OrderSuccessPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { id } = useParams<{ id: string }>();
  const reduceMotion = useReducedMotion() ?? false;
  const clear = useCartStore((state) => state.clear);

  useDocumentMeta(t("order.success.meta.title"), t("order.success.meta.description"));

  useEffect(() => {
    clear();
  }, [clear]);

  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: ({ signal }) => getOrderById(id ?? "", signal),
    enabled: id !== undefined,
  });

  const order = orderQuery.data;

  if (orderQuery.isLoading) {
    return (
      <div className="container-page pb-16 pt-10" aria-busy="true">
        <div className="mx-auto max-w-2xl space-y-4">
          <p className="sr-only">{t("common.loading")}</p>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (orderQuery.isError) {
    return (
      <div className="container-page pb-16 pt-10">
        <div className="mx-auto max-w-2xl space-y-4" role="alert">
          <h1 className="font-heading text-heading">{t("order.success.error.title")}</h1>
          <p className="text-fg-muted">{t("common.error")}</p>
          <Button variant="secondary" onClick={() => void orderQuery.refetch()}>
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  if (order === null || order === undefined) {
    return (
      <div className="container-page pb-16 pt-10">
        <div className="mx-auto max-w-2xl space-y-4">
          <h1 className="font-heading text-heading">{t("order.success.notFound.title")}</h1>
          <p className="text-fg-muted">{t("order.success.notFound.body")}</p>
          <ButtonLink to={ROUTES.shop}>{t("order.success.continueCta")}</ButtonLink>
        </div>
      </div>
    );
  }

  const trackHref = `${ROUTES.trackOrder}?number=${encodeURIComponent(order.number)}`;

  return (
    <div className="container-page pb-16 pt-10 lg:pb-20">
      <div className="mx-auto max-w-2xl space-y-10">
        <header className="text-center">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: EASE_SMOOTH }}
            className="mx-auto flex size-16 items-center justify-center rounded-pill border border-accent text-accent"
          >
            <Check aria-hidden="true" className="size-8" />
          </motion.span>
          <h1 className="mt-6 font-heading text-heading">{t("order.success.title")}</h1>
          <p className="mt-2 text-fg-muted">{t("order.success.subtitle")}</p>
        </header>

        <dl className="grid gap-5 rounded-card border border-line p-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-fg-muted">{t("order.success.orderNumberLabel")}</dt>
            <dd className="mt-1 font-heading text-display">{order.number}</dd>
          </div>
          <div>
            <dt className="text-sm text-fg-muted">{t("order.success.totalLabel")}</dt>
            <dd className="mt-1 text-heading-sm">{formatPrice(order.total, locale)}</dd>
          </div>
          {order.estimatedDelivery !== undefined ? (
            <div className="sm:col-span-2">
              <dt className="text-sm text-fg-muted">{t("order.success.estimatedDeliveryLabel")}</dt>
              <dd className="mt-1 text-fg">{formatDate(order.estimatedDelivery, locale)}</dd>
            </div>
          ) : null}
        </dl>

        <section>
          <h2 className="font-heading text-heading-sm">{t("order.success.timelineTitle")}</h2>
          <OrderTimeline status={order.status} className="mt-4" />
        </section>

        <div className="flex flex-wrap gap-3">
          <ButtonLink to={trackHref}>{t("order.success.trackCta")}</ButtonLink>
          <ButtonLink to={ROUTES.shop} variant="secondary">
            {t("order.success.continueCta")}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
