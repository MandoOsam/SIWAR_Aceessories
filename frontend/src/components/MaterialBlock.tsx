import { Droplets, Heart, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useLocale } from "@/hooks/useLocale";
import type { L10n } from "@/services/types";
import { cn } from "@/utils/cn";
import { localize } from "@/utils/format";

export interface MaterialBlockProps {
  /** Optional plating label from the product; hidden when absent (02-architecture.md §6). */
  plating?: L10n;
  className?: string;
}

/** Brand-level material facts, reused from the trust strip so the copy lives in one place. */
const MATERIAL_ITEMS: { key: string; Icon: LucideIcon }[] = [
  { key: "rustResistant", Icon: Sparkles },
  { key: "tarnishResistant", Icon: ShieldCheck },
  { key: "skinFriendly", Icon: Heart },
  { key: "waterFriendly", Icon: Droplets },
];

/**
 * Stainless-steel material block (05-ui-context.md §7.5). These are brand claims, not per-product
 * data, so the strings come from the `trust.*` namespace shared with the home trust strip.
 */
export function MaterialBlock({ plating, className }: MaterialBlockProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  return (
    <div className={cn("rounded-card border border-line bg-surface p-5", className)}>
      <h2 className="font-heading text-heading-sm text-fg">{t("product.material.title")}</h2>
      {plating !== undefined && (
        <p className="mt-1 text-sm text-fg-muted">
          {t("product.material.plating", { value: localize(plating, locale) })}
        </p>
      )}

      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MATERIAL_ITEMS.map(({ key, Icon }) => (
          <li key={key} className="flex items-center gap-3 text-sm text-fg-muted">
            <Icon className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <span>{t(`trust.${key}`)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MaterialBlock;
