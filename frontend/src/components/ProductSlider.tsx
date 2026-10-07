import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/utils/cn";
import { useLocale } from "@/hooks/useLocale";
import { IconButton } from "@/components/ui/IconButton";
import type { Product } from "@/services/types";
import ProductCard from "./ProductCard";

export interface ProductSliderProps {
  products: Product[];
  title?: string;
  className?: string;
}

export function ProductSlider({ products, title, className }: ProductSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { locale } = useLocale();
  const isRTL = locale === "ar";

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild?.clientWidth ?? 300;
    const scrollAmount = cardWidth * 2;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      {title && (
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-heading-sm text-fg">{title}</h2>
          <div className="hidden gap-2 md:flex">
            <IconButton
              
              onClick={() => scroll(isRTL ? "right" : "left")}
              label={t("common.back")}
              icon={<ChevronLeft className={cn("h-5 w-5", isRTL && "rtl-flip")} />}
            />
            <IconButton
              
              onClick={() => scroll(isRTL ? "left" : "right")}
              label={t("common.close")}
              icon={<ChevronRight className={cn("h-5 w-5", isRTL && "rtl-flip")} />}
            />
          </div>
        </div>
      )}
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-4 md:gap-6 md:overflow-visible",
          "snap-x snap-mandatory scroll-smooth",
        )}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {products.map((product) => (
          <div key={product.id} className="min-w-[70%] snap-center md:min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductSlider;
