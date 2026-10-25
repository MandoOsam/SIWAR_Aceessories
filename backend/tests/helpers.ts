import request from "supertest";
import type { Express } from "express";

export const csrfCookieName = "siwar_csrf";
export const csrfHeader = "x-csrf-token";

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
