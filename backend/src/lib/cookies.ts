import type { NextFunction, Request, Response } from "express";

/**
 * Minimal cookie header parser — avoids adding `cookie-parser` (no new
 * dependencies without approval, AGENTS.md rule 3). Only reads the Cookie
 * request header; values are URL-decoded.
 */
export function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  const out: Record<string, string> = {};
  if (!header) return out;

  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const raw = part.slice(eq + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(raw);
    } catch {
      out[key] = raw;
    }
  }
  return out;
}

/** Populates `req.cookies` once, so downstream middlewares can read it. */
export function cookieParserMiddleware() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.cookies = parseCookies(req);
    next();
  };
}
