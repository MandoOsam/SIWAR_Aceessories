import { useTranslation } from "react-i18next";
import { ShieldCheck, Sparkles, Droplets, Heart } from "lucide-react";

import { useLocale } from "@/hooks/useLocale";
import { localize } from "@/utils/format";
import { storeSettings } from "@/data/content";

const icons = {
  rustResistant: Sparkles,
  tarnishResistant: ShieldCheck,
  skinFriendly: Heart,
  waterFriendly: Droplets,
} as const;

export function TrustStrip() {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const items = (["rustResistant", "tarnishResistant", "skinFriendly", "waterFriendly"] as const).map(
    (key) => {
      const Icon = icons[key];
      const label = t(`trust.${key}`);
      const badgeText = localize(storeSettings.trustBadges[key as keyof typeof storeSettings.trustBadges], locale);
      return {
        key,
        label,
        badgeText,
        Icon,
      };
    },
  );

  return (
    <section className="container-page py-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map(({ key, Icon, label, badgeText }) => (
          <div
            key={key}
            className="flex flex-col items-center gap-3 rounded-card bg-surface-2 p-4 text-center shadow-sm transition-transform duration-500 ease-smooth hover:scale-[1.02]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-fg">{label}</span>
              <span className="text-xs text-fg-muted">{badgeText}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustStrip;
