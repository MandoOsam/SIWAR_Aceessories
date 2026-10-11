import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import { useLocale } from "@/hooks/useLocale";
import type { ProductColor } from "@/services/types";
import { cn } from "@/utils/cn";

export interface VariantSelectorProps {
  colors: ProductColor[];
  selectedColor: ProductColor | undefined;
  onColorChange: (color: ProductColor) => void;
  /** Present only for rings (02-architecture.md §6); the size group is hidden otherwise. */
  sizes?: string[];
  selectedSize: string | undefined;
  onSizeChange: (size: string) => void;
  /** Aggregate stock status: with no per-variant stock, all options disable together. */
  disabled?: boolean;
  className?: string;
}

/**
 * Swatch tokens reused from the design system — no raw hex (03-code-standards.md §4).
 * `black` uses `wine`, the darkest token, so it stays legible in both themes.
 */
const SWATCH_CLASSES: Record<ProductColor, string> = {
  gold: "bg-accent",
  silver: "bg-silver",
  "rose-gold": "bg-accent-2",
  black: "bg-wine",
};

const ARROW_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);

/**
 * Roving-focus keyboard nav for a radiogroup: arrows move to the next enabled option and select it.
 * Direction is mirrored in RTL so the physical arrow key matches what the customer sees.
 */
function moveSelection(event: ReactKeyboardEvent<HTMLDivElement>, isRtl: boolean): void {
  if (!ARROW_KEYS.has(event.key)) return;

  const options = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])'),
  );
  if (options.length === 0) return;

  event.preventDefault();
  const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);
  const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
  const step = (isRtl ? !forward : forward) ? 1 : -1;
  const nextIndex =
    currentIndex === -1 ? 0 : (currentIndex + step + options.length) % options.length;

  const next = options[nextIndex];
  next?.focus();
  next?.click();
}

/**
 * Color and size selection (05-ui-context.md §7.5). Controlled from the parent (ProductPage), so
 * the chosen variant is the single source of truth for Add to Cart and the sticky bar (D-030).
 */
export function VariantSelector({
  colors,
  selectedColor,
  onColorChange,
  sizes,
  selectedSize,
  onSizeChange,
  disabled = false,
  className,
}: VariantSelectorProps) {
  const { t } = useTranslation();
  const { isRtl } = useLocale();
  const sizeOptions = sizes ?? [];
  const showSizes = sizeOptions.length > 0;
  const showColors = colors.length > 0;

  return (
    <div className={cn("space-y-6", className)}>
      {showColors && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-fg">{t("shop.filters.section.color")}</span>
          <div
            role="radiogroup"
            aria-label={t("shop.filters.section.color")}
            onKeyDown={(event) => moveSelection(event, isRtl)}
            className="flex flex-wrap items-center gap-3"
          >
            {colors.map((color, index) => {
              const isSelected = color === selectedColor;
              const isFocusable = isSelected || (selectedColor === undefined && index === 0);
              return (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={t(`shop.colors.${color}`)}
                  tabIndex={isFocusable ? 0 : -1}
                  disabled={disabled}
                  onClick={() => onColorChange(color)}
                  className={cn(
                    "inline-flex size-11 items-center justify-center rounded-full border transition-all duration-300 ease-smooth",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                    isSelected ? "border-accent ring-2 ring-accent ring-offset-2 ring-offset-bg" : "border-line hover:border-fg-muted",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  <span
                    className={cn("size-7 rounded-full border border-line", SWATCH_CLASSES[color])}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showSizes && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-fg">{t("shop.filters.section.size")}</span>
          <div
            role="radiogroup"
            aria-label={t("shop.filters.section.size")}
            onKeyDown={(event) => moveSelection(event, isRtl)}
            className="flex flex-wrap items-center gap-2"
          >
            {sizeOptions.map((size, index) => {
              const isSelected = size === selectedSize;
              const isFocusable = isSelected || (selectedSize === undefined && index === 0);
              return (
                <button
                  key={size}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={size}
                  tabIndex={isFocusable ? 0 : -1}
                  disabled={disabled}
                  onClick={() => onSizeChange(size)}
                  className={cn(
                    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border px-3 text-sm transition-colors duration-300 ease-smooth",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                    isSelected ? "border-accent text-accent" : "border-line text-fg hover:border-fg-muted",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default VariantSelector;
