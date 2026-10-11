/**
 * Minimal toast queue.
 *
 * A store rather than component state because the trigger (an Add-to-Cart button deep in the page)
 * and the renderer (`ToastViewport`, mounted once) are unrelated components. Kept deliberately
 * small: one queue, one auto-dismiss timer per message, no variants library.
 */

import { create } from "zustand";

export type ToastTone = "success" | "error";

export type ToastMessage = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastState = {
  toasts: ToastMessage[];
  push: (message: string, tone?: ToastTone) => string;
  dismiss: (id: string) => void;
};

const AUTO_DISMISS_MS = 3000;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  push: (message, tone = "success") => {
    const id = `toast-${String(Date.now())}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }));

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
    }, AUTO_DISMISS_MS);

    return id;
  },

  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

/** Imperative helper for event handlers: `toast(t("product.toast.added"))`. */
export function toast(message: string, tone: ToastTone = "success"): void {
  useToastStore.getState().push(message, tone);
}
