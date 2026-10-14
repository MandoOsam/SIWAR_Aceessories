import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bell, Heart, MapPin, Package, Pencil, type LucideIcon } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTES } from "@/config/app";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useLocale } from "@/hooks/useLocale";
import { getMyAddresses, getMyOrders } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { selectUnreadCount, useNotificationsStore } from "@/store/notifications";
import { selectWishlistCount, useWishlistStore } from "@/store/wishlist";
import { localize } from "@/utils/format";

/**
 * `/account` — the account dashboard (05-ui-context.md §7.12).
 *
 * Greets the customer and summarises the four account areas: real order and address counts from the
 * account service, plus the client-side wishlist and unread-notification counts from their stores.
 */
export default function AccountDashboardPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const user = useAuthStore((state) => state.user);
  const wishlistCount = useWishlistStore(selectWishlistCount);
  const unreadCount = useNotificationsStore(selectUnreadCount);

  useDocumentMeta(t("account.meta.dashboardTitle"), t("account.dashboard.subtitle"));

  const ordersQuery = useQuery({
    queryKey: ["account", "orders"],
    queryFn: ({ signal }) => getMyOrders(signal),
  });
  const addressesQuery = useQuery({
    queryKey: ["account", "addresses"],
    queryFn: ({ signal }) => getMyAddresses(signal),
  });

  const displayName =
    user?.displayName !== undefined ? localize(user.displayName, locale).trim() : "";
  const name = displayName === "" ? (user?.name ?? "") : displayName;

  const ordersText =
    ordersQuery.data !== undefined && ordersQuery.data.length > 0
      ? t("account.dashboard.ordersCount", { count: ordersQuery.data.length })
      : t("account.dashboard.ordersEmpty");
  const addressesText =
    addressesQuery.data !== undefined && addressesQuery.data.length > 0
      ? t("account.dashboard.addressesCount", { count: addressesQuery.data.length })
      : t("account.dashboard.addressEmpty");
  const wishlistText =
    wishlistCount > 0
      ? t("account.dashboard.wishlistCount", { count: wishlistCount })
      : t("account.dashboard.wishlistEmpty");
  const notificationsText =
    unreadCount > 0
      ? t("account.dashboard.notificationsCount", { count: unreadCount })
      : t("account.dashboard.notificationsEmpty");

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-heading text-fg">
          {t("account.dashboard.welcome", { name })}
        </h1>
        <p className="text-fg-muted">{t("account.dashboard.subtitle")}</p>
        <ButtonLink to={ROUTES.accountProfile} variant="secondary" size="sm" className="mt-2">
          <Pencil aria-hidden="true" className="size-4" />
          {t("account.dashboard.editProfile")}
        </ButtonLink>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardCard
          Icon={Package}
          title={t("account.dashboard.ordersTitle")}
          loading={ordersQuery.isPending}
          text={ordersText}
          to={ROUTES.accountOrders}
          linkLabel={t("account.dashboard.ordersLink")}
        />
        <DashboardCard
          Icon={Heart}
          title={t("account.dashboard.wishlistTitle")}
          loading={false}
          text={wishlistText}
          to={ROUTES.accountWishlist}
          linkLabel={t("account.dashboard.wishlistLink")}
        />
        <DashboardCard
          Icon={MapPin}
          title={t("account.dashboard.addressTitle")}
          loading={addressesQuery.isPending}
          text={addressesText}
          to={ROUTES.accountAddresses}
          linkLabel={t("account.dashboard.addressLink")}
        />
        <DashboardCard
          Icon={Bell}
          title={t("account.dashboard.notificationsTitle")}
          loading={false}
          text={notificationsText}
          to={ROUTES.accountNotifications}
          linkLabel={t("account.dashboard.notificationsLink")}
        />
      </div>
    </div>
  );
}

type DashboardCardProps = {
  Icon: LucideIcon;
  title: string;
  /** True while the backing query is still loading, so the summary shows a skeleton. */
  loading: boolean;
  text: string;
  to: string;
  linkLabel: string;
};

/** One summary tile: icon, title, count/empty text and a link into its account area. */
function DashboardCard({ Icon, title, loading, text, to, linkLabel }: DashboardCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-pill bg-surface-2 text-accent">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <h2 className="font-heading text-lg text-fg">{title}</h2>
      </div>
      {loading ? (
        <Skeleton className="h-4 w-24" />
      ) : (
        <p className="flex-1 text-sm text-fg-muted">{text}</p>
      )}
      <Link to={to} className="text-sm text-accent hover:underline">
        {linkLabel}
      </Link>
    </article>
  );
}
