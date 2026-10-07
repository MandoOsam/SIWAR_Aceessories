import type { Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.16,
    },
  },
};

export const maskReveal: Variants = {
  hidden: {
    clipPath: "inset(0 100% 0 0)",
    opacity: 0,
  },
  visible: {
    clipPath: "inset(0 0 0 0)",
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const reducedMotionVariants = {
  fadeUp: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  } as Variants,
  fadeIn: fadeIn as Variants,
  stagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.08,
      },
    },
  } as Variants,
  maskReveal: fadeIn as Variants,
};
