import type { Review } from "@/services/types";

/**
 * Seeded sample reviews for mock mode only. `05-ui-context.md` section 10 requires eight
 * mixed AR/EN reviews, and none of them may ever show a "Verified purchase" badge — hence
 * `isSeed: true` and `isVerifiedPurchase: false` on every row.
 *
 * TODO(Mando): replace with real customer reviews before launch (open question O-006).
 */
export const reviews: Review[] = [
  {
    id: "2b8e4f31-0000-4000-8000-000000000001",
    authorName: "منى",
    governorate: { ar: "القاهرة", en: "Cairo" },
    rating: 5,
    text: {
      ar: "السلسلة مطابقة للصور تماماً واللمعة لسه زي ما هي بعد شهرين.",
      en: "The chain is exactly as pictured and the shine is still perfect after two months.",
    },
    images: [],
    status: "approved",
    isSeed: true,
    isVerifiedPurchase: false,
    showOnHome: true,
    createdAt: "2026-09-12T10:00:00.000Z",
  },
  {
    id: "2b8e4f31-0000-4000-8000-000000000002",
    authorName: "Aya",
    governorate: { ar: "الجيزة", en: "Giza" },
    rating: 5,
    text: {
      ar: "بسبح فيه يومياً ومفيش أي اسوداد. التغليف كمان كان حلو جداً.",
      en: "I swim with it daily and it has not turned at all. Packaging was beautiful too.",
    },
    images: [],
    status: "approved",
    isSeed: true,
    isVerifiedPurchase: false,
    showOnHome: true,
    createdAt: "2026-09-05T10:00:00.000Z",
  },
  {
    id: "2b8e4f31-0000-4000-8000-000000000003",
    authorName: "سارة",
    governorate: { ar: "الإسكندرية", en: "Alexandria" },
    rating: 4,
    text: {
      ar: "الخامة ممتازة والسعر معقول، بس التوصيل اتأخر يومين.",
      en: "Great quality for the price, though delivery was two days late.",
    },
    images: [],
    status: "approved",
    isSeed: true,
    isVerifiedPurchase: false,
    showOnHome: true,
    createdAt: "2026-08-27T10:00:00.000Z",
  },
  {
    id: "2b8e4f31-0000-4000-8000-000000000004",
    authorName: "Nour",
    governorate: { ar: "القاهرة", en: "Cairo" },
    rating: 5,
    text: {
      ar: "بشرتي حساسة وده أول إكسسوار مابهّرش بشرتي خالص.",
      en: "I have sensitive skin and this was the first piece that never irritated me.",
    },
    images: [],
    status: "approved",
    isSeed: true,
    isVerifiedPurchase: false,
    showOnHome: true,
    createdAt: "2026-08-19T10:00:00.000Z",
  },
  {
    id: "2b8e4f31-0000-4000-8000-000000000005",
    authorName: "مريم",
    governorate: { ar: "الدقهلية", en: "Dakahlia" },
    rating: 5,
    text: {
      ar: "الخاتم مريح وبيفضل شكله حلو من غير ما يبهت.",
      en: "The ring is comfortable and still looks great without tarnishing.",
    },
    images: [],
    status: "approved",
    isSeed: true,
    isVerifiedPurchase: false,
    showOnHome: false,
    createdAt: "2026-08-03T10:00:00.000Z",
  },
  {
    id: "2b8e4f31-0000-4000-8000-000000000006",
    authorName: "Farida",
    governorate: { ar: "أسيوط", en: "Asyut" },
    rating: 4,
    text: {
      ar: "الشكل راقي والتغليف كان مرتب جداً. هطلب تاني.",
      en: "The design is refined and the packaging was very neat. I will order again.",
    },
    images: [],
    status: "approved",
    isSeed: true,
    isVerifiedPurchase: false,
    showOnHome: false,
    createdAt: "2026-07-22T10:00:00.000Z",
  },
  {
    id: "2b8e4f31-0000-4000-8000-000000000007",
    authorName: "هبة",
    governorate: { ar: "المنوفية", en: "Monufia" },
    rating: 5,
    text: {
      ar: "طلبت السيت وكان أكتر من expectations، الحلقان خفيفين جداً.",
      en: "I ordered the set and it exceeded expectations; the earrings are very light.",
    },
    images: [],
    status: "approved",
    isSeed: true,
    isVerifiedPurchase: false,
    showOnHome: false,
    createdAt: "2026-07-09T10:00:00.000Z",
  },
  {
    id: "2b8e4f31-0000-4000-8000-000000000008",
    authorName: "Salma",
    governorate: { ar: "القاهرة", en: "Cairo" },
    rating: 5,
    text: {
      ar: "عجبني إنه مش الشكل الذهبي التقيل المعتاد، بيفضل بسيط وأنيق.",
      en: "I liked that it is not the usual heavy gold look; it stays subtle.",
    },
    images: [],
    status: "approved",
    isSeed: true,
    isVerifiedPurchase: false,
    showOnHome: false,
    createdAt: "2026-06-30T10:00:00.000Z",
  },
];
