import { useEffect, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/utils/cn";
import { clampQuantity } from "@/utils/product";

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Quantity control (05-ui-context.md §7.5). Minus/input/plus in logical order, so it mirrors in
 * Arabic without extra classes. Manual typing is allowed and clamped on blur/Enter; the current
 * value is announced through a visually-hidden `aria-live` region.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled = false,
  className,
}: QuantityStepperProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(String(value));

  // Keep the field in sync when the parent changes the value (e.g. clamped by stock).
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const setClamped = (next: number): void => {
    const clamped = clampQuantity(next, min, max);
    onChange(clamped);
    setDraft(String(clamped));
  };

  const handleBlur = (): void => setClamped(Number(draft));

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      setClamped(Number(draft));
    }
  };

  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium text-fg">{t("product.quantity.label")}</span>

      <div
        className={cn(
          "inline-flex w-fit items-center rounded-control border border-line bg-surface",
          disabled && "opacity-50",
        )}
      >
        <button
          type="button"
          onClick={() => setClamped(value - 1)}
          disabled={disabled || atMin}
          aria-label={t("product.quantity.decrease")}
          className="inline-flex size-11 items-center justify-center rounded-control text-fg transition-colors duration-300 ease-smooth hover:text-accent disabled:cursor-not-allowed disabled:text-fg-muted"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>

        <input
          type="number"
          inputMode="numeric"
          value={draft}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-label={t("product.quantity.label")}
          className="w-14 border-x border-line bg-transparent py-2 text-center text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={() => setClamped(value + 1)}
          disabled={disabled || atMax}
          aria-label={t("product.quantity.increase")}
          className="inline-flex size-11 items-center justify-center rounded-control text-fg transition-colors duration-300 ease-smooth hover:text-accent disabled:cursor-not-allowed disabled:text-fg-muted"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <span aria-live="polite" className="sr-only">
        {t("product.quantity.value", { qty: value })}
      </span>
    </div>
  );
}

export default QuantityStepper;
