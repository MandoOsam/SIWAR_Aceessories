import type { PolicySection } from "@/data/staticPages";

/**
 * `/privacy` policy content, split out of `data/staticPages.ts` to stay under the 300-line cap.
 *
 * PLACEHOLDER COPY — plain-language, written to be reviewed and edited by the owner. It is not
 * legal advice and must be checked before launch (05-ui-context.md §6). Bilingual per §5.1.
 */

export const privacyUpdated = "2026-10-13";

export const privacySections: PolicySection[] = [
  {
    id: "intro",
    title: { ar: "مقدمة", en: "Introduction" },
    paragraphs: [
      {
        ar: "خصوصيتك مهمة عندنا. الصفحة دي بتوضح إيه البيانات اللي بنجمعها لما تستخدمي موقع SIWAR وإزاي بنستخدمها ونحميها.",
        en: "Your privacy matters to us. This page explains what data we collect when you use the SIWAR website, and how we use and protect it.",
      },
    ],
  },
  {
    id: "collect",
    title: { ar: "البيانات اللي بنجمعها", en: "What we collect" },
    paragraphs: [
      {
        ar: "لما تعملي طلب أو حساب، بنجمع الاسم ورقم الموبايل والإيميل وعنوان التوصيل وتفاصيل الطلب.",
        en: "When you place an order or create an account, we collect your name, mobile number, email, delivery address and order details.",
      },
      {
        ar: "بنحتفظ كمان ببيانات تقنية بسيطة زي اللغة والثيم المفضلين ومحتويات السلة، ودي بتتخزن على جهازك.",
        en: "We also keep simple technical preferences such as your language, theme and cart contents, which are stored on your device.",
      },
    ],
  },
  {
    id: "use",
    title: { ar: "إزاي بنستخدم البيانات", en: "How we use your data" },
    paragraphs: [
      {
        ar: "بنستخدم بياناتك لتنفيذ طلبك وتوصيله، وللتواصل معاك بخصوص الطلب، ولتحسين خدماتنا والرد على استفساراتك.",
        en: "We use your data to fulfil and deliver your order, to contact you about it, to improve our services and to answer your questions.",
      },
    ],
  },
  {
    id: "payment",
    title: { ar: "بيانات الدفع", en: "Payment information" },
    paragraphs: [
      {
        ar: "مفيش دفع بالبطاقات في النسخة الحالية، فمبنخزنش بيانات بطاقات. طرق الدفع المتاحة هي الدفع عند الاستلام أو التحويل، وصورة التحويل بتستخدم لتأكيد طلبك بس.",
        en: "There is no card payment in the current version, so we never store card data. Available methods are cash on delivery or transfer, and any transfer screenshot is used only to confirm your order.",
      },
    ],
  },
  {
    id: "cookies",
    title: { ar: "ملفات التعريف والتخزين", en: "Cookies and local storage" },
    paragraphs: [
      {
        ar: "بنستخدم تخزين المتصفح لحفظ اللغة والثيم والسلة والمفضلة، وملفات الكوكيز للحفاظ على تسجيل الدخول بشكل آمن.",
        en: "We use browser storage to remember your language, theme, cart and wishlist, and cookies to keep you signed in securely.",
      },
    ],
  },
  {
    id: "sharing",
    title: { ar: "مشاركة البيانات", en: "Sharing your data" },
    paragraphs: [
      {
        ar: "بنشارك بيانات التوصيل الضرورية بس مع شركة الشحن، وممكن نستخدم مزودي خدمات (زي الاستضافة) اللي بيتعاملوا مع البيانات بالنيابة عننا.",
        en: "We share only the delivery details needed with the courier, and we may use service providers (such as hosting) that process data on our behalf.",
      },
      {
        ar: "مبنبيعش بياناتك ولا بنشاركها مع أي طرف لأغراض تسويقية من غير موافقتك.",
        en: "We never sell your data or share it with third parties for marketing without your consent.",
      },
    ],
  },
  {
    id: "retention",
    title: { ar: "مدة الاحتفاظ", en: "How long we keep it" },
    paragraphs: [
      {
        ar: "بنحتفظ ببيانات الطلب للمدة اللي بتطلبها القوانين المحاسبية، وبعدها بنمسحها أو بنخليها مجهولة الهوية.",
        en: "We keep order data for as long as accounting rules require, after which we delete or anonymise it.",
      },
    ],
  },
  {
    id: "rights",
    title: { ar: "حقوقك", en: "Your rights" },
    paragraphs: [
      {
        ar: "تقدري تطلبي الوصول لبياناتك أو تصحيحها أو مسحها، وتقدري توقفي استقبال الرسائل التسويقية في أي وقت.",
        en: "You can ask to access, correct or delete your data, and you can stop receiving marketing messages at any time.",
      },
    ],
  },
  {
    id: "contact",
    title: { ar: "تواصلي معنا", en: "Contact us" },
    paragraphs: [
      {
        ar: "لأي سؤال عن الخصوصية، كلمينا من صفحة التواصل أو على واتساب.",
        en: "For any privacy question, reach us from the contact page or on WhatsApp.",
      },
    ],
  },
  {
    id: "changes",
    title: { ar: "تحديثات السياسة", en: "Changes to this policy" },
    paragraphs: [
      {
        ar: "ممكن نحدّث السياسة دي من وقت للتاني، وهننشر أي تحديث على الصفحة دي بتاريخ جديد.",
        en: "We may update this policy from time to time; any update will be published on this page with a new date.",
      },
    ],
  },
];
