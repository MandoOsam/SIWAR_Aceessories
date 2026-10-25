import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app.js";
import { closeDb, runMigrations, truncateAll } from "./db.js";
import { sampleHero, sampleStory, seedSettings, seedUser } from "./fixtures.js";
import { adminLogin, adminOrigin, csrfHeader, getCsrf } from "./helpers.js";

const app = createApp();

const ADMIN = { email: "owner@siwar.eg", password: "Owner12345", role: "super_admin" as const };
const CONTENT = { email: "content@siwar.eg", password: "Content12345", role: "content" as const };
const SUPPORT = { email: "support@siwar.eg", password: "Support12345", role: "support" as const };

let adminCookie: string;
let contentCookie: string;

async function mutate(
  method: "put" | "patch" | "delete",
  path: string,
  body?: unknown,
  cookie: string = adminCookie,
): Promise<request.Response> {
  const { token, cookie: csrfCookie } = await getCsrf(app);
  const agent = request(app);
  const req =
    method === "put" ? agent.put(path) : method === "patch" ? agent.patch(path) : agent.delete(path);
  req
    .set("Origin", adminOrigin)
    .set("Cookie", [cookie, csrfCookie].filter(Boolean).join("; "))
    .set(csrfHeader, token);
  if (body !== undefined) req.send(body as object);
  return req;
}

function read(path: string, cookie: string = adminCookie): request.Test {
  return request(app).get(path).set("Origin", adminOrigin).set("Cookie", cookie);
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
  await seedUser(CONTENT);
  await seedUser(SUPPORT);
  await seedSettings();
  adminCookie = await adminLogin(app, ADMIN);
  contentCookie = await adminLogin(app, CONTENT);
});

describe("admin content access", () => {
  it("requires a staff session", async () => {
    const res = await request(app).get("/api/v1/admin/content");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects a role without content permission", async () => {
    const supportCookie = await adminLogin(app, SUPPORT);
    const res = await read("/api/v1/admin/content", supportCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("requires a CSRF token on writes", async () => {
    const res = await request(app)
      .put("/api/v1/admin/content/hero")
      .set("Origin", adminOrigin)
      .set("Cookie", adminCookie)
      .send({ data: sampleHero });

    expect(res.status).toBe(403);
  });
});

describe("admin content blocks", () => {
  it("creates a block with 201, then updates it with 200", async () => {
    const created = await mutate("put", "/api/v1/admin/content/hero", {
      data: sampleHero,
      sortOrder: 10,
    });

    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ key: "hero", sortOrder: 10, isActive: true });
    expect(created.body.data.data).toEqual(sampleHero);

    const updated = await mutate("put", "/api/v1/admin/content/hero", {
      data: { ...sampleHero, headline: { ar: "جديد", en: "New" } },
      isActive: false,
    });

    expect(updated.status).toBe(200);
    expect(updated.body.data.data.headline).toEqual({ ar: "جديد", en: "New" });
    expect(updated.body.data.isActive).toBe(false);

    const list = await read("/api/v1/admin/content");
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    const one = await read("/api/v1/admin/content/hero");
    expect(one.status).toBe(200);
    expect(one.body.data.key).toBe("hero");
  });

  it("lets the content role edit content", async () => {
    const res = await mutate(
      "put",
      "/api/v1/admin/content/story",
      { data: sampleStory },
      contentCookie,
    );

    expect(res.status).toBe(201);
  });

  it("rejects data that does not match the key schema", async () => {
    const { subline: _subline, ...withoutSubline } = sampleHero;
    const res = await mutate("put", "/api/v1/admin/content/hero", { data: withoutSubline });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details[0].path).toBe("data.subline");
  });

  it("accepts a free-form key whose data is a JSON object", async () => {
    const created = await mutate("put", "/api/v1/admin/content/banner:1", {
      data: { imageUrl: "/assets/banner.svg", href: "/shop" },
      sortOrder: 5,
    });
    expect(created.status).toBe(201);

    const array = await mutate("put", "/api/v1/admin/content/banner:2", { data: [1, 2, 3] });
    expect(array.status).toBe(400);
    expect(array.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects keys outside the lowercase key pattern", async () => {
    const res = await mutate("put", "/api/v1/admin/content/Hero", { data: sampleHero });

    expect(res.status).toBe(400);
  });

  it("deletes a block with 204 and reports a missing block with 404", async () => {
    await mutate("put", "/api/v1/admin/content/hero", { data: sampleHero });

    const deleted = await mutate("delete", "/api/v1/admin/content/hero");
    expect(deleted.status).toBe(204);

    const missing = await mutate("delete", "/api/v1/admin/content/hero");
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe("NOT_FOUND");
  });
});

describe("admin pages", () => {
  const about = {
    title: { ar: "من نحن", en: "About Us" },
    body: { ar: "نص الصفحة", en: "Page body" },
  };

  it("upserts a page by slug", async () => {
    const created = await mutate("put", "/api/v1/admin/pages/about", about);
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ slug: "about", ...about });

    const updated = await mutate("put", "/api/v1/admin/pages/about", {
      ...about,
      body: { ar: "نص محدث", en: "Updated body" },
    });
    expect(updated.status).toBe(200);

    const list = await read("/api/v1/admin/pages");
    expect(list.body.data).toHaveLength(1);

    const one = await read("/api/v1/admin/pages/about");
    expect(one.body.data.body).toEqual({ ar: "نص محدث", en: "Updated body" });
  });

  it("rejects an invalid slug", async () => {
    const res = await mutate("put", "/api/v1/admin/pages/About", about);

    expect(res.status).toBe(400);
  });

  it("deletes a page with 204", async () => {
    await mutate("put", "/api/v1/admin/pages/about", about);

    const deleted = await mutate("delete", "/api/v1/admin/pages/about");
    expect(deleted.status).toBe(204);

    const missing = await read("/api/v1/admin/pages/about");
    expect(missing.status).toBe(404);
  });
});

