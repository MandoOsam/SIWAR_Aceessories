import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Heart,
  LayoutDashboard,
  Lock,
  LogOut,
  MapPin,
  Package,
  User,
  type LucideIcon,
} from "lucide-react";

import { ToastViewport } from "@/components/ui/Toast";
import { ROUTES } from "@/config/app";
import { logout } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/initials";

type NavItem = { to: string; labelKey: string; Icon: LucideIcon; end?: boolean };

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.account, labelKey: "account.nav.dashboard", Icon: LayoutDashboard, end: true },
  { to: ROUTES.accountOrders, labelKey: "account.nav.orders", Icon: Package },
  { to: ROUTES.accountWishlist, labelKey: "account.nav.wishlist", Icon: Heart },
  { to: ROUTES.accountAddresses, labelKey: "account.nav.addresses", Icon: MapPin },
  { to: ROUTES.accountNotifications, labelKey: "account.nav.notifications", Icon: Bell },
  { to: ROUTES.accountProfile, labelKey: "account.nav.profile", Icon: User },
  { to: ROUTES.accountPassword, labelKey: "account.nav.password", Icon: Lock },
];

/**
 * Shared shell for the account area (`/account/*`).
 *
 * The customer is read from `useAuthStore`, never passed down as a prop, and every child route
 * renders through the `<Outlet/>`. Navigation is a sidebar on desktop and collapses into a toggle
 * on mobile. The logout control is an **action** (clears the server session, then the store, then
 * returns to `/login`), not a link. Renders a `<section>` because `RootLayout` owns the `<main>`
 * (D-023). `ToastViewport` is mounted here so profile/password toasts are visible.
 */
export function AccountLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);

  const initials = getInitials(user?.name ?? "");

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // The local session is cleared regardless; the server cookie expires on its own.
    } finally {
      clearUser();
      navigate(ROUTES.login, { replace: true });
    }
  };

  return (
    <section className="container-page py-10 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-12">
        <aside>
          <div className="hidden items-center gap-3 lg:flex">
            <AccountAvatar initials={initials} name={user?.name ?? ""} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-fg">{user?.name}</p>
              <p className="truncate text-xs text-fg-muted" dir="ltr">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="account-nav"
            className="flex w-full items-center justify-between rounded-control border border-line bg-surface px-4 py-3 text-sm lg:hidden"
          >
            <span className="flex items-center gap-3">
              <AccountAvatar initials={initials} name={user?.name ?? ""} />
              <span className="font-medium text-fg">{t("account.nav.menu")}</span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={cn("size-4 transition-transform duration-300", menuOpen && "rotate-180")}
            />
          </button>

          <nav
            id="account-nav"
            aria-label={t("account.nav.menu")}
            className={cn("mt-3 flex-col gap-1 lg:mt-6 lg:flex", menuOpen ? "flex" : "hidden")}
          >
            {NAV_ITEMS.map(({ to, labelKey, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-11 items-center gap-3 rounded-control px-3 text-sm transition-colors duration-500 ease-smooth",
                    isActive ? "bg-surface-2 text-accent" : "text-fg-muted hover:text-accent",
                  )
                }
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {t(labelKey)}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex min-h-11 items-center gap-3 rounded-control px-3 text-start text-sm text-fg-muted transition-colors duration-500 ease-smooth hover:text-accent-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut aria-hidden="true" className="size-4 shrink-0" />
              {loggingOut ? t("account.nav.loggingOut") : t("account.nav.logout")}
            </button>
          </nav>
        </aside>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>

      <ToastViewport />
    </section>
  );
}

/** Circular initials placeholder shown until avatar uploads exist (F6.4+). */
function AccountAvatar({ initials, name }: { initials: string; name: string }) {
  return (
    <span
      aria-hidden="true"
      title={name}
      className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-surface-2 text-sm font-medium text-accent"
    >
      {initials}
    </span>
  );
}

export default AccountLayout;
