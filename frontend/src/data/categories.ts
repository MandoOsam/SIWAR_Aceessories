import type { Category } from "@/services/types";

const PLACEHOLDER = "/assets/placeholder";

/**
 * Mock categories. The shape is exactly what `GET /categories` returns, so swapping to the
 * real API changes nothing upstream. IDs are real UUID strings, as in production.
 */
export const categories: Category[] = [
  {
    id: "0f2c9a54-1d6b-4a71-9d3e-6b1f2c8a4d01",
    slug: "necklaces",
    name: { ar: "سلاسل", en: "Necklaces" },
    description: {
      ar: "سلاسل ستانلس ستيل بتفاصيل نظيفة ولمعة هادية.",
      en: "Stainless steel chains with clean lines and a quiet shine.",
    },
    imageUrl: `${PLACEHOLDER}/category-necklaces.svg`,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "0f2c9a54-1d6b-4a71-9d3e-6b1f2c8a4d02",
    slug: "rings",
    name: { ar: "خواتم", en: "Rings" },
    description: {
      ar: "خواتم بتصاميم بسيطة تلبسها كل يوم.",
      en: "Simple designs you can wear every day.",
    },
    imageUrl: `${PLACEHOLDER}/category-rings.svg`,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "0f2c9a54-1d6b-4a71-9d3e-6b1f2c8a4d03",
    slug: "bracelets",
    name: { ar: "انسيال", en: "Bracelets" },
    description: {
      ar: "انسيال بتفاصيل ناعمة ولمعة ثابتة.",
      en: "Soft details and a lasting shine.",
    },
    imageUrl: `${PLACEHOLDER}/category-bracelets.svg`,
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "0f2c9a54-1d6b-4a71-9d3e-6b1f2c8a4d04",
    slug: "earrings",
    name: { ar: "حلقان", en: "Earrings" },
    description: {
      ar: "حلقان خفيفة مناسبة لكل يوم.",
      en: "Lightweight earrings for every day.",
    },
    imageUrl: `${PLACEHOLDER}/category-earrings.svg`,
    sortOrder: 4,
    isActive: true,
  },
  {
    id: "0f2c9a54-1d6b-4a71-9d3e-6b1f2c8a4d05",
    slug: "sets",
    name: { ar: "سيتات", en: "Sets" },
    description: {
      ar: "سيتات كاملة تناسب المناسبات والسهرات.",
      en: "Complete sets for occasions and evenings.",
    },
    imageUrl: `${PLACEHOLDER}/category-sets.svg`,
    sortOrder: 5,
    isActive: true,
  },
];

export function findCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
