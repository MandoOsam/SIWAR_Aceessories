import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app.js";
import { closeDb, runMigrations, truncateAll } from "./db.js";
import { seedUser } from "./fixtures.js";
import { csrfHeader, getCsrf } from "./helpers.js";

const app = createApp();

const ADMIN_ORIGIN = "http://localhost:5174";
const CUSTOMER_ORIGIN = "http://localhost:5173";

const STAFF = { email: "owner@siwar.eg", password: "Owner12345", role: "super_admin" as const };
const CUSTOMER = { email: "shopper@siwar.eg", password: "Shopper12345" };

function cookieValue(res: request.Response, name: string): string {
  const cookies = res.headers["set-cookie"];
  const list = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
  const pair = list.find((c: string) => c.startsWith(`${name}=`));
  if (!pair) throw new Error(`cookie ${name} not set`);
  return pair.split(";")[0]!;
}

async function post(
  path: string,
  body: Record<string, unknown>,
  origin = ADMIN_ORIGIN,
  cookie?: string,
) {
  const { token, cookie: csrfCookie } = await getCsrf(app);
  return request(app)
    .post(path)
    .set("Origin", origin)
    .set("Cookie", [cookie, csrfCookie].filter(Boolean).join("; "))
    .set(csrfHeader, token)
    .send(body);
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

describe("POST /api/v1/admin/auth/login", () => {
  it("logs a staff account in and sets the admin cookie", async () => {
    await seedUser(STAFF);

    const res = await post("/api/v1/admin/auth/login", {
      email: STAFF.email,
      password: STAFF.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ email: STAFF.email, role: "super_admin" });
    expect(res.body.data.passwordHash).toBeUndefined();
    expect(cookieValue(res, "siwar_admin_sid")).toBeTruthy();
  });

  it("never sets the customer cookie", async () => {
    await seedUser(STAFF);

    const res = await post("/api/v1/admin/auth/login", {
      email: STAFF.email,
      password: STAFF.password,
    });

    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies.some((c: string) => c.startsWith("siwar_sid="))).toBe(false);
  });

  it("rejects a customer account with 401", async () => {
    await seedUser(CUSTOMER);

    const res = await post("/api/v1/admin/auth/login", {
      email: CUSTOMER.email,
      password: CUSTOMER.password,
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects a wrong password with 401", async () => {
    await seedUser(STAFF);

    const res = await post("/api/v1/admin/auth/login", {
      email: STAFF.email,
      password: "WrongPass123",
    });

    expect(res.status).toBe(401);
  });

  it("rejects a deactivated staff account", async () => {
    await seedUser({ ...STAFF, isActive: false });

    const res = await post("/api/v1/admin/auth/login", {
      email: STAFF.email,
      password: STAFF.password,
    });

    expect(res.status).toBe(401);
  });

  it("rejects a mutation without a CSRF token with 403", async () => {
    await seedUser(STAFF);

    const res = await request(app)
      .post("/api/v1/admin/auth/login")
      .set("Origin", ADMIN_ORIGIN)
      .send({ email: STAFF.email, password: STAFF.password });

    expect(res.status).toBe(403);
  });
});

describe("GET /api/v1/admin/auth/me", () => {
  it("returns the staff user for a valid admin session", async () => {
    await seedUser(STAFF);
    const login = await post("/api/v1/admin/auth/login", {
      email: STAFF.email,
      password: STAFF.password,
    });
    const adminCookie = cookieValue(login, "siwar_admin_sid");

    const res = await request(app).get("/api/v1/admin/auth/me").set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe("super_admin");
  });

  it("returns 401 without an admin session", async () => {
    const res = await request(app).get("/api/v1/admin/auth/me");

    expect(res.status).toBe(401);
  });

  it("rejects a customer session id presented as the admin cookie", async () => {
    const reg = await post(
      "/api/v1/auth/register",
      { email: CUSTOMER.email, password: CUSTOMER.password, name: "Shopper" },
      CUSTOMER_ORIGIN,
    );
    const customerCookie = cookieValue(reg, "siwar_sid");

    const res = await request(app)
      .get("/api/v1/admin/auth/me")
      .set("Cookie", `siwar_admin_sid=${customerCookie.split("=")[1]}`);

    expect(res.status).toBe(401);
  });
});

describe("session isolation", () => {
  it("does not let an admin session open the customer endpoints", async () => {
    await seedUser(STAFF);
    const login = await post("/api/v1/admin/auth/login", {
      email: STAFF.email,
      password: STAFF.password,
    });
    const adminCookie = cookieValue(login, "siwar_admin_sid");

    const res = await request(app).get("/api/v1/auth/me").set("Cookie", adminCookie);

    expect(res.status).toBe(401);
  });

  it("does not let a customer session open the admin endpoints", async () => {
    const reg = await post(
      "/api/v1/auth/register",
      { email: CUSTOMER.email, password: CUSTOMER.password, name: "Shopper" },
      CUSTOMER_ORIGIN,
    );
    const customerCookie = cookieValue(reg, "siwar_sid");

    const res = await request(app).get("/api/v1/admin/auth/me").set("Cookie", customerCookie);

    expect(res.status).toBe(401);
  });
});

describe("POST /api/v1/admin/auth/logout", () => {
  it("deletes the admin session so /admin/auth/me then returns 401", async () => {
    await seedUser(STAFF);
    const login = await post("/api/v1/admin/auth/login", {
      email: STAFF.email,
      password: STAFF.password,
    });
    const adminCookie = cookieValue(login, "siwar_admin_sid");

    const logout = await post("/api/v1/admin/auth/logout", {}, ADMIN_ORIGIN, adminCookie);
    expect(logout.status).toBe(204);

    const me = await request(app).get("/api/v1/admin/auth/me").set("Cookie", adminCookie);
    expect(me.status).toBe(401);
  });
});
