import request from "supertest";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app.js";
import { db } from "@/db/client.js";
import { products } from "@/db/schema/products.js";
import { closeDb, runMigrations, truncateAll } from "./db.js";
import { seedCategory, seedProduct, seedReview, seedUser } from "./fixtures.js";
import { adminLogin, adminOrigin, csrfHeader, getCsrf } from "./helpers.js";

const app = createApp();

const ADMIN = { email: "owner@siwar.eg", password: "Owner12345", role: "super_admin" as const };
const SUPPORT = { email: "support@siwar.eg", password: "Support12345", role: "support" as const };
const CONTENT = { email: "content@siwar.eg", password: "Content12345", role: "content" as const };

let adminCookie: string;
let supportCookie: string;
let contentCookie: string;
let productId: string;

function read(path: string, cookie: string = adminCookie): request.Test {
  return request(app).get(path).set("Origin", adminOrigin).set("Cookie", cookie);
}

async function patch(
  path: string,
  body: unknown,
  cookie: string = adminCookie,
): Promise<request.Response> {
  const { token, cookie: csrfCookie } = await getCsrf(app);
  return request(app)
    .patch(path)
    .set("Origin", adminOrigin)
    .set("Cookie", `${cookie}; ${csrfCookie}`)
    .set(csrfHeader, token)
    .send(body as object);
}

async function remove(path: string, cookie: string = adminCookie): Promise<request.Response> {
  const { token, cookie: csrfCookie } = await getCsrf(app);
  return request(app)
    .delete(path)
    .set("Origin", adminOrigin)
    .set("Cookie", `${cookie}; ${csrfCookie}`)
    .set(csrfHeader, token);
}

async function productRating(): Promise<{ rating: number; reviewsCount: number }> {
  const row = await db.query.products.findFirst({ where: eq(products.id, productId) });
  if (!row) throw new Error("product not found");
  return { rating: Number(row.rating), reviewsCount: row.reviewsCount };
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
  await seedUser(SUPPORT);
  await seedUser(CONTENT);
  const category = await seedCategory({ slug: "rings" });
  const product = await seedProduct({ slug: "ring", categoryId: category.id, price: 500 });
  productId = product.id;

  adminCookie = await adminLogin(app, ADMIN);
  supportCookie = await adminLogin(app, SUPPORT);
  contentCookie = await adminLogin(app, CONTENT);
});

