import { useTranslation } from "react-i18next";

import ProductSlider from "@/components/ProductSlider";
import { products } from "@/data/products";

export function Recommended() {
  const { t } = useTranslation();
  // Mock recommended: take best sellers or first 8
  const recommended = products.filter((p) => p.isBestSeller).slice(0, 8);
  
  if (recommended.length === 0) {
    return null;
  }

  return (
    <section className="container-page py-12">
      <ProductSlider products={recommended} title={t("home.recommended", "Recommended for You")} />
    </section>
  );
}

export default Recommended;
