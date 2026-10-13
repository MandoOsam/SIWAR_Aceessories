import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Bell, Heart, MapPin, Package, Pencil, type LucideIcon } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { ROUTES } from "@/config/app";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useLocale } from "@/hooks/useLocale";
import { useAuthStore } from "@/store/auth";
import { localize } from "@/utils/format";

/**
 * `/account` — the account dashboard (05-ui-context.md §7.12).
 *
 * Greets the customer and summarises the four account areas. Orders, wishlist, addresses and
 * notifications are built in F6.3, so every card shows its empty state and links to that area; the
 * cards will read real counts once F6.3 wires the services.
 */
export default function AccountDashboardPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const user = useAuthStore((state) => state.user);

  useDocumentMeta(t("account.meta.dashboardTitle"), t("account.dashboard.subtitle"));

  const displayName =
    user?.displayName !== undefined ? localize(user.displayName, locale).trim() : "";
  const name = displayName === "" ? (user?.name ?? "") : displayName;

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
          empty={t("account.dashboard.ordersEmpty")}
          to={ROUTES.accountOrders}
          linkLabel={t("account.dashboard.ordersLink")}
        />
        <DashboardCard
          Icon={Heart}
          title={t("account.dashboard.wishlistTitle")}
          empty={t("account.dashboard.wishlistEmpty")}
          to={ROUTES.accountWishlist}
          linkLabel={t("account.dashboard.wishlistLink")}
        />
        <DashboardCard
          Icon={MapPin}
          title={t("account.dashboard.addressTitle")}
          empty={t("account.dashboard.addressEmpty")}
          to={ROUTES.accountAddresses}
          linkLabel={t("account.dashboard.addressLink")}
        />
        <DashboardCard
          Icon={Bell}
          title={t("account.dashboard.notificationsTitle")}
          empty={t("account.dashboard.notificationsEmpty")}
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
  empty: string;
  to: string;
  linkLabel: string;
};

/** One summary tile: icon, title, empty state and a link into its account area. */
function DashboardCard({ Icon, title, empty, to, linkLabel }: DashboardCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-pill bg-surface-2 text-accent">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <h2 className="font-heading text-lg text-fg">{title}</h2>
      </div>
      <p className="flex-1 text-sm text-fg-muted">{empty}</p>
      <Link to={to} className="text-sm text-accent hover:underline">
        {linkLabel}
      </Link>
    </article>
  );
}
