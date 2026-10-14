import type { L10n } from "@/services/types";

/**
 * Long-form content for the F7.1a/F7.1b static pages (`/about`, `/contact`, `/faq`, `/shipping`,
 * `/returns`).
 *
 * Static-page copy is content, not UI chrome, so it lives here as bilingual data (05-ui-context.md
 * §6) and will move behind `GET /content/pages/:slug` once B4 lands. UI labels stay in i18n, and
 * the contact channels come from `GET /settings/public` via `usePublicSettings()`. The longer
 * privacy and terms policies are split into `data/static/` to stay under the 300-line cap.
 *
 * TODO(Mando): review the About, FAQ, shipping and returns copy before launch (O-003, O-004).
 */

export type StaticSection = {
  id: string;
  title: L10n;
  body: L10n;
};

/** A multi-paragraph policy section (shipping, returns, privacy, terms). */
export type PolicySection = {
  id: string;
  title: L10n;
  paragraphs: L10n[];
};

export type FaqEntry = {
  id: string;
  question: L10n;
  answer: L10n;
};

/** The brand story (05-ui-context.md §9) plus the stainless-steel benefits shown as cards. */
export const aboutStory: { paragraphs: L10n[]; values: StaticSection[] } = {
  paragraphs: [
    {
      ar: "بدأت SIWAR بفكرة بسيطة: الإكسسوار لازم يكون قوي زي الست الي بتلبسه.",
      en: "SIWAR began with a simple idea: jewelry should feel as strong as the woman wearing it.",
    },
    {
      ar: "بنصمم قطع ستانلس ستيل بتحافظ على لمعتها كل يوم، مقاومة للصدأ والاسوداد، ولطيفة على البشرة الحساسة، تلبسها الصبح وتفضل شكلها مثالي بالليل.",
      en: "We design stainless steel pieces that keep their shine through every day — resistant to rust and tarnish, gentle on sensitive skin, made to be worn in the morning and still look perfect at night.",
    },
    {
      ar: "كل قطعة بتجمع بين الأناقة الهادية ولمسة غموض: خطوط نضيفة، ودرجات دهبي دافية، وتفاصيل بتلاحظها لما تقرب.",
      en: "Each piece balances quiet elegance with a little darkness: clean lines, warm gold tones, and details you only notice up close.",
    },
    {
      ar: "مفيش تنازل بين الجمال والجودة. قطع عمرك ما هتحتاجي تقلعيها.",
      en: "No compromise between beauty and durability. Just pieces you never have to take off.",
    },
  ],
  values: [
    {
      id: "rust",
      title: { ar: "مقاوم للصدأ", en: "Rust resistant" },
      body: {
        ar: "الستانلس ستيل مبيصدأش، فالقعة بتحافظ على شكلها مع الاستخدام اليومي.",
        en: "Stainless steel won't rust, so your piece keeps its finish through daily wear.",
      },
    },
    {
      id: "tarnish",
      title: { ar: "مقاوم للاسوداد", en: "Tarnish resistant" },
      body: {
        ar: "مقاوم للاسوداد ويفضل لامع من غير تلميع مستمر.",
        en: "It resists tarnishing and stays bright without constant polishing.",
      },
    },
    {
      id: "skin",
      title: { ar: "مناسب للبشرة الحساسة", en: "Sensitive-skin friendly" },
      body: {
        ar: "لطيف على البشرة الحساسة، مصمم للاستخدام الطويل.",
        en: "Gentle on sensitive skin and made for all-day wear.",
      },
    },
    {
      id: "water",
      title: { ar: "آمن مع الماء", en: "Water friendly" },
      body: {
        ar: "آمن مع الماء — مش محتاجة تقلعيها.",
        en: "Safe to wear around water — no need to take it off.",
      },
    },
  ],
};

