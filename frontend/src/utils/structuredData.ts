import type { Product } from "@/services/types";
import { localize } from "@/utils/format";
import type { L10n } from "@/services/types";

/**
 * JSON-LD structured data helpers (F7.2).
 */
export type BreadcrumbItem = {
  id: string;
  name: L10n;
  url: string;
};

export function productJsonLd(product: Product, _baseUrl: string, locale: "ar" | "en"): string {
  const name = localize(product.name, locale);
  const description = localize(product.description, locale);
  const image = product.images.find((img) => img.isPrimary)?.url ?? product.images[0]?.url;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image ? [image] : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      price: product.price,
      availability: product.stock > 0 ? "InStock" : "OutOfStock",
    },
    brand: { "@type": "Brand", name: "SIWAR" },
    sku: product.id,
  });
}

export function organizationJsonLd(baseUrl: string): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SIWAR",
    url: baseUrl,
    logo: `${baseUrl}/assets/logo/siwar-logo.svg`,
  });
}

export function breadcrumbJsonLd(items: BreadcrumbItem[], baseUrl: string, locale: "ar" | "en"): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: localize(item.name, locale),
      item: baseUrl + item.url,
    })),
  });
}
