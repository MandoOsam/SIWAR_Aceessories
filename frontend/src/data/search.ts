import type { L10n } from "@/services/types";

/**
 * Mock search data.
 *
 * Popular search terms shown in the search overlay and on `/search` when the query is empty
 * (05-ui-context.md §7.6). This is the single source of truth: `src/services/catalogService.ts`
 * imports it for `GET /search/suggest` instead of holding its own copy.
 *
 * TODO(Mando): replace with real popular terms once the admin can edit them.
 */
export const popularSearches: L10n[] = [
  { ar: "سلاسل", en: "Necklaces" },
  { ar: "خواتم", en: "Rings" },
  { ar: "حلقان", en: "Earrings" },
  { ar: "سيتات", en: "Sets" },
];
