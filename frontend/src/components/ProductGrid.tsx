import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/utils/cn";
import { fadeUp, reducedMotionVariants, stagger } from "@/utils/animations";
import type { Product } from "@/services/types";
import ProductCard from "./ProductCard";

export interface ProductGridProps {
  products: Product[];
  className?: string;
}

/**
 * Responsive product grid: 2 columns on mobile, 3 on tablet, 4 on desktop (05-ui-context.md §7.3).
 *
 * Presentational only — the page owns data fetching and passes the list in, so loading/empty/error
 * are rendered by `ProductGridSkeleton`, `ProductGridEmpty` and `ProductGridError` around it.
 * Cards stagger in on mount; reduced motion collapses that to a plain fade (03-code-standards.md §5).
 */
export function ProductGrid({ products, className }: ProductGridProps) {
  const shouldReduceMotion = useReducedMotion();
  const reducedMotion = shouldReduceMotion === true;

  const containerVariants = reducedMotion ? reducedMotionVariants.stagger : stagger;
  const itemVariants = reducedMotion ? reducedMotionVariants.fadeUp : fadeUp;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4", className)}
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={itemVariants}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default ProductGrid;
