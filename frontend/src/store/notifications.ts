/**
 * Notifications client state.
 *
 * Seeded from `src/data/notifications.ts` and persisted to `localStorage` so read/unread survives a
 * refresh until the real API exists (`GET /account/notifications`). The store is the display source
 * for `/account/notifications`; unread count feeds any badge.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/config/app";
import { seedNotifications } from "@/data/notifications";
import type { Notification } from "@/services/types";

type NotificationsState = {
  items: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
};

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      items: seedNotifications,

      markRead: (id) =>
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
        })),

      markAllRead: () =>
        set((state) => ({ items: state.items.map((item) => ({ ...item, isRead: true })) })),
    }),
    { name: STORAGE_KEYS.notifications },
  ),
);

/** Number of unread notifications. */
export function selectUnreadCount(state: NotificationsState): number {
  return state.items.reduce((count, item) => (item.isRead ? count : count + 1), 0);
}