describe("GET /api/v1/admin/reviews", () => {
  it("requires an admin session", async () => {
    const res = await request(app).get("/api/v1/admin/reviews").set("Origin", adminOrigin);

    expect(res.status).toBe(401);
  });

  it("lists every status and filters by status", async () => {
    await seedReview({ productId, status: "pending" });
    await seedReview({ productId, status: "approved" });
    await seedReview({ productId, status: "hidden" });

    const all = await read("/api/v1/admin/reviews");
    expect(all.status).toBe(200);
    expect(all.body.total).toBe(3);

    const pending = await read("/api/v1/admin/reviews?status=pending");
    expect(pending.body.total).toBe(1);
    expect(pending.body.data[0].status).toBe("pending");
  });

  it("allows read-only staff to read but not moderate", async () => {
    const review = await seedReview({ productId, status: "pending" });

    const list = await read("/api/v1/admin/reviews", supportCookie);
    expect(list.status).toBe(200);

    const res = await patch(`/api/v1/admin/reviews/${review.id}`, { status: "approved" }, supportCookie);
    expect(res.status).toBe(403);
  });

  it("lets content staff moderate reviews", async () => {
    const review = await seedReview({ productId, status: "pending" });

    const res = await patch(`/api/v1/admin/reviews/${review.id}`, { status: "approved" }, contentCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("approved");
  });
});

describe("PATCH /api/v1/admin/reviews/:id", () => {
  it("requires a CSRF token", async () => {
    const review = await seedReview({ productId, status: "pending" });

    const res = await request(app)
      .patch(`/api/v1/admin/reviews/${review.id}`)
      .set("Origin", adminOrigin)
      .set("Cookie", adminCookie)
      .send({ status: "approved" });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("approves a review, exposes it publicly and recalculates the product rating", async () => {
    const five = await seedReview({ productId, status: "pending", rating: 5 });
    await seedReview({ productId, status: "pending", rating: 4 });

    const res = await patch(`/api/v1/admin/reviews/${five.id}`, { status: "approved" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("approved");
    expect(await productRating()).toEqual({ rating: 5, reviewsCount: 1 });

    const publicList = await request(app).get(`/api/v1/products/${productId}/reviews`);
    expect(publicList.body.total).toBe(1);
    expect(publicList.body.data[0].id).toBe(five.id);
  });

  it("hides an approved review and recalculates the product rating", async () => {
    const review = await seedReview({ productId, status: "approved", rating: 4 });
    await patch(`/api/v1/admin/reviews/${review.id}`, { status: "approved" });
    expect(await productRating()).toEqual({ rating: 4, reviewsCount: 1 });

    const res = await patch(`/api/v1/admin/reviews/${review.id}`, { status: "hidden" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("hidden");
    expect(await productRating()).toEqual({ rating: 0, reviewsCount: 0 });
  });

  it("toggles showOnHome without changing status", async () => {
    const review = await seedReview({ productId, status: "approved" });

    const res = await patch(`/api/v1/admin/reviews/${review.id}`, { showOnHome: true });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: "approved", showOnHome: true });
  });

  it("averages multiple approved reviews to one decimal place", async () => {
    const first = await seedReview({ productId, status: "pending", rating: 5 });
    const second = await seedReview({ productId, status: "pending", rating: 4 });

    await patch(`/api/v1/admin/reviews/${first.id}`, { status: "approved" });
    await patch(`/api/v1/admin/reviews/${second.id}`, { status: "approved" });

    expect(await productRating()).toEqual({ rating: 4.5, reviewsCount: 2 });

    const catalog = await request(app).get("/api/v1/products").query({ sort: "rating" });
    expect(catalog.body.data[0]).toMatchObject({ id: productId, rating: 4.5, reviewsCount: 2 });
  });

  it("rejects an invalid body and an unknown review", async () => {
    const review = await seedReview({ productId, status: "pending" });

    const empty = await patch(`/api/v1/admin/reviews/${review.id}`, {});
    expect(empty.status).toBe(400);

    const invalid = await patch(`/api/v1/admin/reviews/${review.id}`, { status: "pending" });
    expect(invalid.status).toBe(400);

    const missing = await patch(
      "/api/v1/admin/reviews/00000000-0000-4000-8000-000000000000",
      { status: "approved" },
    );
    expect(missing.status).toBe(404);
  });
});

describe("DELETE /api/v1/admin/reviews/:id", () => {
  it("deletes a review and recalculates the rating", async () => {
    const review = await seedReview({ productId, status: "approved", rating: 4 });
    await patch(`/api/v1/admin/reviews/${review.id}`, { status: "approved" });
    expect(await productRating()).toEqual({ rating: 4, reviewsCount: 1 });

    const res = await remove(`/api/v1/admin/reviews/${review.id}`);

    expect(res.status).toBe(204);
    expect(await productRating()).toEqual({ rating: 0, reviewsCount: 0 });

    const missing = await remove(`/api/v1/admin/reviews/${review.id}`);
    expect(missing.status).toBe(404);
  });

  it("deletes a seeded testimonial without touching products", async () => {
    const review = await seedReview({ isSeed: true, showOnHome: true });

    const res = await remove(`/api/v1/admin/reviews/${review.id}`);

    expect(res.status).toBe(204);
    expect(await productRating()).toEqual({ rating: 0, reviewsCount: 0 });
  });
});
