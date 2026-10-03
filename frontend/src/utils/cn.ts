/**
 * Small class-name joiner.
 *
 * A local helper instead of `clsx`: `clsx` is only on the approved list for `admin/`, and
 * 02-architecture.md §10 allows small local utilities (03-code-standards.md §2).
 */
export type ClassValue = string | number | null | undefined | false | ClassValue[];

export function cn(...values: ClassValue[]): string {
  const out: string[] = [];

  for (const value of values) {
    if (value === null || value === undefined || value === false || value === "") {
      continue;
    }
    if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested !== "") {
        out.push(nested);
      }
      continue;
    }
    out.push(String(value));
  }

  return out.join(" ");
}
