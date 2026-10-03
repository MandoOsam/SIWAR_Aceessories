import type { HomeContent, StaticPage, StoreSettings } from "@/services/types";

const PLACEHOLDER = "/assets/placeholder";

/**
 * Mock store settings — the single row the admin will edit in A6.
 * Source: `GET /settings/public`.
 *
 * TODO(Mando): the owner must confirm the shipping fee, the payment instructions and the
 * real contact details (open questions O-003 and O-005).
 */
export const storeSettings: StoreSettings = {
  storeName: "SIWAR",
  currency: "EGP",
  shipping: {
    defaultFee: 60,
    freeAbove: 3000,
  },
  paymentMethods: [
    {
      id: "cod",
      name: { ar: "الدفع عند الاستلام", en: "Cash on Delivery" },
      isEnabled: true,
    },
    {
      id: "instapay",
      name: { ar: "تحويل إنستاباي", en: "InstaPay transfer" },
      isEnabled: true,
      instructions: {
        ar: "حوّلي المبلغ على الرقم التالي ثم ارفعي صورة التحويل.",
        en: "Transfer the amount to the number below, then upload a screenshot.",
      },
      accountValue: "TODO(Mando)",
    },
    {
      id: "vodafone-cash",
      name: { ar: "فودافون كاش", en: "Vodafone Cash" },
      isEnabled: true,
      instructions: {
        ar: "حوّلي المبلغ على الرقم التالي ثم ارفعي صورة التحويل.",
        en: "Transfer the amount to the number below, then upload a screenshot.",
      },
      accountValue: "TODO(Mando)",
    },
  ],
  trustBadges: {
    shipping: {
      ar: "شحن لكل المحافظات",
      en: "Shipping nationwide",
    },
    payment: {
      ar: "دفع عند الاستلام أو تحويل",
      en: "Cash on delivery or transfer",
    },
    returns: {
      ar: "استبدال خلال 14 يوم",
      en: "14-day returns",
    },
    support: {
      ar: "دعم عبر واتساب",
      en: "Support on WhatsApp",
    },
  },
  social: [
    { platform: "instagram", url: "TODO(Mando)" },
    { platform: "tiktok", url: "TODO(Mando)" },
    { platform: "facebook", url: "TODO(Mando)" },
  ],
  contact: {
    phone: "TODO(Mando)",
    email: "TODO(Mando)",
    whatsapp: "TODO(Mando)",
  },
};

/**
 * Mock editable home content — the `content_blocks` rows the admin will manage in A6.
 * Source: `GET /content/home`.
 *
 * TODO(Mando): the hero background file is owned by the owner (open question O-001).
 */
export const homeContent: HomeContent = {
  hero: {
    headline: { ar: "تلبسيها كل يوم.", en: "Worn every day." },
    headlineAccent: { ar: "وعمرها ما تبهت.", en: "Never fades." },
    subline: {
      ar: "إكسسوار من الستانلس ستيل: مقاوم للصدأ والأسوداد، ولطيف على البشرة الحساسة.",
      en: "Stainless steel jewelry: rust and tarnish resistant, gentle on sensitive skin.",
    },
    primaryCta: { label: { ar: "تسوقي الآن", en: "Shop Now" }, href: "/shop" },
    secondaryCta: { label: { ar: "اكتشفي المجموعات", en: "Explore Collections" }, href: "/shop" },
    posterUrl: `${PLACEHOLDER}/hero-poster.svg`,
  },
  story: {
    title: { ar: "قصة SIWAR", en: "The SIWAR Story" },
    body: {
      ar: "بدأت SIWAR بفكرة بسيطة: الإكسسوار لازم يكون قوي زي الست الي بتلبسه.",
      en: "SIWAR began with a simple idea: jewelry should feel as strong as the woman wearing it.",
    },
    imageUrl: `${PLACEHOLDER}/story.svg`,
    ctaLabel: { ar: "اعرفي المزيد", en: "Learn more" },
    ctaHref: "/about",
  },
  featuredCollections: [
    {
      id: "0f2c9a54-1d6b-4a71-9d3e-6b1f2c8a4e01",
      title: { ar: "السلاسل", en: "Necklaces" },
      subtitle: { ar: "قطع رفيعة بلمعة هادية", en: "Fine pieces with a quiet shine" },
      imageUrl: `${PLACEHOLDER}/banner-featured.svg`,
      href: "/category/necklaces",
    },
    {
      id: "0f2c9a54-1d6b-4a71-9d3e-6b1f2c8a4e02",
      title: { ar: "العروض", en: "Limited Offers" },
      subtitle: { ar: "خصومات لفترة محدودة", en: "Discounts for a limited time" },
      imageUrl: `${PLACEHOLDER}/banner-offers.svg`,
      href: "/shop?discount=true",
    },
  ],
};

/**
 * Mock static pages — the `pages` rows the admin will edit in A6.
 * Source: `GET /content/pages/:slug`.
 *
 * TODO(Mando): final copy, shipping policy and returns policy (open questions O-003, O-004).
 */
export const staticPages: StaticPage[] = [
  {
    slug: "about",
    title: { ar: "من نحن", en: "About Us" },
    body: {
      ar: "SIWAR علامة مصرية بتصمم إكسسوار ستانلس ستيل للنساء، بتفاصيل نظيفة ولمعة ثابتة.",
      en: "SIWAR is an Egyptian brand designing stainless steel jewelry for women, with clean lines and lasting shine.",
    },
  },
  {
    slug: "contact",
    title: { ar: "تواصلي معنا", en: "Contact Us" },
    body: {
      ar: "تقدري تواصلي معنا عبر واتساب أو الإيميل.",
      en: "You can reach us on WhatsApp or by email.",
    },
  },
  {
    slug: "faq",
    title: { ar: "الأسئلة الشائعة", en: "FAQ" },
    body: {
      ar: "إجابات على أكثر الأسئلة اللي بتتكرر.",
      en: "Answers to the questions we get most.",
    },
  },
  {
    slug: "shipping",
    title: { ar: "الشحن", en: "Shipping" },
    body: {
      ar: "بنشحن لكل محافظات مصر.",
      en: "We ship to every governorate in Egypt.",
    },
  },
  {
    slug: "returns",
    title: { ar: "الاستبدال والاسترجاع", en: "Returns" },
    body: {
      ar: "الاستبدال متاح خلال 14 يوم من الاستلام.",
      en: "Returns are accepted within 14 days of delivery.",
    },
  },
  {
    slug: "privacy",
    title: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
    body: {
      ar: "بياناتك بتتخزن بأمان وبتستخدم بس لتنفيذ طلبك.",
      en: "Your data is stored securely and used only to fulfil your order.",
    },
  },
  {
    slug: "terms",
    title: { ar: "الشروط والأحكام", en: "Terms and Conditions" },
    body: {
      ar: "باستخدامك للموقع فأنت موافقة على الشروط دي.",
      en: "By using this site you agree to these terms.",
    },
  },
];
