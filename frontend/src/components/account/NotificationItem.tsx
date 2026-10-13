import { Info, Package, Tag, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useLocale } from "@/hooks/useLocale";
import type { Notification, NotificationType } from "@/services/types";
import { cn } from "@/utils/cn";
import { formatDate, localize } from "@/utils/format";

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  order: Package,
  promo: Tag,
  system: Info,
};

export interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

/**
 * One notification row. Unread rows are a button that marks the notification read; read rows are
 * static. Kept as spans so the same markup is valid inside both a `<button>` and an `<article>`.
 */
export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const Icon = TYPE_ICONS[notification.type];

  const content = (
    <>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-pill bg-surface-2",
          notification.isRead ? "text-fg-muted" : "text-accent",
        )}
      >
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={cn("text-sm", notification.isRead ? "text-fg-muted" : "font-medium text-fg")}
          >
            {localize(notification.title, locale)}
          </span>
          {!notification.isRead ? (
            <span aria-hidden="true" className="size-2 shrink-0 rounded-pill bg-accent" />
          ) : null}
        </span>
        <span className="mt-1 block text-sm text-fg-muted">
          {localize(notification.body, locale)}
        </span>
        <span className="mt-1 block text-xs text-fg-muted">
          {formatDate(notification.createdAt, locale)}
        </span>
      </span>
    </>
  );

  const base = "flex w-full items-start gap-3 rounded-card border border-line p-4 text-start";

  if (notification.isRead) {
    return <article className={cn(base, "bg-surface")}>{content}</article>;
  }

  return (
    <button
      type="button"
      onClick={() => onMarkRead(notification.id)}
      aria-label={t("account.notifications.markRead")}
      className={cn(
        base,
        "bg-surface-2 transition-colors duration-500 ease-smooth hover:border-accent",
      )}
    >
      {content}
    </button>
  );
}

export default NotificationItem;
