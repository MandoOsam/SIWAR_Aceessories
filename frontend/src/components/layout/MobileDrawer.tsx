import { useEffect, useRef } from "react";
import { Heart, Search, User, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { CategoryMenu } from "@/components/layout/CategoryMenu";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { IconButton, IconLink } from "@/components/ui/IconButton";
import { PRIMARY_NAV } from "@/config/navigation";
import { ROUTES } from "@/config/app";
import { useEscapeKey, useLockBodyScroll } from "@/hooks/useBodyScrollLock";
import { useUiStore } from "@/store/uiStore";

/**
 * Slide-in navigation for small screens.
 *
 * Mounted inside the navbar so it inherits the header stacking context. Slides in from the inline
 * start, which is the right-hand side in Arabic and the left-hand side in English.
 *
 * The panel is only mounted while it is open. Keeping it mounted but translated off-screen would
 * leave its links and buttons focusable and exposed to screen readers while invisible, so the
 * entrance is a mount animation instead of a two-state transition.
 */
export function MobileDrawer() {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);

  const isOpen = useUiStore((state) => state.overlay === "menu");
  const closeOverlay = useUiStore((state) => state.closeOverlay);
  const openOverlay = useUiStore((state) => state.openOverlay);

  useLockBodyScroll(isOpen);
  useEscapeKey(isOpen, closeOverlay);

  // Move focus into the drawer so keyboard and screen-reader users land in the right place.
  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={closeOverlay}
        className="fixed inset-0 z-40 h-dvh w-full animate-fade-in cursor-default bg-black/60 backdrop-blur-sm lg:hidden"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.menu")}
        tabIndex={-1}
        className="fixed inset-y-0 start-0 z-50 flex h-dvh w-[86%] max-w-sm animate-drawer-in flex-col border-e border-line bg-surface text-fg lg:hidden"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
          <span className="font-heading text-sm uppercase tracking-[0.24em] text-accent">
            {t("nav.menu")}
          </span>
          <IconButton
            label={t("nav.closeMenu")}
            onClick={closeOverlay}
            icon={<X aria-hidden="true" className="size-5" />}
          />
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-6">
          <IconButton
            label={t("nav.openSearch")}
            onClick={() => openOverlay("search")}
            className="mb-6 w-full justify-start gap-3 border border-line px-4 text-fg-muted"
            icon={
              <>
                <Search aria-hidden="true" className="size-5 shrink-0" />
                <span className="text-sm normal-case tracking-normal">
                  {t("nav.searchPlaceholder")}
                </span>
              </>
            }
          />

          <nav aria-label={t("nav.menu")} className="mb-8">
            <ul className="space-y-1">
              {PRIMARY_NAV.map((item) => (
                <li key={item.labelKey}>
                  <Link
                    to={item.href}
                    onClick={closeOverlay}
                    className="flex min-h-11 min-w-11 items-center text-sm uppercase tracking-[0.14em] transition-colors duration-500 ease-smooth hover:text-accent"
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="mb-2 font-heading text-xs uppercase tracking-[0.24em] text-fg-muted">
            {t("categories.title")}
          </p>
          <nav aria-label={t("categories.title")}>
            <CategoryMenu variant="list" />
          </nav>
        </div>

        <div className="shrink-0 border-t border-line px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <IconLink
                to={ROUTES.wishlist}
                label={t("nav.wishlist")}
                icon={<Heart aria-hidden="true" className="size-5" />}
              />
              <IconLink
                to={ROUTES.account}
                label={t("nav.account")}
                icon={<User aria-hidden="true" className="size-5" />}
              />
            </div>
            <div className="flex items-center gap-1">
              <LanguageSwitch />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