/** FAQ accordion content (05-ui-context.md §7.13). */
export const faqEntries: FaqEntry[] = [
  {
    id: "material",
    question: { ar: "مصنوع من إيه إكسسوار SIWAR؟", en: "What is SIWAR jewelry made of?" },
    answer: {
      ar: "كل القطع مصنوعة من الستانلس ستيل عالي الجودة مع طلاء دهبي مقاوم للاسوداد.",
      en: "Every piece is made of high-quality stainless steel with a tarnish-resistant gold finish.",
    },
  },
  {
    id: "rust",
    question: { ar: "بيصدأ أو بيسود مع الوقت؟", en: "Does it rust or tarnish over time?" },
    answer: {
      ar: "لأ، الستانلس ستيل مقاوم للصدأ والاسوداد، وبيحافظ على لمعته مع العناية العادية.",
      en: "No. Stainless steel resists rust and tarnish and keeps its shine with normal care.",
    },
  },
  {
    id: "sensitive-skin",
    question: { ar: "مناسب للبشرة الحساسة؟", en: "Is it suitable for sensitive skin?" },
    answer: {
      ar: "أيوه، القطع لطيفة على البشرة الحساسة ومناسبة للاستخدام اليومي.",
      en: "Yes, the pieces are gentle on sensitive skin and made for everyday wear.",
    },
  },
  {
    id: "water",
    question: { ar: "أقدر ألبسه في المية؟", en: "Can I wear it in water?" },
    answer: {
      ar: "أيوه، آمن مع الماء، بس بننصح بتجفيفه بقطعة قماش ناعمة بعدها للحفاظ على اللمعة.",
      en: "Yes, it is water friendly. We recommend drying it with a soft cloth afterwards to keep the shine.",
    },
  },
  {
    id: "sizes",
    question: { ar: "كيف أختار مقاس الخاتم؟", en: "How do I choose my ring size?" },
    answer: {
      ar: "عند كل خاتم في صفحة المنتج هتلاقي المقاسات المتاحة. لو محتاجة مساعدة في المقاس كلمينا على واتساب.",
      en: "Each ring page lists the available sizes. If you need help with sizing, message us on WhatsApp.",
    },
  },
  {
    id: "delivery",
    question: { ar: "التوصيل بياخد قد إيه؟", en: "How long does delivery take?" },
    answer: {
      ar: "بنشحن لكل محافظات مصر، والطلب بيوصل عادة من 2 لـ 5 أيام عمل.",
      en: "We ship to every governorate in Egypt; orders usually arrive in 2 to 5 business days.",
    },
  },
  {
    id: "payment",
    question: { ar: "أدفع إزاي؟", en: "How can I pay?" },
    answer: {
      ar: "تقدري تدفعي عند الاستلام، أو بالتحويل عبر إنستاباي أو فودافون كاش.",
      en: "You can pay cash on delivery, or by transfer through InstaPay or Vodafone Cash.",
    },
  },
  {
    id: "returns",
    question: { ar: "أقدر أرجّع أو أستبدل؟", en: "Can I return or exchange?" },
    answer: {
      ar: "أيوه، الاستبدال أو الاسترجاع متاح خلال 14 يوم من الاستلام بشرط إن القطعة مستخدمتش.",
      en: "Yes, returns and exchanges are accepted within 14 days of delivery, as long as the piece is unworn.",
    },
  },
];

