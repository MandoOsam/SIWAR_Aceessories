import type { Notification } from "@/services/types";

/**
 * Mock notifications shown until the real API exists (`GET /account/notifications`).
 *
 * Sample content owned by the owner, following the F1 `src/data/` placeholder pattern: real copy
 * replaces these, and every string is bilingual `L10n`.
 */
export const seedNotifications: Notification[] = [
  {
    id: "notif-welcome",
    type: "system",
    title: { ar: "أهلاً بكِ في SIWAR", en: "Welcome to SIWAR" },
    body: {
      ar: "استعرضي أحدث مجموعات الإكسسوارات المصنوعة من الستانلس ستيل.",
      en: "Browse the latest stainless-steel accessory collections.",
    },
    isRead: false,
    createdAt: "2026-10-01T09:00:00.000Z",
  },
  {
    id: "notif-offer",
    type: "promo",
    title: { ar: "خصم ١٠٪ على أول طلب", en: "10% off your first order" },
    body: {
      ar: "استخدمي كود SIWAR10 عند إتمام الطلب.",
      en: "Use the code SIWAR10 at checkout.",
    },
    isRead: false,
    createdAt: "2026-10-05T12:30:00.000Z",
  },
  {
    id: "notif-shipping",
    type: "order",
    title: { ar: "شحن مجاني للطلبات الكبيرة", en: "Free shipping on large orders" },
    body: {
      ar: "الشحن مجاني للطلبات التي تبلغ ٧٥٠ ج.م أو أكثر.",
      en: "Shipping is free on orders of EGP 750 or more.",
    },
    isRead: true,
    createdAt: "2026-10-08T15:00:00.000Z",
  },
];
