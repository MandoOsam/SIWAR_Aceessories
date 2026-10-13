import { useTranslation } from "react-i18next";
import { Bell, CheckCheck } from "lucide-react";

import { AccountEmpty } from "@/components/account/AccountEmpty";
import { NotificationItem } from "@/components/account/NotificationItem";
import { Button } from "@/components/ui/Button";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { selectUnreadCount, useNotificationsStore } from "@/store/notifications";

/**
 * `/account/notifications` — the customer's notifications (`05-ui-context.md` §7.12).
 *
 * Renders from the persisted notifications store (seeded from `src/data/notifications.ts` until the
 * backend exists). Unread rows mark themselves read on activation; the header can mark all read.
 */
export default function NotificationsPage() {
  const { t } = useTranslation();
  const items = useNotificationsStore((state) => state.items);
  const markRead = useNotificationsStore((state) => state.markRead);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);
  const unread = useNotificationsStore(selectUnreadCount);

  useDocumentMeta(t("account.meta.notificationsTitle"), t("account.notifications.subtitle"));

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-heading text-heading text-fg">{t("account.notifications.title")}</h1>
          <p className="text-fg-muted">{t("account.notifications.subtitle")}</p>
        </div>
        {items.length > 0 ? (
          <Button variant="secondary" size="sm" onClick={markAllRead} disabled={unread === 0}>
            <CheckCheck aria-hidden="true" className="size-4" />
            {t("account.notifications.markAll")}
          </Button>
        ) : null}
      </header>

      <p aria-live="polite" className="sr-only">
        {t("account.notifications.unreadCount", { count: unread })}
      </p>

      {items.length === 0 ? (
        <AccountEmpty
          Icon={Bell}
          title={t("account.notifications.emptyTitle")}
          description={t("account.notifications.emptyBody")}
        />
      ) : (
        <ul className="space-y-3">
          {items.map((notification) => (
            <li key={notification.id}>
              <NotificationItem notification={notification} onMarkRead={markRead} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
