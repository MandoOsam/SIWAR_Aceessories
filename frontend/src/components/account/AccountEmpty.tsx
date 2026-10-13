import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/utils/cn";

export interface AccountEmptyProps {
  Icon: LucideIcon;
  title: string;
  description?: string;
  /** Optional call to action, e.g. a `ButtonLink` back to the shop. */
  action?: ReactNode;
  className?: string;
}

/** Shared empty state for the account lists (orders, wishlist, addresses, notifications). */
export function AccountEmpty({ Icon, title, description, action, className }: AccountEmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-card border border-line bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-pill bg-surface-2 text-accent">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <h2 className="font-heading text-lg text-fg">{title}</h2>
      {description !== undefined ? (
        <p className="max-w-sm text-sm text-fg-muted">{description}</p>
      ) : null}
      {action !== undefined ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export default AccountEmpty;
