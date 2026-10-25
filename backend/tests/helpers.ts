import request from "supertest";
import type { Express } from "express";

export const csrfCookieName = "siwar_csrf";
export const csrfHeader = "x-csrf-token";
export const adminOrigin = "http://localhost:5174";
export const customerOrigin = "http://localhost:5173";

/** Fetches a fresh CSRF token, returning the token and the raw cookie pair. */
export async function getCsrf(app: Express): Promise<{ token: string; cookie: string }> {
  const res = await request(app).get("/api/v1/auth/csrf");
  const setCookie = res.headers["set-cookie"];
  const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  const csrfPair = cookies.find((c) => c.startsWith(`${csrfCookieName}=`));
  if (!csrfPair) throw new Error("CSRF cookie not set");
  const cookie = csrfPair.split(";")[0]!;
  return { token: res.body.data.csrfToken as string, cookie };
}

/**
 * Logs a seeded staff account in and returns the `siwar_admin_sid` cookie pair.
 * Admin tests need a real session because the guard is the production one.
 */
export async function adminLogin(
  app: Express,
  credentials: { email: string; password: string },
): Promise<string> {
  const { token, cookie } = await getCsrf(app);
  const res = await request(app)
    .post("/api/v1/admin/auth/login")
    .set("Origin", adminOrigin)
    .set("Cookie", cookie)
    .set(csrfHeader, token)
    .send(credentials);

  if (res.status !== 200) {
    throw new Error(`admin login failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  const setCookie = res.headers["set-cookie"];
  const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  const pair = cookies.find((c) => c.startsWith("siwar_admin_sid="));
  if (!pair) throw new Error("admin session cookie not set");
  return pair.split(";")[0]!;
}
