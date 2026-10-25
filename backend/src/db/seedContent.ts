import { db } from "@/db/client.js";
import { contentBlocks, type NewContentBlock } from "@/db/schema/contentBlocks.js";
import { pages, type NewPage } from "@/db/schema/pages.js";
import { storeSettings, type NewStoreSettings } from "@/db/schema/storeSettings.js";
import type {
  HeroContent,
  PaymentMethod,
  SocialLink,
  StoryContent,
  TrustBadges,
} from "@/types/content.js";

const PLACEHOLDER = "/assets/placeholder";

const hero: HeroContent = {
  headline: { ar: "تلبسيها كل يوم.", en: "Worn every day." },
  headlineAccent: { ar: "وعمرها ما تبهت.", en: "Never fades." },
  subline: {
    ar: "إكسسوار من الستانلس ستيل: مقاوم للصدأ والأسوداد، ولطيف على البشرة الحساسة.",
    en: "Stainless steel jewelry: rust and tarnish resistant, gentle on sensitive skin.",
  },
  primaryCta: { label: { ar: "تسوقي الآن", en: "Shop Now" }, href: "/shop" },
  secondaryCta: { label: { ar: "اكتشفي المجموعات", en: "Explore Collections" }, href: "/shop" },
  posterUrl: `${PLACEHOLDER}/hero-poster.svg`,
};

const story: StoryContent = {
  title: { ar: "قصة SIWAR", en: "The SIWAR Story" },
  body: {
    ar: "بدأت SIWAR بفكرة بسيطة: الإكسسوار لازم يكون قوي زي الست الي بتلبسه.",
    en: "SIWAR began with a simple idea: jewelry should feel as strong as the woman wearing it.",
  },
  imageUrl: `${PLACEHOLDER}/story.svg`,
  ctaLabel: { ar: "اعرفي المزيد", en: "Learn more" },
  ctaHref: "/about",
};

const blockSeeds: NewContentBlock[] = [
  { key: "hero", data: hero, sortOrder: 10, isActive: true },
  { key: "story", data: story, sortOrder: 20, isActive: true },
  {
    key: "featured:0f2c9a54-1d6b-4a71-9d3e-6b1f2c8a4e01",
    data: {
      title: { ar: "السلاسل", en: "Necklaces" },
      subtitle: { ar: "قطع رفيعة بلمعة هادية", en: "Fine pieces with a quiet shine" },
      imageUrl: `${PLACEHOLDER}/banner-featured.svg`,
      href: "/category/necklaces",
    },
    sortOrder: 30,
    isActive: true,
  },
  {
    key: "featured:0f2c9a54-1d6b-4a71-9d3e-6b1f2c8a4e02",
    data: {
      title: { ar: "العروض", en: "Limited Offers" },
      subtitle: { ar: "خصومات لفترة محدودة", en: "Discounts for a limited time" },
      imageUrl: `${PLACEHOLDER}/banner-offers.svg`,
      href: "/shop?discount=true",
    },
    sortOrder: 40,
    isActive: true,
  },
];

const pageSeeds: NewPage[] = [
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
    body: { ar: "بنشحن لكل محافظات مصر.", en: "We ship to every governorate in Egypt." },
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

const paymentMethods: PaymentMethod[] = [
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
    accountValue: "01278259732",
  },
  {
    id: "vodafone-cash",
    name: { ar: "فودافون كاش", en: "Vodafone Cash" },
    isEnabled: true,
    instructions: {
      ar: "حوّلي المبلغ على الرقم التالي ثم ارفعي صورة التحويل.",
      en: "Transfer the amount to the number below, then upload a screenshot.",
    },
    accountValue: "01041921899",
  },
];

const trustBadges: TrustBadges = {
  shipping: { ar: "شحن لكل المحافظات", en: "Shipping nationwide" },
  payment: { ar: "دفع عند الاستلام أو تحويل", en: "Cash on delivery or transfer" },
  returns: { ar: "استبدال خلال 14 يوم", en: "14-day returns" },
  support: { ar: "دعم عبر واتساب", en: "Support on WhatsApp" },
};

const social: SocialLink[] = [
  { platform: "instagram", url: "https://www.instagram.com/siwar_accessories00/" },
  { platform: "tiktok", url: "https://www.tiktok.com/@siwar.accessories0" },
  { platform: "facebook", url: "https://www.facebook.com/share/1FrbTF2X3L/?mibextid=wwXIfr" },
];

const settingsSeed: NewStoreSettings = {
  storeName: "SIWAR",
  currency: "EGP",
  shipping: { defaultFee: 60, freeAbove: 3000 },
  paymentMethods,
  trustBadges,
  social,
  // Email stays unset until the owner supplies one (open question O-010).
  contact: { phone: "01041921899", whatsapp: "https://wa.me/201041921899" },
};

/**
 * Seeds the storefront content (B4) without overwriting edits made from the
 * dashboard: blocks/pages are inserted only when their key is missing, and the
 * settings row is only created when the table is empty.
 */
export async function seedContent(): Promise<{ blocks: number; pages: number; settings: boolean }> {
  const insertedBlocks = await db
    .insert(contentBlocks)
    .values(blockSeeds)
    .onConflictDoNothing({ target: contentBlocks.key })
    .returning({ id: contentBlocks.id });
  const insertedPages = await db
    .insert(pages)
    .values(pageSeeds)
    .onConflictDoNothing({ target: pages.slug })
    .returning({ id: pages.id });

  const [existingSettings] = await db
    .select({ id: storeSettings.id })
    .from(storeSettings)
    .limit(1);
  const createdSettings = existingSettings === undefined;
  if (createdSettings) {
    await db.insert(storeSettings).values(settingsSeed);
  }

  return {
    blocks: insertedBlocks.length,
    pages: insertedPages.length,
    settings: createdSettings,
  };
}
