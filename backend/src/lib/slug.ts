/**
 * URL slug derivation for admin-created entities. Latin input is normalized;
 * non-Latin input (Arabic names) yields an empty string, so callers must ask
 * for an explicit slug instead of inventing one.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}
