import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { CartItem } from "@/components/CartItem";
import { CartSummary } from "@/components/CartSummary";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/config/app";
import { useEscapeKey, useLockBodyScroll } from "@/hooks/useBodyScrollLock";
import { useLocale } from "@/hooks/useLocale";
import { selectCartCount, useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";

const DRAWER_ID = "siwar-cart-drawer";
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Cart slide-over (05-ui-context.md §7.7), opened from the navbar cart icon.
 *
 * Slides in from the inline end (left in Arabic, right in English), traps focus, closes on the
 * backdrop or Escape, and is skipped to a simple fade under `prefers-reduced-motion`. Mounted once
 * in `RootLayout` so it can cover the navbar, like `SearchOverlay`.
 */
export function CartDrawer() {
  const { t } = useTranslation();
  const { isRtl } = useLocale();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion() === true;

  const isOpen = useUiStore((state) => state.overlay === "cart");
  const closeOverlay = useUiStore((state) => state.closeOverlay);

  const items = useCartStore((state) => state.items);
  const count = useCartStore(selectCartCount);
  const setQty = useCartStore((state) => state.setQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const saveForLater = useCartStore((state) => state.saveForLater);

  useLockBodyScroll(isOpen);
  useEscapeKey(isOpen, closeOverlay);

  // Move focus into the panel on open and return it to the trigger on close (D-024).
  useEffect(() => {
    if (isOpen) {
      const active = document.activeElement;
      if (active instanceof HTMLElement && !panelRef.current?.contains(active)) {
        restoreFocusRef.current = active;
      }
      closeButtonRef.current?.focus();
      return;
    }
    restoreFocusRef.current?.focus();
    restoreFocusRef.current = null;
  }, [isOpen]);

  // Trap Tab inside the panel while it is open.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Tab") {
        return;
      }
      const panel = panelRef.current;
      if (panel === null) {
        return;
      }
      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (first === undefined || last === undefined) {
        return;
      }
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const goShopping = (): void => {
    closeOverlay();
    navigate(ROUTES.shop);
  };

  const offscreen = isRtl ? "-101%" : "101%";

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={closeOverlay}
            aria-hidden="true"
            className="fixed inset-0 z-40 h-dvh bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            key="cart-panel"
            id={DRAWER_ID}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("cart.drawerLabel")}
            initial={shouldReduceMotion ? { opacity: 0 } : { x: offscreen }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: "0%" }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: offscreen }}
            transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 end-0 z-50 flex h-dvh w-full max-w-md flex-col border-s border-line bg-surface text-fg"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
              <h2 className="font-heading text-sm uppercase tracking-[0.24em] text-accent">
                {t("cart.title")}
                {count > 0 ? ` (${count})` : ""}
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeOverlay}
                aria-label={t("cart.closeLabel")}
                className="inline-flex size-11 items-center justify-center rounded-control text-fg-muted transition-colors duration-500 ease-smooth hover:text-fg"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            {count === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag aria-hidden="true" className="size-10 text-fg-muted" />
                <div>
                  <p className="font-heading text-lg text-fg">{t("cart.empty.title")}</p>
                  <p className="mt-1 text-sm text-fg-muted">{t("cart.empty.body")}</p>
                </div>
                <Button onClick={goShopping}>{t("cart.empty.action")}</Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto overscroll-contain px-4">
                  <ul>
                    {items.map((item) => (
                      <li key={item.key}>
                        <CartItem
                          item={item}
                          onQtyChange={setQty}
                          onRemove={removeItem}
                          onSaveForLater={saveForLater}
                        />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="shrink-0 border-t border-line p-4">
                  <CartSummary className="border-0 bg-transparent p-0" />
                </div>
              </>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export default CartDrawer;
