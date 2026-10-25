import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app.js";
import { closeDb, runMigrations, truncateAll } from "./db.js";
import { seedCategory, seedProduct, seedUser } from "./fixtures.js";
import { adminLogin, adminOrigin, csrfHeader, getCsrf } from "./helpers.js";

const app = createApp();

const ADMIN = { email: "owner@siwar.eg", password: "Owner12345", role: "super_admin" as const };
const SUPPORT = { email: "support@siwar.eg", password: "Support12345", role: "support" as const };

let adminCookie: string;

async function mutate(
  method: "post" | "patch" | "delete",
  path: string,
  body?: unknown,
  cookie: string | undefined = adminCookie,
): Promise<request.Response> {
  const { token, cookie: csrfCookie } = await getCsrf(app);
  const agent = request(app);
  const req =
    method === "post" ? agent.post(path) : method === "patch" ? agent.patch(path) : agent.delete(path);
  req
    .set("Origin", adminOrigin)
    .set("Cookie", [cookie, csrfCookie].filter(Boolean).join("; "))
    .set(csrfHeader, token);
  if (body !== undefined) req.send(body as object);
  return req;
}

const categoryPayload = {
  name: { ar: "خواتم", en: "Rings" },
  description: { ar: "خواتم ستانلس ستيل", en: "Stainless steel rings" },
  sortOrder: 1,
};

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

describe("access control", () => {
  it("rejects an admin route without a staff session", async () => {
    const { token, cookie } = await getCsrf(app);
    const res = await request(app)
      .post("/api/v1/admin/categories")
      .set("Origin", adminOrigin)
      .set("Cookie", cookie)
      .set(csrfHeader, token)
      .send(categoryPayload);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects a mutation without the CSRF header", async () => {
    const res = await request(app)
      .post("/api/v1/admin/categories")
      .set("Origin", adminOrigin)
      .set("Cookie", adminCookie)
      .send(categoryPayload);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("rejects a role without products:write", async () => {
    await seedUser(SUPPORT);
    const supportCookie = await adminLogin(app, SUPPORT);

    const res = await mutate("post", "/api/v1/admin/categories", categoryPayload, supportCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });
});

describe("POST /api/v1/admin/categories", () => {
  it("creates a category and derives the slug from the English name", async () => {
    const res = await mutate("post", "/api/v1/admin/categories", categoryPayload);

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      slug: "rings",
      name: { ar: "خواتم", en: "Rings" },
      sortOrder: 1,
      isActive: true,
      parentId: null,
      productCount: 0,
    });
  });

  it("rejects a duplicate slug with 409", async () => {
    await seedCategory({ slug: "rings" });

    const res = await mutate("post", "/api/v1/admin/categories", categoryPayload);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("validates the bilingual name", async () => {
    const res = await mutate("post", "/api/v1/admin/categories", {
      name: { ar: "خواتم" },
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details[0].path).toBe("name.en");
  });

  it("rejects an unknown parent with 422", async () => {
    const res = await mutate("post", "/api/v1/admin/categories", {
      ...categoryPayload,
      parentId: "00000000-0000-4000-8000-000000000000",
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("UNPROCESSABLE_ENTITY");
  });
});

describe("PATCH /api/v1/admin/categories/:id", () => {
  it("updates flags and moves the category under a parent", async () => {
    const parent = await seedCategory({ slug: "jewelry" });
    const category = await seedCategory({ slug: "rings", sortOrder: 1 });

    const res = await mutate("patch", `/api/v1/admin/categories/${category.id}`, {
      isActive: false,
      sortOrder: 7,
      parentId: parent.id,
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ isActive: false, sortOrder: 7, parentId: parent.id });

    const list = await request(app)
      .get("/api/v1/admin/categories?isActive=false")
      .set("Cookie", adminCookie);
    expect(list.status).toBe(200);
    expect(list.body.data.map((row: { id: string }) => row.id)).toEqual([category.id]);
  });

  it("rejects a slug already used by another category", async () => {
    await seedCategory({ slug: "rings" });
    const other = await seedCategory({ slug: "necklaces" });

    const res = await mutate("patch", `/api/v1/admin/categories/${other.id}`, { slug: "rings" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("rejects making a category its own parent", async () => {
    const category = await seedCategory({ slug: "rings" });

    const res = await mutate("patch", `/api/v1/admin/categories/${category.id}`, {
      parentId: category.id,
    });

    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await mutate(
      "patch",
      "/api/v1/admin/categories/00000000-0000-4000-8000-000000000000",
      { isActive: false },
    );

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("DELETE /api/v1/admin/categories/:id", () => {
  it("deletes an empty category", async () => {
    const category = await seedCategory({ slug: "rings" });

    const res = await mutate("delete", `/api/v1/admin/categories/${category.id}`);

    expect(res.status).toBe(204);

    const list = await request(app)
      .get("/api/v1/admin/categories")
      .set("Cookie", adminCookie);
    expect(list.body.data).toEqual([]);
  });

  it("refuses to delete a category that still has products", async () => {
    const category = await seedCategory({ slug: "rings" });
    await seedProduct({ slug: "gold-ring", categoryId: category.id, price: 780 });

    const res = await mutate("delete", `/api/v1/admin/categories/${category.id}`);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });
});
