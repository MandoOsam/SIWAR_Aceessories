import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app.js";
import { closeDb, runMigrations, truncateAll } from "./db.js";
import { csrfHeader, getCsrf } from "./helpers.js";

const app = createApp();

const REGISTER_BODY = {
  email: "customer@siwar.eg",
  password: "Siwar1234",
  name: "Test Customer",
};

async function registerUser(body: Record<string, unknown> = REGISTER_BODY) {
  const { token, cookie } = await getCsrf(app);
  return request(app)
    .post("/api/v1/auth/register")
    .set("Origin", "http://localhost:5173")
    .set("Cookie", cookie)
    .set(csrfHeader, token)
    .send(body);
}

async function loginUser(body: Record<string, unknown>) {
  const { token, cookie } = await getCsrf(app);
  return request(app)
    .post("/api/v1/auth/login")
    .set("Origin", "http://localhost:5173")
    .set("Cookie", cookie)
    .set(csrfHeader, token)
    .send(body);
}

function setCookieHeader(res: request.Response): string {
  const raw = res.headers["set-cookie"] as unknown as string[] | string | undefined;
  if (!raw) return "";
  return Array.isArray(raw) ? raw.join(";") : raw;
}

beforeAll(async () => {
  await runMigrations();
});

afterAll(async () => {
  await closeDb();
});

beforeEach(async () => {
  await truncateAll();
});

describe("POST /api/v1/auth/register", () => {
  it("registers a new customer and sets a session cookie", async () => {
    const res = await registerUser();

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      email: REGISTER_BODY.email,
      name: REGISTER_BODY.name,
      role: "customer",
    });
    expect(res.body.data.passwordHash).toBeUndefined();
    expect(setCookieHeader(res)).toContain("siwar_sid=");
  });

  it("rejects a duplicate email with 409", async () => {
    await registerUser();
    const res = await registerUser();

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("rejects a weak password with 400", async () => {
    const res = await registerUser({ ...REGISTER_BODY, password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a mutation without a CSRF token with 403", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .set("Origin", "http://localhost:5173")
      .send(REGISTER_BODY);

    expect(res.status).toBe(403);
  });

  it("answers a malformed JSON body with 400 and the contract error shape", async () => {
    const { token, cookie } = await getCsrf(app);
    const res = await request(app)
      .post("/api/v1/auth/login")
      .set("Origin", "http://localhost:5173")
      .set("Cookie", cookie)
      .set(csrfHeader, token)
      .set("Content-Type", "application/json")
      .send("{not json");

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/v1/auth/login", () => {
  beforeEach(async () => {
    await registerUser();
  });

  it("logs in with correct credentials", async () => {
    const res = await loginUser({
      email: REGISTER_BODY.email,
      password: REGISTER_BODY.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(REGISTER_BODY.email);
    expect(setCookieHeader(res)).toContain("siwar_sid=");
  });

  it("rejects a wrong password with 401", async () => {
    const res = await loginUser({ email: REGISTER_BODY.email, password: "WrongPass123" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects an unknown email with 401", async () => {
    const res = await loginUser({ email: "nobody@siwar.eg", password: "Siwar1234" });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/auth/me", () => {
  it("returns the current user for a valid session", async () => {
    const reg = await registerUser();
    const sessionCookie = extractSessionCookie(reg);

    const res = await request(app).get("/api/v1/auth/me").set("Cookie", sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(REGISTER_BODY.email);
  });

  it("returns 401 without a session", async () => {
    const res = await request(app).get("/api/v1/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
});

describe("POST /api/v1/auth/logout", () => {
  it("deletes the session so /me then returns 401", async () => {
    const reg = await registerUser();
    const sessionCookie = extractSessionCookie(reg);
    const { token, cookie } = await getCsrf(app);

    const logout = await request(app)
      .post("/api/v1/auth/logout")
      .set("Origin", "http://localhost:5173")
      .set("Cookie", `${sessionCookie}; ${cookie}`)
      .set(csrfHeader, token);

    expect(logout.status).toBe(204);

    const me = await request(app).get("/api/v1/auth/me").set("Cookie", sessionCookie);
    expect(me.status).toBe(401);
  });
});

function extractSessionCookie(res: request.Response): string {
  const cookies = res.headers["set-cookie"];
  const list = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
  const pair = list.find((c: string) => c.startsWith("siwar_sid="));
  if (!pair) throw new Error("session cookie not set");
  return pair.split(";")[0]!;
}
