import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app.js";
import { closeDb, runMigrations, truncateAll } from "./db.js";
import { seedUser } from "./fixtures.js";
import { adminLogin, adminOrigin, csrfHeader, getCsrf } from "./helpers.js";

const app = createApp();

const ADMIN = { email: "owner@siwar.eg", password: "Owner12345", role: "super_admin" as const };
const SUPPORT = { email: "support@siwar.eg", password: "Support12345", role: "support" as const };

let adminCookie: string;

async function sign(body: unknown, cookie: string | undefined = adminCookie) {
  const { token, cookie: csrfCookie } = await getCsrf(app);
  return request(app)
    .post("/api/v1/admin/uploads/sign")
    .set("Origin", adminOrigin)
    .set("Cookie", [cookie, csrfCookie].filter(Boolean).join("; "))
    .set(csrfHeader, token)
    .send(body as object);
}

beforeAll(async () => {
  await runMigrations();
});

afterAll(async () => {
  await closeDb();
});

beforeEach(async () => {
  await truncateAll();
  await seedUser(ADMIN);
  adminCookie = await adminLogin(app, ADMIN);
});

describe("POST /api/v1/admin/uploads/sign", () => {
  it("returns a Cloudinary signature scoped to the product folder", async () => {
    const res = await sign({});

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      cloudName: "test-cloud",
      apiKey: "test-key",
      folder: "siwar/products",
      uploadUrl: "https://api.cloudinary.com/v1_1/test-cloud/image/upload",
      maxBytes: 5 * 1024 * 1024,
    });
    expect(res.body.data.signature).toMatch(/^[a-f0-9]{40}$/);
    expect(res.body.data.timestamp).toBeGreaterThan(0);
    expect(res.body.data.allowedFormats).toContain("webp");
  });

  it("uses the folder requested by scope and does not leak the API secret", async () => {
    const res = await sign({ scope: "category" });

    expect(res.status).toBe(200);
    expect(res.body.data.folder).toBe("siwar/categories");
    expect(JSON.stringify(res.body)).not.toContain("test-secret");
  });

  it("is rate limited", async () => {
    const res = await sign({});

    const limit =
      res.headers["ratelimit-policy"] ?? res.headers["ratelimit"] ?? res.headers["x-ratelimit-limit"];
    expect(limit).toBeDefined();
  });

  it("rejects an unknown scope", async () => {
    const res = await sign({ scope: "avatars" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("requires a staff session", async () => {
    const { token, cookie } = await getCsrf(app);
    const res = await request(app)
      .post("/api/v1/admin/uploads/sign")
      .set("Origin", adminOrigin)
      .set("Cookie", cookie)
      .set(csrfHeader, token)
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects a staff role without write permission", async () => {
    await seedUser(SUPPORT);
    const supportCookie = await adminLogin(app, SUPPORT);

    const res = await sign({}, supportCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });
});
