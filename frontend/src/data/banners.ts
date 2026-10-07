import type { HomeContent } from "@/services/types";

const PLACEHOLDER = "/assets/placeholder";

/**
 * Banners/mock home banners aligned with HomeContent.featuredCollections and API contract.
 * Kept small (≤ 300 lines not required but simple). Uses existing placeholder images.
 */
export const banners: HomeContent["featuredCollections"] = [
  {
    id: "0f2c9a54-1d6b-4a71-9d3e-6b1f2c8a4e01",
    title: { ar: "السلاسل", en: "Necklaces" },
    subtitle: { ar: "قطع رفيعة بلمعة هادية", en: "Fine pieces with a quiet shine" },
    imageUrl: `${PLACEHOLDER}/banner-featured.svg`,
    href: "/category/necklaces",
  },
  {
    id: "0f2c9a54-1d6b-4a71-9d3e-6b1f2c8a4e02",
    title: { ar: "العروض", en: "Limited Offers" },
    subtitle: { ar: "خصومات لفترة محدودة", en: "Discounts for a limited time" },
    imageUrl: `${PLACEHOLDER}/banner-offers.svg`,
    href: "/shop?discount=true",
  },
];

export default banners;
