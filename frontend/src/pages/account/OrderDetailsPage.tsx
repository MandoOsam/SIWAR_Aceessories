import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Package, Printer, Repeat, RotateCcw, XCircle } from "lucide-react";

import { StatusBadge } from "@/components/account/StatusBadge";
import { AccountEmpty } from "@/components/account/AccountEmpty";
import { OrderTimeline } from "@/components/OrderTimeline";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTES } from "@/config/app";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useLocale } from "@/hooks/useLocale";
import {
  cancelOrder,
  getMyOrder,
  getShippingOptions,
  listGovernorates,
  requestReturn,
} from "@/services/api";
import type { Order, OrderItem, OrderState } from "@/services/types";
import { useCartStore } from "@/store/cartStore";
import { toast } from "@/store/toastStore";
import { formatDate, formatPrice, localize } from "@/utils/format";

const CANCELABLE_STATUSES: readonly OrderState[] = ["pending", "confirmed"];
const RETURNABLE_STATUSES: readonly OrderState[] = ["delivered"];

/**
 * `/account/orders/:id` — a single order (`05-ui-context.md` §7.12).
 *
 * Shows the status timeline, the ordered lines, the delivery address, the payment method and the
 * totals, plus cancel / return / reorder and a print-friendly invoice. Cancelling and returning are
 * the mock equivalents of `POST /orders/:id/cancel` and `/return`.
 */
