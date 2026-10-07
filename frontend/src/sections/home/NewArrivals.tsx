import { useTranslation } from "react-i18next";

import ProductSlider from "@/components/ProductSlider";
import { products } from "@/data/products";

export function NewArrivals() {
  const { t } = useTranslation();
  const newProducts = products.filter((p) => p.isNew).slice(0, 8);

  if (newProducts.length === 0) {
    return null;
  }

  return (
    <section className="container-page py-12">
      <ProductSlider products={newProducts} title={t("product.newArrivals")} />
    </section>
  );
}

export default NewArrivals;
