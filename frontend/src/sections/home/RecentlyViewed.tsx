import { useTranslation } from "react-i18next";

import ProductSlider from "@/components/ProductSlider";
import { products } from "@/data/products";
import { useRecentlyViewedStore } from "@/store/recentlyViewed";

export function RecentlyViewed() {
  const { t } = useTranslation();
  const { productIds } = useRecentlyViewedStore();
  
  const viewed = productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
    .slice(0, 8);

  if (viewed.length === 0) {
    return null;
  }

  return (
    <section className="container-page py-12">
      <ProductSlider products={viewed} title={t("home.recentlyViewed", "Recently Viewed")} />
    </section>
  );
}

export default RecentlyViewed;
