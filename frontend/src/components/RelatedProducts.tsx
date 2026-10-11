import { useTranslation } from "react-i18next";

import ProductSlider from "@/components/ProductSlider";
import type { Product } from "@/services/types";
import { cn } from "@/utils/cn";

export interface RelatedProductsProps {
  /** Same-category products first, then others; already computed by `getProductBySlug` (D-027). */
  products: Product[];
  className?: string;
}

/**
 * "You may also like" rail for the product page (05-ui-context.md §7.5). Presentational: F4.4 passes
 * the `related` list from the existing `useRelatedProducts` hook. Hidden entirely when empty.
 */
export function RelatedProducts({ products, className }: RelatedProductsProps) {
  const { t } = useTranslation();

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={cn("container-page py-12", className)}>
      <ProductSlider products={products} title={t("product.related")} />
    </section>
  );
}

export default RelatedProducts;
