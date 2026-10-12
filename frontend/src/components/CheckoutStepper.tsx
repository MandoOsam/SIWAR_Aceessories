import { Check } from "lucide-react";

import { cn } from "@/utils/cn";

export type CheckoutStep = {
  id: string;
  label: string;
};

export interface CheckoutStepperProps {
  steps: CheckoutStep[];
  /** Zero-based index of the step being edited. */
  current: number;
  /** Accessible label for the `<nav>` landmark. */
  label: string;
  /** Jump back to an already-completed step; forward steps are inert. */
  onSelect: (index: number) => void;
  className?: string;
}

const CIRCLE_BASE =
  "flex size-8 shrink-0 items-center justify-center rounded-pill border text-sm font-medium transition-colors duration-500 ease-smooth";

/**
 * Checkout progress indicator (05-ui-context.md §7.8).
 *
 * A logical-order flex row keeps it correct in RTL. Completed steps are real buttons so keyboard
 * users can step back without scrolling; future steps are inert.
 */
export function CheckoutStepper({ steps, current, label, onSelect, className }: CheckoutStepperProps) {
  return (
    <nav aria-label={label} className={className}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isComplete = index < current;
          const isCurrent = index === current;
          const marker = isComplete ? (
            <Check aria-hidden="true" className="size-4" />
          ) : (
            <span>{index + 1}</span>
          );

          return (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              {isComplete ? (
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  className="group flex items-center gap-2 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span className={cn(CIRCLE_BASE, "border-accent bg-accent text-on-accent")}>
                    {marker}
                  </span>
                  <span className="hidden text-sm text-fg-muted transition-colors duration-500 ease-smooth group-hover:text-accent sm:inline">
                    {step.label}
                  </span>
                </button>
              ) : (
                <div
                  aria-current={isCurrent ? "step" : undefined}
                  className="flex items-center gap-2"
                >
                  <span
                    className={cn(
                      CIRCLE_BASE,
                      isCurrent ? "border-accent text-accent" : "border-line text-fg-muted",
                    )}
                  >
                    {marker}
                  </span>
                  <span
                    className={cn(
                      "hidden text-sm sm:inline",
                      isCurrent ? "text-fg" : "text-fg-muted",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              )}
              {index < steps.length - 1 ? (
                <span aria-hidden="true" className="h-px flex-1 bg-line" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default CheckoutStepper;
