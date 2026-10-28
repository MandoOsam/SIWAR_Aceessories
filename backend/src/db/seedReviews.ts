import { eq } from "drizzle-orm";

import { db } from "@/db/client.js";
import { reviews } from "@/db/schema/reviews.js";
import type { L10n } from "@/types/l10n.js";

/**
 * Home-page testimonials (D-028). Seeded reviews carry no product id, are
 * approved, and never claim a verified purchase. Idempotent: the block is
 * skipped once at least one seeded review exists.
 */

type SeedReview = { authorName: string; rating: number; text: L10n };

const reviewSeeds: SeedReview[] = [
  {
    authorName: "Ahmed M.",
    rating: 5,
    text: {
      ar: "مجوهرات جميلة وخامة ستانلس ستيل عالية الجودة.",
      en: "Beautiful jewelry, high quality stainless steel.",
    },
  },
  {
    authorName: "Sara K.",
    rating: 5,
    text: { ar: "أنيقة ومتينة، أحببتها جدًا!", en: "Elegant and durable. Love it!" },
  },
  {
    authorName: "Mona S.",
    rating: 4,
    text: { ar: "قيمة رائعة مقابل السعر.", en: "Great value for money." },
  },
  {
    authorName: "Amira T.",
    rating: 5,
    text: { ar: "تصاميم أنيقة وتوصيل سريع.", en: "Stylish pieces, fast delivery." },
  },
  {
    authorName: "Nour A.",
    rating: 5,
    text: { ar: "تصاميم خالدة وأنا سعيدة جدًا.", en: "Timeless designs, very happy." },
  },
  {
    authorName: "Hala R.",
    rating: 4,
    text: { ar: "مثالية للارتداء اليومي.", en: "Perfect for everyday wear." },
  },
  {
    authorName: "Yasmin F.",
    rating: 5,
    text: { ar: "أحب البساطة والجمال في التصميم.", en: "Love the minimal aesthetic." },
  },
  {
    authorName: "Rania Z.",
    rating: 5,
    text: { ar: "قطع جميلة وجودة ممتازة.", en: "Beautiful pieces, great quality." },
  },
];

export async function seedReviews(): Promise<number> {
  const existing = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.isSeed, true))
    .limit(1);
  if (existing.length > 0) return 0;

  const inserted = await db
    .insert(reviews)
    .values(
      reviewSeeds.map((seed) => ({
        productId: null,
        userId: null,
        authorName: seed.authorName,
        rating: seed.rating,
        text: seed.text,
        images: [],
        status: "approved" as const,
        isSeed: true,
        showOnHome: true,
        isVerifiedPurchase: false,
      })),
    )
    .returning({ id: reviews.id });

  return inserted.length;
}