/** `/shipping` policy sections (05-ui-context.md §7.13). Fees/time details come from settings. */
export const shippingSections: PolicySection[] = [
  {
    id: "coverage",
    title: { ar: "نطاق الشحن", en: "Where we ship" },
    paragraphs: [
      {
        ar: "بنشحن لكل محافظات مصر. اختاري محافظتك عند إتمام الطلب وحددي تفاصيل العنوان.",
        en: "We deliver to every governorate in Egypt. Choose your governorate at checkout and enter your address details.",
      },
    ],
  },
  {
    id: "processing",
    title: { ar: "تجهيز الطلب", en: "Order processing" },
    paragraphs: [
      {
        ar: "بنجهز الطلبات خلال 1–2 يوم عمل. الطلبات اللي بتوصل بعد الميعاد بتتجهز يوم العمل التالي.",
        en: "Orders are prepared within 1–2 business days. Orders placed after our cut-off are prepared the next business day.",
      },
    ],
  },
  {
    id: "times",
    title: { ar: "مواعيد التوصيل", en: "Delivery times" },
    paragraphs: [
      {
        ar: "التوصيل العادي بياخد 3–5 أيام عمل، والتوصيل السريع بياخد 1–2 يوم عمل حسب المحافظة.",
        en: "Standard delivery takes 3–5 business days, and express delivery takes 1–2 business days depending on the governorate.",
      },
    ],
  },
  {
    id: "fees",
    title: { ar: "مصاريف الشحن", en: "Shipping fees" },
    paragraphs: [
      {
        ar: "رسوم التوصيل بتتحسب عند إتمام الطلب حسب الطريقة والمحافظة، والشحن مجاني فوق حد معين.",
        en: "Shipping is calculated at checkout based on the method and governorate. Delivery is free above a minimum order value.",
      },
    ],
  },
  {
    id: "failed-delivery",
    title: { ar: "لو مفيش حد استلم", en: "If a delivery fails" },
    paragraphs: [
      {
        ar: "لو مندوب الشحن ملقاش حد، هيحاول تاني. بعد محاولتين ممكن الطلب يرجع لنا ونتواصل معاك لتحديد موعد جديد.",
        en: "If no one is available, the courier will try again. After two attempts the order may return to us, and we'll contact you to arrange a new delivery.",
      },
    ],
  },
];

/** `/returns` policy sections (05-ui-context.md §7.13). */
export const returnsSections: PolicySection[] = [
  {
    id: "window",
    title: { ar: "مدة الاسترجاع", en: "Return window" },
    paragraphs: [
      {
        ar: "عندك 14 يوم من تاريخ الاستلام لإرجاع أو استبدال القطعة.",
        en: "You have 14 days from the delivery date to return or exchange a piece.",
      },
    ],
  },
  {
    id: "condition",
    title: { ar: "حالة القطعة", en: "Condition" },
    paragraphs: [
      {
        ar: "لازم القطعة تكون مستخدمتش ومتجرحتش، وترجع بتغليفها الأصلي. لأسباب صحية، الحلقان المش مستخدمة بس اللي بتترجع.",
        en: "The piece must be unworn and undamaged, and returned in its original packaging. For hygiene reasons, earrings are only accepted if unworn.",
      },
    ],
  },
  {
    id: "how-to",
    title: { ar: "إزاي تطلبي المرتجع", en: "How to start a return" },
    paragraphs: [
      {
        ar: "كلمينا على واتساب ومعاك رقم الطلب وسبب الإرجاع، وهنرشدك لخطوات إعادة الإرسال.",
        en: "Message us on WhatsApp with your order number and reason, and we'll guide you through sending it back.",
      },
    ],
  },
  {
    id: "refund",
    title: { ar: "طريقة الاسترداد", en: "How refunds are issued" },
    paragraphs: [
      {
        ar: "بعد ما نستلم القطعة ونراجعها، المبلغ بيرجع على نفس طريقة الدفع. طلبات الدفع عند الاستلام بيتم رد المبلغ عليها بتحويل.",
        en: "Once we receive and inspect the piece, we refund the amount to your original payment method. Cash-on-delivery orders are refunded by transfer.",
      },
    ],
  },
  {
    id: "refund-timeline",
    title: { ar: "مدة استرداد المبلغ", en: "Refund timeline" },
    paragraphs: [
      {
        ar: "بتراجع الطلبات خلال 2–3 أيام عمل من الاستلام، والمبلغ بيظهر عادة خلال 5–10 أيام عمل بعد كده.",
        en: "Returns are inspected within 2–3 business days of arrival, and the refund usually appears within 5–10 business days after that.",
      },
    ],
  },
];
