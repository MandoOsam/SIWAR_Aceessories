import { useTranslation } from "react-i18next";

import type { OrderState } from "@/services/types";
import { cn } from "@/utils/cn";

type Tone = "progress" | "done" | "halt";

const DONE_STATUSES: readonly OrderState[] = ["delivered", "refunded"];
const HALT_STATUSES: readonly OrderState[] = ["cancelled", "returned"];

const TONE_CLASSES: Record<Tone, string> = {
  progress: "border-accent text-accent",
  done: "border-accent bg-accent text-on-accent",
  halt: "border-accent-2 text-accent-2",
};

export interface StatusBadgeProps {
  status: OrderState;
  className?: string;
}

/**
 * Coloured pill for an order status (`05-ui-context.md` §7.12).
 *
 * Labels come from the shared `order.status.*` keys so the badge matches the timeline. Colour is
 * semantic rather than per-status: settled states read gold, stopped states read rose, everything
 * else is outlined in gold.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation();
  const tone: Tone = DONE_STATUSES.includes(status)
    ? "done"
    : HALT_STATUSES.includes(status)
      ? "halt"
      : "progress";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border px-3 py-1 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {t(`order.status.${status}`)}
    </span>
  );
}

export default StatusBadge;
