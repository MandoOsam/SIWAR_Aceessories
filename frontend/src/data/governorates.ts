import type { Governorate } from "@/services/types";

/**
 * Egypt's 27 governorates for the checkout address step. Source: `GET /shipping/governorates`.
 *
 * `value` is a stable slug (never the display name) so the server can validate the selection
 * regardless of the visitor's language.
 */
export const governorates: Governorate[] = [
  { value: "cairo", name: { ar: "القاهرة", en: "Cairo" } },
  { value: "giza", name: { ar: "الجيزة", en: "Giza" } },
  { value: "alexandria", name: { ar: "الإسكندرية", en: "Alexandria" } },
  { value: "dakahlia", name: { ar: "الدقهلية", en: "Dakahlia" } },
  { value: "red-sea", name: { ar: "البحر الأحمر", en: "Red Sea" } },
  { value: "beheira", name: { ar: "البحيرة", en: "Beheira" } },
  { value: "fayoum", name: { ar: "الفيوم", en: "Fayoum" } },
  { value: "gharbia", name: { ar: "الغربية", en: "Gharbia" } },
  { value: "ismailia", name: { ar: "الإسماعيلية", en: "Ismailia" } },
  { value: "monufia", name: { ar: "المنوفية", en: "Monufia" } },
  { value: "minya", name: { ar: "المنيا", en: "Minya" } },
  { value: "qalyubia", name: { ar: "القليوبية", en: "Qalyubia" } },
  { value: "new-valley", name: { ar: "الوادي الجديد", en: "New Valley" } },
  { value: "suez", name: { ar: "السويس", en: "Suez" } },
  { value: "aswan", name: { ar: "أسوان", en: "Aswan" } },
  { value: "asyut", name: { ar: "أسيوط", en: "Asyut" } },
  { value: "beni-suef", name: { ar: "بني سويف", en: "Beni Suef" } },
  { value: "port-said", name: { ar: "بورسعيد", en: "Port Said" } },
  { value: "damietta", name: { ar: "دمياط", en: "Damietta" } },
  { value: "sharqia", name: { ar: "الشرقية", en: "Sharqia" } },
  { value: "south-sinai", name: { ar: "جنوب سيناء", en: "South Sinai" } },
  { value: "kafr-el-sheikh", name: { ar: "كفر الشيخ", en: "Kafr El Sheikh" } },
  { value: "matrouh", name: { ar: "مطروح", en: "Matrouh" } },
  { value: "luxor", name: { ar: "الأقصر", en: "Luxor" } },
  { value: "qena", name: { ar: "قنا", en: "Qena" } },
  { value: "north-sinai", name: { ar: "شمال سيناء", en: "North Sinai" } },
  { value: "sohag", name: { ar: "سوهاج", en: "Sohag" } },
];