describe("admin settings", () => {
  it("returns all payment methods and seo", async () => {
    const res = await read("/api/v1/admin/settings");

    expect(res.status).toBe(200);
    expect(res.body.data.paymentMethods).toHaveLength(2);
    expect(res.body.data.paymentMethods[1].isEnabled).toBe(false);
    expect(res.body.data).toHaveProperty("seo", null);
  });

  it("patches settings and the public endpoint reflects them", async () => {
    const res = await mutate("patch", "/api/v1/admin/settings", {
      storeName: "SIWAR Store",
      shipping: { defaultFee: 75, freeAbove: 2500 },
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      storeName: "SIWAR Store",
      shipping: { defaultFee: 75, freeAbove: 2500 },
    });

    const publicRes = await request(app).get("/api/v1/settings/public");
    expect(publicRes.body.data.storeName).toBe("SIWAR Store");
    expect(publicRes.body.data.shipping.defaultFee).toBe(75);
    expect(publicRes.body.data.paymentMethods.map((method: { id: string }) => method.id)).toEqual([
      "cod",
    ]);
  });

  it("rejects an empty patch", async () => {
    const res = await mutate("patch", "/api/v1/admin/settings", {});

    expect(res.status).toBe(400);
  });

  it("rejects an invalid currency and duplicate payment methods", async () => {
    const currency = await mutate("patch", "/api/v1/admin/settings", { currency: "egp" });
    expect(currency.status).toBe(400);

    const duplicate = await mutate("patch", "/api/v1/admin/settings", {
      paymentMethods: [
        { id: "cod", name: { ar: "دفع", en: "COD" }, isEnabled: true },
        { id: "cod", name: { ar: "دفع", en: "COD" }, isEnabled: false },
      ],
    });
    expect(duplicate.status).toBe(400);
  });

  it("forbids the content role from reading or writing settings", async () => {
    const readRes = await read("/api/v1/admin/settings", contentCookie);
    expect(readRes.status).toBe(403);

    const writeRes = await mutate(
      "patch",
      "/api/v1/admin/settings",
      { storeName: "Nope" },
      contentCookie,
    );
    expect(writeRes.status).toBe(403);
  });
});
