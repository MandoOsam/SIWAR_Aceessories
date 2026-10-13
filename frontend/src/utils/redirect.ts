/**
 * Keeps the post-login `?redirect=` target safe.
 *
 * Only same-app absolute paths are allowed, so a crafted `${ROUTES.login}?redirect=https://evil`
 * or `//evil` link can never bounce the customer off-site (03-code-standards.md §8).
 */
export function safeInternalPath(value: string | null, fallback: string): string {
  if (value === null || value === "") {
    return fallback;
  }
  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

/** `/login?redirect=<path>` — where an unauthenticated visitor is sent, with a return target. */
export function loginRedirectPath(path: string): string {
  return `/login?redirect=${encodeURIComponent(path)}`;
}
