import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";

import { AccountEmpty } from "@/components/account/AccountEmpty";
import { OrderCard } from "@/components/account/OrderCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTES } from "@/config/app";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { getMyOrders } from "@/services/api";
import type { Order, OrderState } from "@/services/types";
import { cn } from "@/utils/cn";

type TabId = "all" | "active" | "delivered" | "cancelled";

const TAB_IDS: readonly TabId[] = ["all", "active", "delivered", "cancelled"];

const ACTIVE_STATUSES: readonly OrderState[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
];

function matchesTab(order: Order, tab: TabId): boolean {
  switch (tab) {
    case "all":
      return true;
    case "active":
      return ACTIVE_STATUSES.includes(order.status);
    case "delivered":
      return order.status === "delivered";
    case "cancelled":
      return (
        order.status === "cancelled" || order.status === "returned" || order.status === "refunded"
      );
  }
}

/**
 * `/account/orders` — the customer's order history (`05-ui-context.md` §7.12).
 *
 * Reads from `GET /account/orders`, groups orders with four filter tabs and links each card to its
 * detail page. Loading / error / empty states are all handled here.
 */
export default function OrdersPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabId>("all");

  useDocumentMeta(t("account.meta.ordersTitle"), t("account.orders.subtitle"));

  const ordersQuery = useQuery({
    queryKey: ["account", "orders"],
    queryFn: ({ signal }) => getMyOrders(signal),
  });

  const orders = ordersQuery.data ?? [];
  const filtered = orders.filter((order) => matchesTab(order, tab));

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-heading text-fg">{t("account.orders.title")}</h1>
        <p className="text-fg-muted">{t("account.orders.subtitle")}</p>
      </header>

      {ordersQuery.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : ordersQuery.isError ? (
        <div className="space-y-3 rounded-card border border-line bg-surface p-6 text-center">
          <p className="text-fg-muted">{t("common.error")}</p>
          <Button variant="secondary" size="sm" onClick={() => void ordersQuery.refetch()}>
            {t("common.retry")}
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <AccountEmpty
          Icon={Package}
          title={t("account.orders.emptyTitle")}
          description={t("account.orders.emptyBody")}
          action={<ButtonLink to={ROUTES.shop}>{t("account.orders.emptyCta")}</ButtonLink>}
        />
      ) : (
        <div className="space-y-5">
          <div
            role="group"
            aria-label={t("account.orders.filterLabel")}
            className="flex flex-wrap gap-2"
          >
            {TAB_IDS.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={tab === id}
                onClick={() => setTab(id)}
                className={cn(
                  "min-h-9 rounded-pill border px-4 text-sm transition-colors duration-500 ease-smooth",
                  tab === id
                    ? "border-accent bg-accent text-on-accent"
                    : "border-line text-fg-muted hover:text-accent",
                )}
              >
                {t(`account.orders.tabs.${id}`)}
              </button>
            ))}
          </div>

          <p aria-live="polite" className="text-sm text-fg-muted">
            {t("account.orders.count", { count: filtered.length })}
          </p>

          {filtered.length === 0 ? (
            <p className="rounded-card border border-line bg-surface p-6 text-center text-sm text-fg-muted">
              {t("account.orders.noneInTab")}
            </p>
          ) : (
            <div className="space-y-4">
              {filtered.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
