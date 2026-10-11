import { CheckCircle, X, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useToastStore } from "@/store/toastStore";
import { cn } from "@/utils/cn";

/**
 * Renders the toast queue (05-ui-context.md §8). Mounted once, near the app root, so any component
 * can raise a message through `@/store/toastStore`.
 *
 * The `aria-live` region is always present in the DOM (even when empty): assistive tech only
 * announces changes made to a live region that already exists.
 */
export function ToastViewport() {
  const { t } = useTranslation();
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div
      role="region"
      aria-label={t("toast.regionLabel")}
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
    >
      <div aria-live="polite" aria-atomic="false" className="flex flex-col items-center gap-2">
        {toasts.map((toast) => {
          const Icon = toast.tone === "error" ? XCircle : CheckCircle;
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                "pointer-events-auto flex items-center gap-2 rounded-control border bg-surface px-4 py-3 text-sm text-fg",
                toast.tone === "error" ? "border-accent-2" : "border-accent",
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label={t("common.close")}
                className="ms-2 text-fg-muted transition-colors duration-300 ease-smooth hover:text-fg"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ToastViewport;
