import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { useLockBodyScroll } from "@/hooks/useBodyScrollLock";
import { useProductFilters } from "@/hooks/useProductFilters";
import FilterPanel, { type FilterPanelProps } from "./FilterPanel";

const SHEET_ID = "siwar-filter-sheet";

/**
 * Mobile filters bottom sheet (05-ui-context.md §7.3): a trigger with the active-filter count, and
 * a sheet that reuses `FilterPanel` so the mobile and desktop filters share one implementation.
 *
 * Filters apply live (they are plain URL changes); "Apply" only closes the sheet and "Clear"
 * resets every filter. Closes via drag-down, backdrop tap and Escape. Hidden above `lg`.
 */
export function FilterSheet({ category, showCategory }: FilterPanelProps) {
  const { t } = useTranslation();
  const { filters, clearFilters } = useProductFilters();
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const controls = useDragControls();
  const shouldReduceMotion = useReducedMotion() === true;

  useLockBodyScroll(isOpen);

  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  // Move focus into the sheet so keyboard and screen-reader users land in the right place.
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  const activeCount =
    (filters.category !== undefined ? 1 : 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
    (filters.rating !== undefined ? 1 : 0) +
    (filters.inStock === true ? 1 : 0) +
    (filters.color !== undefined ? 1 : 0) +
    (filters.size !== undefined ? 1 : 0) +
    (filters.discount === true ? 1 : 0) +
    (filters.isNew === true ? 1 : 0);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={open}
        aria-expanded={isOpen}
        aria-controls={SHEET_ID}
        aria-label={
          activeCount > 0
            ? t("shop.filters.openCount", { count: activeCount })
            : t("shop.filters.open")
        }
        className="lg:hidden"
      >
        <SlidersHorizontal aria-hidden="true" className="size-4" />
        <span className="normal-case">{t("shop.filters.open")}</span>
        {activeCount > 0 ? (
          <span
            aria-hidden="true"
            className="inline-flex size-5 items-center justify-center rounded-pill bg-accent text-xs text-on-accent"
          >
            {activeCount}
          </span>
        ) : null}
      </Button>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div
              key="filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={close}
              aria-hidden="true"
              className="fixed inset-0 z-40 h-dvh bg-black/60 backdrop-blur-sm lg:hidden"
            />

            <motion.div
              key="filter-sheet"
              id={SHEET_ID}
              role="dialog"
              aria-modal="true"
              aria-label={t("shop.filters.title")}
              drag={shouldReduceMotion ? false : "y"}
              dragControls={controls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120) {
                  close();
                }
              }}
              initial={shouldReduceMotion ? { opacity: 0 } : { y: "100%" }}
              animate={shouldReduceMotion ? { opacity: 1 } : { y: "0%" }}
              exit={shouldReduceMotion ? { opacity: 0 } : { y: "100%" }}
              transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col",
                "rounded-t-card border-t border-line bg-surface text-fg lg:hidden",
              )}
            >
              <div
                aria-hidden="true"
                onPointerDown={(event) => controls.start(event)}
                className="flex shrink-0 cursor-grab touch-none justify-center pt-3 active:cursor-grabbing"
              >
                <span className="h-1 w-10 rounded-pill bg-fg-muted opacity-60" />
              </div>

              <div className="flex shrink-0 items-center justify-between border-b border-line py-2 ps-4 pe-2">
                <h2 className="font-heading text-sm uppercase tracking-[0.24em] text-accent">
                  {t("shop.filters.title")}
                </h2>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={close}
                  aria-label={t("shop.filters.close")}
                  className="inline-flex size-11 items-center justify-center rounded-control text-fg-muted transition-colors duration-500 ease-smooth hover:text-fg"
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                <FilterPanel category={category} showCategory={showCategory} />
              </div>

              <div className="shrink-0 border-t border-line px-4 py-3">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={clearFilters}
                    className="flex-1"
                  >
                    {t("shop.filters.clearAll")}
                  </Button>
                  <Button type="button" variant="primary" onClick={close} className="flex-1">
                    {t("shop.filters.apply")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default FilterSheet;