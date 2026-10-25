import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app.js";
import { closeDb, runMigrations, truncateAll } from "./db.js";
import { seedCategory, seedProduct, seedUser } from "./fixtures.js";
import { adminLogin, adminOrigin, csrfHeader, getCsrf } from "./helpers.js";

const app = createApp();

const ADMIN = { email: "owner@siwar.eg", password: "Owner12345", role: "super_admin" as const };

let adminCookie: string;

async function mutate(
  method: "post" | "patch" | "delete",
  path: string,
  body?: unknown,
): Promise<request.Response> {
  const { token, cookie } = await getCsrf(app);
  const agent = request(app);
  const req =
    method === "post" ? agent.post(path) : method === "patch" ? agent.patch(path) : agent.delete(path);
  req
    .set("Origin", adminOrigin)
    .set("Cookie", [adminCookie, cookie].filter(Boolean).join("; "))
    .set(csrfHeader, token);
  if (body !== undefined) req.send(body as object);
  return req;
}

const productPayload = {
  name: { ar: "خاتم ذهبي", en: "Gold Ring" },
  description: { ar: "خاتم ستانلس ستيل", en: "Stainless steel ring" },
  price: 780,
  stock: 5,
};

const image = (name: string, isPrimary?: boolean) => ({
  url: `https://res.cloudinary.com/test-cloud/image/upload/${name}.webp`,
  ...(isPrimary === undefined ? {} : { isPrimary }),
});

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

