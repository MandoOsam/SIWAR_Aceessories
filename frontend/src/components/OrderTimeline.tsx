import { useTranslation } from "react-i18next";
import { Check, RefreshCw, RotateCcw, XCircle } from "lucide-react";

import { ORDER_STATUSES, ORDER_TERMINAL_STATUSES } from "@/services/types";
import type { OrderState, OrderTerminalStatus } from "@/services/types";
import { cn } from "@/utils/cn";

const TERMINAL_ICONS: Record<OrderTerminalStatus, typeof XCircle> = {
  cancelled: XCircle,
  returned: RotateCcw,
  refunded: RefreshCw,
};

const MARKER_BASE =
  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-pill border";

export interface OrderTimelineProps {
  status: OrderState;
  className?: string;
}

/**
 * Vertical fulfilment timeline (`05-ui-context.md` §7.9).
 *
 * Linear orders highlight the current status; past statuses get a checkmark and future ones stay
 * muted. Terminal orders (cancelled / returned / refunded) render as a distinct banner because the
 * mock order carries no status history, with the linear steps shown greyed out underneath. Uses a
 * semantic ordered list and logical (`start-`) spacing so it reads correctly in RTL.
 */
export function OrderTimeline({ status, className }: OrderTimelineProps) {
  const { t } = useTranslation();
  const isTerminal = (ORDER_TERMINAL_STATUSES as readonly string[]).includes(status);
  const currentIndex = isTerminal
    ? -1
    : ORDER_STATUSES.indexOf(status as (typeof ORDER_STATUSES)[number]);
  const TerminalIcon = isTerminal ? TERMINAL_ICONS[status as OrderTerminalStatus] : null;

  return (
    <div className={className}>
      {TerminalIcon !== null ? (
        <div
          role="status"
          className="mb-5 flex items-center gap-3 rounded-card border border-accent-2 bg-surface-2 p-3 text-accent-2"
        >
          <TerminalIcon aria-hidden="true" className="size-5 shrink-0" />
          <span className="font-medium">{t(`order.status.${status}`)}</span>
        </div>
      ) : null}

      <ol aria-label={t("order.timeline.label")}>
        {ORDER_STATUSES.map((step, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = !isPast && !isCurrent;
          const isLast = index === ORDER_STATUSES.length - 1;

          return (
            <li
              key={step}
              aria-current={isCurrent ? "step" : undefined}
              className="relative flex items-start gap-4 pb-6 last:pb-0"
            >
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute start-4 top-8 bottom-0 w-px",
                    isPast ? "bg-accent" : "bg-line",
                  )}
                />
              ) : null}
              <span
                className={cn(
                  MARKER_BASE,
                  isPast
                    ? "border-accent bg-accent text-on-accent"
                    : isCurrent
                      ? "border-accent bg-surface text-accent"
                      : "border-line bg-surface text-fg-muted",
                )}
              >
                {isPast ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : (
                  <span className={cn("size-2 rounded-pill", isCurrent ? "bg-accent" : "bg-fg-muted")} />
                )}
              </span>
              <span
                className={cn("pt-1.5 text-sm", isFuture ? "text-fg-muted" : "text-fg", isCurrent && "font-medium")}
              >
                {t(`order.status.${step}`)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default OrderTimeline;
