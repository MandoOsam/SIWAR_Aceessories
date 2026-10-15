import { useTranslation } from "react-i18next";

import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { usePublicSettings } from "@/hooks/useCatalog";
import { isPlaceholder } from "@/utils/format";

/**
 * Floating WhatsApp call-to-action (08-owner-ui-revisions.md §R3.b), mounted on the Home and
 * Contact pages only.
 *
 * The link comes from `GET /settings/public` (`contact.whatsapp`) — never hard-coded — and the
 * button hides itself while that value is a `TODO(Mando)` placeholder. The green is the fixed
 * WhatsApp brand colour (`--brand-whatsapp`); the pulse ring and bounce are one-off/subtle and are
 * removed entirely under `prefers-reduced-motion` (05-ui-context.md §5.4). `end-5` keeps it in the
 * inline-end corner in both directions, and `z-30` keeps it below the drawers/overlays (z-40/50).
 */
export function WhatsAppFab() {
  const { t } = useTranslation();
  const { data: settings } = usePublicSettings();

  const href = settings?.contact.whatsapp;
  if (href === undefined || isPlaceholder(href)) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("footer.whatsappCta")}
      className="fixed bottom-5 end-5 z-30 inline-flex size-14 items-center justify-center rounded-pill bg-whatsapp text-white shadow-lg shadow-black/20 transition-transform duration-500 ease-smooth hover:scale-105 motion-safe:animate-wa-bounce"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-pill bg-whatsapp motion-safe:animate-wa-pulse"
      />
      <WhatsAppIcon className="relative size-7" />
    </a>
  );
}

export default WhatsAppFab;
