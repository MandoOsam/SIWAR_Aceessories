import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";

export interface ProductGridErrorProps {
  onRetry?: () => void;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Error state for the product grid (03-code-standards.md §6: handle service failures explicitly).
 *
 * `role="alert"` so screen readers announce the failure; the retry button refetches via the caller.
 */
export function ProductGridError({
  onRetry,
  title,
  description,
  className,
}: ProductGridErrorProps) {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-4 py-16 text-center",
        className,
      )}
    >
      <AlertTriangle aria-hidden="true" className="size-8 text-accent-2" />
      <h2 className="font-heading text-heading-sm text-fg">{title ?? t("shop.error.title")}</h2>
      <p className="max-w-md text-sm text-fg-muted">
        {description ?? t("shop.error.description")}
      </p>
      {onRetry === undefined ? null : (
        <Button variant="secondary" onClick={onRetry} className="mt-2">
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
}

export default ProductGridError;
