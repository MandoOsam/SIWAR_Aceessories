import { Bell, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { CategoryMenu } from "@/components/layout/CategoryMenu";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { IconButton, IconLink } from "@/components/ui/IconButton";
import { PRIMARY_NAV } from "@/config/navigation";
import { ROUTES } from "@/config/app";
import { useAuthStore } from "@/store/auth";
import { useCartStore, selectCartCount } from "@/store/cartStore";
import { selectUnreadCount, useNotificationsStore } from "@/store/notifications";
import { useUiStore } from "@/store/uiStore";
import { useScrollTracking } from "@/hooks/useScrollTracking";
import { cn } from "@/utils/cn";

/**
 * Global navbar.
 *
 * Three behaviours from 05-ui-context.md section 7.1:
 *   1. transparent over the hero, blurred glass once scrolled;
 *   2. hides on scroll down, reappears on scroll up;
 *   3. logo centred on desktop, at the inline start on mobile.
 *
 * Direction-aware classes only (`start-`, `end-`, `ms-`, `pe-`, `text-start`), so RTL and LTR
 * mirror themselves without a second stylesheet.
 */
export function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();

  useScrollTracking();

  const isScrolled = useUiStore((state) => state.isScrolled);
  const scrollDirection = useUiStore((state) => state.scrollDirection);
  const overlay = useUiStore((state) => state.overlay);
  const openOverlay = useUiStore((state) => state.openOverlay);

  const cartCount = useCartStore(selectCartCount);
  const unreadCount = useNotificationsStore(selectUnreadCount);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isHomeRoute = location.pathname === ROUTES.home;
  const isTransparent = isHomeRoute && !isScrolled && overlay === null;
  const isHidden = isScrolled && scrollDirection === "down" && overlay === null;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ease-smooth",
        isTransparent
          ? "border-transparent bg-transparent text-on-hero"
          : "border-line bg-glass text-fg backdrop-blur-md",
        isHidden && "-translate-y-full",
      )}
    >
      <nav
        aria-label={t("nav.menu")}
        className="container-page flex h-16 items-center gap-2 lg:h-20 lg:gap-6"
      >
        {/* Inline start: menu on mobile, categories and links on desktop. */}
        <div className="flex flex-1 items-center gap-1 lg:gap-6">
          <div className="lg:hidden">
            <IconButton
              label={t("nav.openMenu")}
              onClick={() => openOverlay("menu")}
              icon={<Menu aria-hidden="true" className="size-5" />}
            />
          </div>
          <div className="hidden lg:block">
            <CategoryMenu variant="dropdown" />
          </div>
          <ul className="hidden items-center gap-6 lg:flex">
            {PRIMARY_NAV.map((item) => (
              <li key={item.labelKey}>
                <Link
                  to={item.href}
                  className="inline-flex min-h-11 min-w-11 items-center text-sm uppercase tracking-[0.14em] transition-colors duration-500 ease-smooth hover:text-accent"
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Centre: the wordmark. */}
        <div className="flex shrink-0 justify-center lg:flex-1">
          <Logo />
        </div>

        {/* Inline end: utilities. */}
        <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1">
          <div className="hidden sm:block">
            <IconButton
              label={t("nav.openSearch")}
              onClick={() => openOverlay("search")}
              icon={<Search aria-hidden="true" className="size-5" />}
            />
          </div>
          <IconLink
            to={ROUTES.wishlist}
            label={t("nav.wishlist")}
            icon={<Heart aria-hidden="true" className="size-5" />}
            className="hidden sm:inline-flex"
          />
          {isAuthenticated ? (
            <div className="relative hidden sm:block">
              <IconLink
                to={ROUTES.accountNotifications}
                label={t("nav.notifications")}
                icon={<Bell aria-hidden="true" className="size-5" />}
              />
              <CountBadge count={unreadCount} label={t("nav.notifications")} />
            </div>
          ) : null}
          <div className="relative">
            <IconButton
              label={t("nav.cart")}
              onClick={() => openOverlay("cart")}
              icon={<ShoppingBag aria-hidden="true" className="size-5" />}
            />
            <CountBadge count={cartCount} label={t("nav.cart")} />
          </div>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <div className="hidden sm:block">
            <LanguageSwitch />
          </div>
          <IconLink
            to={isAuthenticated ? ROUTES.account : ROUTES.login}
            label={isAuthenticated ? t("nav.account") : t("nav.login")}
            icon={<User aria-hidden="true" className="size-5" />}
            className="hidden md:inline-flex"
          />
        </div>
      </nav>

      <MobileDrawer />
    </header>
  );
}

/**
 * Counter badge shared by the cart and notifications links.
 *
 * Sits beside the link and uses `aria-live` so screen readers hear the new count after every change
 * without stealing focus.
 */
function CountBadge({ count, label }: { count: number; label: string }) {
  if (count <= 0) {
    return null;
  }
  return (
    <span
      aria-live="polite"
      className="pointer-events-none absolute -end-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-pill bg-accent-2 px-1 text-[10px] font-semibold leading-4 text-white"
    >
      <span className="sr-only">{`${label}: ${count}`}</span>
      <span aria-hidden="true">{count}</span>
    </span>
  );
}
