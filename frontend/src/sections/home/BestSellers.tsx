import { useTranslation } from "react-i18next";

import ProductSlider from "@/components/ProductSlider";
import { products } from "@/data/products";

export function BestSellers() {
  const { t } = useTranslation();
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 8);

  if (bestSellers.length === 0) {
    return null;
  }

  return (
    <section className="container-page py-12">
      <ProductSlider products={bestSellers} title={t("product.bestSellers", "Best sellers")} />
    </section>
  );
}

export default BestSellers;
