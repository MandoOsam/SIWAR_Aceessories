import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { StatusBadge } from "@/components/account/StatusBadge";
import { ROUTES } from "@/config/app";
import { useLocale } from "@/hooks/useLocale";
import type { Order } from "@/services/types";
import { formatDate, formatPrice } from "@/utils/format";

export interface OrderCardProps {
  order: Order;
}

/** Summary card for one order in the `/account/orders` list. */
export function OrderCard({ order }: OrderCardProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <article className="rounded-card border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">
            {t("account.orders.number")}
          </p>
          <p dir="ltr" className="text-start font-medium text-fg">
            {order.number}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-fg-muted">{t("account.orders.date")}</dt>
          <dd className="text-fg">{formatDate(order.createdAt, locale)}</dd>
        </div>
        <div>
          <dt className="text-fg-muted">{t("account.orders.items")}</dt>
          <dd className="text-fg">{t("account.orders.itemCount", { count: itemCount })}</dd>
        </div>
        <div>
          <dt className="text-fg-muted">{t("account.orders.total")}</dt>
          <dd className="text-fg">{formatPrice(order.total, locale)}</dd>
        </div>
      </dl>

      <Link
        to={ROUTES.accountOrderDetails(order.id)}
        className="mt-4 inline-block text-sm text-accent hover:underline"
      >
        {t("account.orders.view")}
      </Link>
    </article>
  );
}

export default OrderCard;
