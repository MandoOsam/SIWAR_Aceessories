import { useTranslation } from "react-i18next";
import { ShieldCheck, Sparkles, Droplets, Heart } from "lucide-react";

/**
 * Stainless-steel benefit strip (05-ui-context.md §7.2 item 2).
 *
 * The four labels are product benefits owned by i18n (`trust.*`), not the service promises in
 * `storeSettings.trustBadges` (those are section 12's Shipping/Payment/Returns/Support badges).
 * Reading the wrong key set here used to pass `undefined` to `localize()` and crash the page.
 */
const TRUST_KEYS = ["rustResistant", "tarnishResistant", "skinFriendly", "waterFriendly"] as const;

const icons = {
  rustResistant: Sparkles,
  tarnishResistant: ShieldCheck,
  skinFriendly: Heart,
  waterFriendly: Droplets,
} as const;

export function TrustStrip() {
  const { t } = useTranslation();

  return (
    <section className="container-page py-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {TRUST_KEYS.map((key) => {
          const Icon = icons[key];
          return (
            <div
              key={key}
              className="flex flex-col items-center gap-3 rounded-card bg-surface-2 p-4 text-center shadow-sm transition-transform duration-500 ease-smooth hover:scale-[1.02]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-fg">{t(`trust.${key}`)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TrustStrip;