describe("POST /api/v1/admin/products", () => {
  it("creates a draft product with a derived slug, SKU and gallery", async () => {
    const category = await seedCategory({ slug: "rings" });

    const res = await mutate("post", "/api/v1/admin/products", {
      ...productPayload,
      categoryId: category.id,
      images: [image("gold"), image("silver")],
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      slug: "gold-ring",
      sku: "SW-GOLD-RING",
      price: 780,
      status: "draft",
      stock: 5,
      lowStockThreshold: 5,
      category: { id: category.id, slug: "rings" },
    });
    expect(res.body.data.images).toHaveLength(2);
    expect(res.body.data.images[0]).toMatchObject({ isPrimary: true, alt: productPayload.name });
    expect(res.body.data.images[1].isPrimary).toBe(false);
  });

  it("computes the discount percent from the compare-at price", async () => {
    const category = await seedCategory({ slug: "rings" });

    const res = await mutate("post", "/api/v1/admin/products", {
      ...productPayload,
      categoryId: category.id,
      oldPrice: 900,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.oldPrice).toBe(900);
    expect(res.body.data.discountPercent).toBe(13);
  });

  it("rejects a compare-at price below the selling price", async () => {
    const category = await seedCategory({ slug: "rings" });

    const res = await mutate("post", "/api/v1/admin/products", {
      ...productPayload,
      categoryId: category.id,
      oldPrice: 700,
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects an unknown category with 422", async () => {
    const res = await mutate("post", "/api/v1/admin/products", {
      ...productPayload,
      categoryId: "00000000-0000-4000-8000-000000000000",
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("UNPROCESSABLE_ENTITY");
  });

  it("rejects a duplicate SKU with 409", async () => {
    const category = await seedCategory({ slug: "rings" });
    await seedProduct({ slug: "gold-ring", categoryId: category.id, price: 780 });

    const res = await mutate("post", "/api/v1/admin/products", {
      ...productPayload,
      categoryId: category.id,
      slug: "silver-ring",
      sku: "SW-GOLD-RING",
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("requires the bilingual name and a price", async () => {
    const category = await seedCategory({ slug: "rings" });

    const res = await mutate("post", "/api/v1/admin/products", {
      categoryId: category.id,
      description: productPayload.description,
    });

    expect(res.status).toBe(400);
    const paths = res.body.error.details.map((detail: { path: string }) => detail.path);
    expect(paths).toContain("name");
    expect(paths).toContain("price");
  });
});

describe("GET /api/v1/admin/products", () => {
  it("includes drafts and filters by status, category and search", async () => {
    const rings = await seedCategory({ slug: "rings" });
    const necklaces = await seedCategory({ slug: "necklaces" });
    await seedProduct({ slug: "gold-ring", categoryId: rings.id, price: 780, status: "draft" });
    await seedProduct({
      slug: "silver-ring",
      categoryId: rings.id,
      price: 640,
      status: "active",
      createdAt: new Date("2026-02-01T00:00:00.000Z"),
    });
    await seedProduct({ slug: "gold-necklace", categoryId: necklaces.id, price: 1200 });

    const drafts = await request(app)
      .get("/api/v1/admin/products?status=draft")
      .set("Cookie", adminCookie);
    expect(drafts.status).toBe(200);
    expect(drafts.body.total).toBe(1);
    expect(drafts.body.data[0].slug).toBe("gold-ring");

    const byCategory = await request(app)
      .get("/api/v1/admin/products?category=rings")
      .set("Cookie", adminCookie);
    expect(byCategory.body.total).toBe(2);

    const bySearch = await request(app)
      .get("/api/v1/admin/products?search=necklace")
      .set("Cookie", adminCookie);
    expect(bySearch.body.total).toBe(1);
    expect(bySearch.body.data[0].slug).toBe("gold-necklace");

    const sorted = await request(app)
      .get("/api/v1/admin/products?sort=price-desc")
      .set("Cookie", adminCookie);
    expect(sorted.body.data.map((row: { price: number }) => row.price)).toEqual([1200, 780, 640]);
  });

  it("returns 404 for an unknown product id", async () => {
    const res = await request(app)
      .get("/api/v1/admin/products/00000000-0000-4000-8000-000000000000")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("PATCH /api/v1/admin/products/:id", () => {
  it("updates price, stock and status, and the storefront sees the active product", async () => {
    const category = await seedCategory({ slug: "rings" });
    const product = await seedProduct({
      slug: "gold-ring",
      categoryId: category.id,
      price: 780,
      stock: 10,
      status: "draft",
    });

    const res = await mutate("patch", `/api/v1/admin/products/${product.id}`, {
      price: 900,
      stock: 2,
      status: "active",
      isNew: true,
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ price: 900, stock: 2, status: "active", isNew: true });

    const admin = await request(app)
      .get(`/api/v1/admin/products/${product.id}`)
      .set("Cookie", adminCookie);
    expect(admin.body.data.price).toBe(900);

    const storefront = await request(app).get("/api/v1/products/gold-ring");
    expect(storefront.status).toBe(200);
    expect(storefront.body.data.product.price).toBe(900);
  });

  it("replaces the gallery when images are sent", async () => {
    const category = await seedCategory({ slug: "rings" });
    const product = await seedProduct({ slug: "gold-ring", categoryId: category.id, price: 780 });

    const res = await mutate("patch", `/api/v1/admin/products/${product.id}`, {
      images: [image("front"), image("side", true)],
    });

    expect(res.status).toBe(200);
    expect(res.body.data.images).toHaveLength(2);
    expect(res.body.data.images[0].isPrimary).toBe(true);
    expect(res.body.data.images[0].url).toContain("side.webp");
  });

  it("clears the gallery when an empty list is sent", async () => {
    const category = await seedCategory({ slug: "rings" });
    const product = await seedProduct({ slug: "gold-ring", categoryId: category.id, price: 780 });

    const res = await mutate("patch", `/api/v1/admin/products/${product.id}`, { images: [] });

    expect(res.status).toBe(200);
    expect(res.body.data.images).toEqual([]);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await mutate(
      "patch",
      "/api/v1/admin/products/00000000-0000-4000-8000-000000000000",
      { stock: 1 },
    );

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/v1/admin/products/:id", () => {
  it("deletes the product and its gallery", async () => {
    const category = await seedCategory({ slug: "rings" });
    const product = await seedProduct({ slug: "gold-ring", categoryId: category.id, price: 780 });

    const res = await mutate("delete", `/api/v1/admin/products/${product.id}`);

    expect(res.status).toBe(204);

    const admin = await request(app)
      .get("/api/v1/admin/products")
      .set("Cookie", adminCookie);
    expect(admin.body.total).toBe(0);

    const storefront = await request(app).get("/api/v1/products");
    expect(storefront.body.total).toBe(0);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await mutate(
      "delete",
      "/api/v1/admin/products/00000000-0000-4000-8000-000000000000",
    );

    expect(res.status).toBe(404);
  });
});