export default function OrderDetailsPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id = "" } = useParams();
  const addItem = useCartStore((state) => state.addItem);

  useDocumentMeta(t("account.meta.orderDetailsTitle"), t("account.orderDetails.subtitle"));

  const orderQuery = useQuery({
    queryKey: ["account", "order", id],
    queryFn: ({ signal }) => getMyOrder(id, signal),
    enabled: id !== "",
  });
  const governoratesQuery = useQuery({
    queryKey: ["checkout", "governorates"],
    queryFn: ({ signal }) => listGovernorates(signal),
  });
  const shippingQuery = useQuery({
    queryKey: ["shipping-options"],
    queryFn: ({ signal }) => getShippingOptions(signal),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["account", "order", id] });
    void queryClient.invalidateQueries({ queryKey: ["account", "orders"] });
  };

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(id),
    onSuccess: () => {
      toast(t("account.orderDetails.cancelled"));
      invalidate();
    },
    onError: () => toast(t("auth.errors.generic"), "error"),
  });

  const returnMutation = useMutation({
    mutationFn: () => requestReturn(id),
    onSuccess: () => {
      toast(t("account.orderDetails.returned"));
      invalidate();
    },
    onError: () => toast(t("auth.errors.generic"), "error"),
  });

  const order = orderQuery.data;
  const governorates = governoratesQuery.data ?? [];
  const shippingOptions = shippingQuery.data ?? [];

  const handleReorder = (current: Order) => {
    for (const item of current.items) {
      addItem({
        productId: item.productId,
        slug: item.productId,
        name: item.name,
        imageUrl: item.imageUrl ?? "",
        price: item.unitPrice,
        qty: item.qty,
        variant: item.variant ?? {},
        maxQty: item.qty,
      });
    }
    toast(t("account.orderDetails.reordered"));
    navigate(ROUTES.cart);
  };

  if (orderQuery.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (orderQuery.isError) {
    return (
      <div className="space-y-3 rounded-card border border-line bg-surface p-6 text-center">
        <p className="text-fg-muted">{t("common.error")}</p>
        <Button variant="secondary" size="sm" onClick={() => void orderQuery.refetch()}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  if (order === null || order === undefined) {
    return (
      <div className="space-y-6">
        <AccountEmpty
          Icon={Package}
          title={t("account.orderDetails.notFoundTitle")}
          description={t("account.orderDetails.notFoundBody")}
          action={<ButtonLink to={ROUTES.accountOrders}>{t("account.orders.title")}</ButtonLink>}
        />
      </div>
    );
  }

  const governorateName = governorates.find(
    (item) => item.value === order.address.governorate,
  )?.name;
  const region =
    governorateName === undefined ? order.address.governorate : localize(governorateName, locale);
  const streetLine = [order.address.street, order.address.building, order.address.apartment]
    .filter((part) => part !== undefined && part.trim() !== "")
    .join(", ");
  const deliveryName = shippingOptions.find((option) => option.id === order.deliveryOptionId)?.name;

  return (
    <div className="space-y-8">
      <Link
        to={ROUTES.accountOrders}
        className="inline-flex items-center gap-2 text-sm text-fg-muted transition-colors duration-500 ease-smooth hover:text-accent"
      >
        <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
        {t("account.orderDetails.back")}
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-heading text-fg">{t("account.orderDetails.title")}</h1>
          <p dir="ltr" className="text-start text-fg-muted">
            {order.number}
          </p>
          <p className="text-sm text-fg-muted">{formatDate(order.createdAt, locale)}</p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="font-heading text-lg text-fg">{t("account.orderDetails.timeline")}</h2>
        <OrderTimeline status={order.status} className="mt-5" />
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg text-fg">{t("account.orderDetails.items")}</h2>
        <ul className="divide-y divide-line rounded-card border border-line bg-surface">
          {order.items.map((item) => (
            <OrderLine
              key={`${item.productId}-${item.variant?.color ?? ""}-${item.variant?.size ?? ""}`}
              item={item}
            />
          ))}
        </ul>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-2 rounded-card border border-line bg-surface p-5">
          <h2 className="font-heading text-lg text-fg">{t("account.orderDetails.address")}</h2>
          <address className="space-y-1 text-sm not-italic text-fg-muted">
            <p className="text-fg">{order.customer.name}</p>
            <p dir="ltr" className="text-start">
              {order.customer.phone}
            </p>
            <p>{streetLine}</p>
            <p>{region}</p>
          </address>
        </section>

        <section className="space-y-2 rounded-card border border-line bg-surface p-5">
          <h2 className="font-heading text-lg text-fg">{t("account.orderDetails.payment")}</h2>
          <p className="text-sm text-fg">
            {t(`account.orderDetails.methods.${order.paymentMethod}`)}
          </p>
          <p className="text-sm text-fg-muted">
            {deliveryName !== undefined
              ? localize(deliveryName, locale)
              : t("account.orderDetails.delivery")}
          </p>
        </section>
      </div>

      <section className="space-y-2 rounded-card border border-line bg-surface p-5">
        <h2 className="font-heading text-lg text-fg">{t("account.orderDetails.summary")}</h2>
        <dl className="space-y-1 text-sm">
          <SummaryRow
            label={t("account.orderDetails.subtotal")}
            value={formatPrice(order.subtotal, locale)}
          />
          <SummaryRow
            label={t("account.orderDetails.shipping")}
            value={formatPrice(order.shippingFee, locale)}
          />
          {order.discount > 0 ? (
            <SummaryRow
              label={t("account.orderDetails.discount")}
              value={`- ${formatPrice(order.discount, locale)}`}
            />
          ) : null}
          <div className="flex items-center justify-between border-t border-line pt-2 text-base font-medium text-fg">
            <dt>{t("account.orderDetails.total")}</dt>
            <dd>{formatPrice(order.total, locale)}</dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={() => handleReorder(order)}>
          <Repeat aria-hidden="true" className="size-4" />
          {t("account.orderDetails.reorder")}
        </Button>

        {CANCELABLE_STATUSES.includes(order.status) ? (
          <Button
            variant="secondary"
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
          >
            <XCircle aria-hidden="true" className="size-4" />
            {t("account.orderDetails.cancel")}
          </Button>
        ) : null}

        {RETURNABLE_STATUSES.includes(order.status) ? (
          <Button
            variant="secondary"
            onClick={() => returnMutation.mutate()}
            disabled={returnMutation.isPending}
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            {t("account.orderDetails.return")}
          </Button>
        ) : null}

        <Button variant="ghost" onClick={() => window.print()}>
          <Printer aria-hidden="true" className="size-4" />
          {t("account.orderDetails.invoice")}
        </Button>
      </div>
    </div>
  );
}

/** One ordered line: thumbnail, name, variant, quantity and line total. */
function OrderLine({ item }: { item: OrderItem }) {
  const { locale } = useLocale();
  const variant = [item.variant?.color, item.variant?.size].filter(Boolean).join(" · ");

  return (
    <li className="flex items-center gap-4 p-4">
      <span className="size-14 shrink-0 overflow-hidden rounded-card bg-surface-2">
        {item.imageUrl !== undefined && item.imageUrl !== "" ? (
          <img src={item.imageUrl} alt="" className="size-full object-cover" />
        ) : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">{localize(item.name, locale)}</p>
        {variant !== "" ? <p className="text-xs text-fg-muted">{variant}</p> : null}
        <p className="text-xs text-fg-muted">{`×${item.qty}`}</p>
      </div>
      <span className="text-sm text-fg">{formatPrice(item.lineTotal, locale)}</span>
    </li>
  );
}

/** Label/value row inside the totals list. */
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-fg-muted">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
