/**
 * Main navigation structure.
 *
 * Labels are i18n keys, not strings, so the same definition serves Arabic and English.
 */
export type NavItem = {
  labelKey: string;
  href: string;
};

export const PRIMARY_NAV: NavItem[] = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.shop", href: "/shop" },
  { labelKey: "nav.newArrivals", href: "/shop?isNew=true" },
  { labelKey: "nav.offers", href: "/shop?discount=true" },
  { labelKey: "nav.about", href: "/about" },
  { labelKey: "nav.contact", href: "/contact" },
];

export const FOOTER_SHOP_LINKS: NavItem[] = [
  { labelKey: "footer.links.shopAll", href: "/shop" },
  { labelKey: "footer.links.newArrivals", href: "/shop?isNew=true" },
  { labelKey: "footer.links.bestSellers", href: "/shop?sort=best-selling" },
  { labelKey: "footer.links.offers", href: "/shop?discount=true" },
];

export const FOOTER_HELP_LINKS: NavItem[] = [
  { labelKey: "footer.links.faq", href: "/faq" },
  { labelKey: "footer.links.shipping", href: "/shipping" },
  { labelKey: "footer.links.returns", href: "/returns" },
  { labelKey: "footer.links.trackOrder", href: "/track-order" },
  { labelKey: "footer.links.contact", href: "/contact" },
];

export const FOOTER_LEGAL_LINKS: NavItem[] = [
  { labelKey: "footer.links.privacy", href: "/privacy" },
  { labelKey: "footer.links.terms", href: "/terms" },
  { labelKey: "footer.links.about", href: "/about" },
];
