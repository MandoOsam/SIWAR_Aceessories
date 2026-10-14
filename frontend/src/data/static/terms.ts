import type { PolicySection } from "@/data/staticPages";

/**
 * `/terms` content, split out of `data/staticPages.ts` to stay under the 300-line cap.
 *
 * PLACEHOLDER COPY — plain-language, written to be reviewed and edited by the owner. It is not
 * legal advice and must be checked before launch (05-ui-context.md §6). Bilingual per §5.1.
 */

export const termsUpdated = "2026-10-13";

export const termsSections: PolicySection[] = [
  {
    id: "acceptance",
    title: { ar: "الموافقة على الشروط", en: "Acceptance of terms" },
    paragraphs: [
      {
        ar: "باستخدامك لموقع SIWAR أو عمل طلب، فأنت موافقة على الشروط دي. لو مش موافقة، من فضلك متستخدميش الموقع.",
        en: "By using the SIWAR website or placing an order, you agree to these terms. If you do not agree, please do not use the site.",
      },
    ],
  },
  {
    id: "accounts",
    title: { ar: "الحسابات", en: "Accounts" },
    paragraphs: [
      {
        ar: "لو عملتي حساب، إنتِ مسؤولة عن الحفاظ على بيانات الدخول صحيحة وسرية، وعن كل نشاط يحصل من خلال حسابك.",
        en: "If you create an account, you are responsible for keeping your login details accurate and private, and for all activity on your account.",
      },
    ],
  },
  {
    id: "products",
    title: { ar: "المنتجات والأسعار", en: "Products and pricing" },
    paragraphs: [
      {
        ar: "بنحاول نوصف المنتجات وألوانها بدقة، بس ممكن تختلف شوية حسب الشاشة. الأسعار بالجنيه المصري وممكن تتغير، وإحنا بنصحح أي خطأ في السعر قبل تأكيد الطلب.",
        en: "We aim to describe our products and colours accurately, though they may vary slightly by screen. Prices are in Egyptian pounds and may change; we correct any pricing error before confirming an order.",
      },
      {
        ar: "توفر المنتجات بيتغير، وممكن نلغي كمية مش متاحة ونبلّغك.",
        en: "Product availability changes; we may cancel an unavailable item and let you know.",
      },
    ],
  },
  {
    id: "orders",
    title: { ar: "الطلبات والدفع", en: "Orders and payment" },
    paragraphs: [
      {
        ar: "الطلب بيتأكد بعد التحقق من البيانات والتوفر. طرق الدفع المتاحة هي الدفع عند الاستلام أو التحويل، وممكن نطلب صورة التحويل لتأكيد الطلب.",
        en: "An order is confirmed after we verify the details and availability. Available payment methods are cash on delivery or transfer, and we may ask for a transfer screenshot to confirm the order.",
      },
    ],
  },
  {
    id: "shipping",
    title: { ar: "الشحن والتوصيل", en: "Shipping and delivery" },
    paragraphs: [
      {
        ar: "مواعيد التوصيل تقديرية وممكن تتأثر بأمور خارج سيطرتنا. تفاصيل أكتر في صفحة الشحن.",
        en: "Delivery times are estimates and may be affected by things outside our control. See the shipping page for details.",
      },
    ],
  },
  {
    id: "returns",
    title: { ar: "الاسترجاع والاستبدال", en: "Returns and exchanges" },
    paragraphs: [
      {
        ar: "الاسترجاع والاستبدال بيتموا حسب سياسة الاسترجاع المنشورة في صفحة الاسترجاع.",
        en: "Returns and exchanges are handled according to the policy published on the returns page.",
      },
    ],
  },
  {
    id: "ip",
    title: { ar: "الملكية الفكرية", en: "Intellectual property" },
    paragraphs: [
      {
        ar: "اسم SIWAR والشعار والصور والتصميمات ملك لنا، ومينفعش تستخدميها من غير إذن مكتوب.",
        en: "The SIWAR name, logo, images and designs belong to us and may not be used without written permission.",
      },
    ],
  },
  {
    id: "liability",
    title: { ar: "حدود المسؤولية", en: "Limitation of liability" },
    paragraphs: [
      {
        ar: "بنقدم الموقع والخدمات كما هي. في حدود ما يسمح به القانون، مش مسؤولين عن أي أضرار غير مباشرة ناتجة عن استخدام الموقع.",
        en: "We provide the site and services as they are. To the extent the law allows, we are not liable for indirect losses arising from using the site.",
      },
    ],
  },
  {
    id: "law",
    title: { ar: "القانون الحاكم", en: "Governing law" },
    paragraphs: [
      {
        ar: "الشروط دي بتخضع لقوانين جمهورية مصر العربية.",
        en: "These terms are governed by the laws of the Arab Republic of Egypt.",
      },
    ],
  },
  {
    id: "changes",
    title: { ar: "تحديثات الشروط", en: "Changes to these terms" },
    paragraphs: [
      {
        ar: "ممكن نحدّث الشروط دي، وهننشر أي تحديث على الصفحة دي بتاريخ جديد. للاستفسارات كلمينا من صفحة التواصل.",
        en: "We may update these terms; any update will be published on this page with a new date. For questions, reach us from the contact page.",
      },
    ],
  },
];
