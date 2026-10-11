import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import ProductSlider from "@/components/ProductSlider";
import { products } from "@/data/products";
import type { Product } from "@/services/types";
import { useRecentlyViewedStore } from "@/store/recentlyViewed";
import { cn } from "@/utils/cn";

const MAX_ITEMS = 8;

export interface RecentlyViewedProductsProps {
  /** The product currently open; recorded on mount and excluded from the rail. */
  currentProduct: Product;
  className?: string;
}

/**
 * Recently-viewed rail for the product page (05-ui-context.md §7.5).
 *
 * On mount it records the current product in the F2 store (`addProduct` moves it to the front), then
 * renders the tracked products **except** the current one — a "recently viewed" widget that included
 * the page you are already on would never be empty. Hidden when there is nothing else to show.
 *
 * Resolves ids against the mock catalogue, mirroring `sections/home/RecentlyViewed.tsx`; a
 * `products/by-ids` endpoint will replace this when the backend lands.
 */
export function RecentlyViewedProducts({ currentProduct, className }: RecentlyViewedProductsProps) {
  const { t } = useTranslation();
  const productIds = useRecentlyViewedStore((state) => state.productIds);
  const addProduct = useRecentlyViewedStore((state) => state.addProduct);

  useEffect(() => {
    addProduct(currentProduct.id);
  }, [addProduct, currentProduct.id]);

  const viewed = productIds
    .filter((id) => id !== currentProduct.id)
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => product !== undefined)
    .slice(0, MAX_ITEMS);

  if (viewed.length === 0) {
    return null;
  }

  return (
    <section className={cn("container-page py-12", className)}>
      <ProductSlider products={viewed} title={t("product.recentlyViewed")} />
    </section>
  );
}

export default RecentlyViewedProducts;
