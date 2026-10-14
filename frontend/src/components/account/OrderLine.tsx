import { useLocale } from "@/hooks/useLocale";
import type { OrderItem } from "@/services/types";
import { formatPrice, localize } from "@/utils/format";

/** One ordered line: thumbnail, name, variant, quantity and line total. */
export function OrderLine({ item }: { item: OrderItem }) {
  const { locale } = useLocale();
  const variant = [item.variant?.color, item.variant?.size].filter(Boolean).join(" · ");

  return (
    <li className="flex items-center gap-4 p-4">
      <span className="size-14 shrink-0 overflow-hidden rounded-card bg-surface-2">
        {item.imageUrl !== undefined && item.imageUrl !== "" ? (
          <img src={item.imageUrl} alt="" className="size-full object-cover" />
        ) : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">{localize(item.name, locale)}</p>
        {variant !== "" ? <p className="text-xs text-fg-muted">{variant}</p> : null}
        <p className="text-xs text-fg-muted">{`×${item.qty}`}</p>
      </div>
      <span className="text-sm text-fg">{formatPrice(item.lineTotal, locale)}</span>
    </li>
  );
}

export default OrderLine;
