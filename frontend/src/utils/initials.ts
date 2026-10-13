/**
 * Initials for the account avatar placeholder.
 *
 * Avatar uploads arrive later (F6.4+), so the account area shows the first letters of the customer's
 * name instead of an empty image. Pure, so both the layout and the profile page share one rule.
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  if (first === undefined) {
    return "";
  }
  const last = words.length > 1 ? words[words.length - 1] : undefined;
  const initials = `${first.charAt(0)}${last === undefined ? "" : last.charAt(0)}`;
  return initials.toUpperCase();
}
