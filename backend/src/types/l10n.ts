/** Bilingual field stored as `jsonb` in the database and returned as-is by the API. */
export type L10n = { ar: string; en: string };

/** Per-entity SEO overrides (02-architecture section 6). */
export type Seo = {
  title?: L10n;
  description?: L10n;
};
