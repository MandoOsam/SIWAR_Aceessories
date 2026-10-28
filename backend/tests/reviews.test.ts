import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app.js";
import { db } from "@/db/client.js";
import { orderItems } from "@/db/schema/orderItems.js";
import { orders } from "@/db/schema/orders.js";
import { closeDb, runMigrations, truncateAll } from "./db.js";
import { seedCategory, seedProduct, seedReview, seedUser } from "./fixtures.js";
import { csrfHeader, customerOrigin, getCsrf } from "./helpers.js";

const app = createApp();

const REVIEW_BODY = {
  authorName: "Nour Hassan",
  rating: 5,
  text: {
    ar: "الخاتم جميل جدًا والجودة ممتازة.",
    en: "The ring is beautiful and the quality is excellent.",
  },
};

let ringId: string;
let otherId: string;

function reviewBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { ...REVIEW_BODY, ...overrides };
}

async function submitReview(
  productId: string = ringId,
  body: Record<string, unknown> = reviewBody(),
  sessionCookie?: string,
): Promise<request.Response> {
  const { token, cookie } = await getCsrf(app);
  const cookies = sessionCookie === undefined ? cookie : `${sessionCookie}; ${cookie}`;
  return request(app)
    .post(`/api/v1/products/${productId}/reviews`)
    .set("Origin", customerOrigin)
    .set("Cookie", cookies)
    .set(csrfHeader, token)
    .send(body);
}

async function customerSession(email: string): Promise<string> {
  const { token, cookie } = await getCsrf(app);
  const res = await request(app)
    .post("/api/v1/auth/login")
    .set("Origin", customerOrigin)
    .set("Cookie", cookie)
    .set(csrfHeader, token)
    .send({ email, password: "Customer12345" });

  if (res.status !== 200) {
    throw new Error(`customer login failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  const setCookie = res.headers["set-cookie"] as unknown as string[];
  const pair = setCookie.find((value) => value.startsWith("siwar_sid="));
  if (!pair) throw new Error("customer session cookie not set");
  return pair.split(";")[0]!;
}

async function seedOrder(userId: string, productId: string, status: "pending" | "cancelled") {
  const [order] = await db
    .insert(orders)
    .values({
      number: `SW-9${String(Math.floor(Math.random() * 9000) + 1000)}`,
      userId,
      customerName: "Nour Hassan",
      phone: "01012345678",
      address: { governorate: "Cairo", city: "Nasr City", street: "12 Abbas El Akkad" },
      deliveryOptionId: "standard",
      subtotal: "500.00",
      shipping: "60.00",
      total: "560.00",
      paymentMethod: "cod",
      status,
    })
    .returning();
  if (!order) throw new Error("could not seed order");

  await db.insert(orderItems).values({
    orderId: order.id,
    productId,
    nameSnapshot: { ar: "خاتم", en: "Ring" },
    qty: 1,
    unitPrice: "500.00",
  });
  return order;
}

beforeAll(async () => {
  await runMigrations();
});

afterAll(async () => {
  await closeDb();
});

beforeEach(async () => {
  await truncateAll();
  const category = await seedCategory({ slug: "rings" });
  const ring = await seedProduct({ slug: "ring", categoryId: category.id, price: 500 });
  const other = await seedProduct({ slug: "necklace", categoryId: category.id, price: 350 });
  ringId = ring.id;
  otherId = other.id;
});

describe("GET /api/v1/reviews", () => {
  it("returns approved reviews only", async () => {
    await seedReview({ isSeed: true, showOnHome: true });
    await seedReview({ productId: ringId });
    await seedReview({ productId: ringId, status: "pending" });
    await seedReview({ productId: ringId, status: "hidden" });
    await seedReview({ productId: otherId });

    const res = await request(app).get("/api/v1/reviews");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.data).toHaveLength(3);
    expect(
      (res.body.data as { status: string }[]).every((review) => review.status === "approved"),
    ).toBe(true);
  });

  it("filters home testimonials", async () => {
    await seedReview({ isSeed: true, showOnHome: true });
    await seedReview({ productId: ringId });

    const res = await request(app).get("/api/v1/reviews").query({ showOnHome: "true" });

    expect(res.body.total).toBe(1);
    expect(res.body.data[0]).toMatchObject({ isSeed: true, showOnHome: true, status: "approved" });
  });

  it("filters by product and includes seeded testimonials (D-028)", async () => {
    await seedReview({ isSeed: true, showOnHome: true });
    await seedReview({ productId: ringId });
    await seedReview({ productId: otherId });

    const res = await request(app).get("/api/v1/reviews").query({ productId: ringId });

    expect(res.body.total).toBe(2);
    expect((res.body.data as { productId?: string }[]).map((review) => review.productId)).toEqual(
      expect.arrayContaining([undefined, ringId]),
    );
  });

  it("maps the stored review to the storefront contract shape", async () => {
    const seeded = await seedReview({
      productId: ringId,
      isVerifiedPurchase: true,
      images: ["https://example.com/photo.jpg"],
    });

    const res = await request(app).get("/api/v1/reviews");

    expect(res.body.data[0]).toEqual({
      id: seeded.id,
      productId: ringId,
      authorName: seeded.authorName,
      rating: 5,
      text: seeded.text,
      images: ["https://example.com/photo.jpg"],
      status: "approved",
      isSeed: false,
      isVerifiedPurchase: true,
      showOnHome: false,
      createdAt: seeded.createdAt.toISOString(),
    });
  });
});

describe("GET /api/v1/products/:id/reviews", () => {
  it("returns approved reviews for the product plus seeded testimonials", async () => {
    await seedReview({ isSeed: true, showOnHome: true });
    await seedReview({ productId: ringId });
    await seedReview({ productId: otherId });

    const res = await request(app).get(`/api/v1/products/${ringId}/reviews`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
  });

  it("returns an empty list for an unknown product", async () => {
    const res = await request(app).get(
      "/api/v1/products/00000000-0000-4000-8000-000000000000/reviews",
    );

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ data: [], total: 0, page: 1, limit: 20 });
  });

  it("rejects an id that is not a UUID", async () => {
    const res = await request(app).get("/api/v1/products/not-a-uuid/reviews");

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/v1/products/:id/reviews", () => {
  it("requires a CSRF token", async () => {
    const res = await request(app)
      .post(`/api/v1/products/${ringId}/reviews`)
      .set("Origin", customerOrigin)
      .send(reviewBody());

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("stores a guest review as pending with no verified badge", async () => {
    const res = await submitReview();

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      productId: ringId,
      status: "pending",
      isSeed: false,
      isVerifiedPurchase: false,
      showOnHome: false,
    });

    const publicList = await request(app).get(`/api/v1/products/${ringId}/reviews`);
    expect(publicList.body.total).toBe(0);
  });

  it("validates rating and bilingual text", async () => {
    const badRating = await submitReview(ringId, reviewBody({ rating: 6 }));
    expect(badRating.status).toBe(400);
    expect(badRating.body.error.code).toBe("VALIDATION_ERROR");

    const shortText = await submitReview(ringId, reviewBody({ text: { ar: "قصير", en: "short" } }));
    expect(shortText.status).toBe(400);

    const badImage = await submitReview(
      ringId,
      reviewBody({ images: ["not-a-url"] }),
    );
    expect(badImage.status).toBe(400);
  });

  it("returns 404 for an unknown or inactive product", async () => {
    const res = await submitReview("00000000-0000-4000-8000-000000000000");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("marks a signed-in customer's review as verified when they bought the product", async () => {
    const user = await seedUser({ email: "buyer@siwar.eg", password: "Customer12345" });
    await seedOrder(user.id, ringId, "pending");
    const session = await customerSession(user.email);

    const res = await submitReview(ringId, reviewBody(), session);

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ status: "pending", isVerifiedPurchase: true });
    expect(res.body.data.productId).toBe(ringId);
  });

  it("does not verify a customer whose only order was cancelled", async () => {
    const user = await seedUser({ email: "cancelled@siwar.eg", password: "Customer12345" });
    await seedOrder(user.id, ringId, "cancelled");
    const session = await customerSession(user.email);

    const res = await submitReview(ringId, reviewBody(), session);

    expect(res.status).toBe(201);
    expect(res.body.data.isVerifiedPurchase).toBe(false);
  });

  it("rejects a second review from the same customer for the same product", async () => {
    const user = await seedUser({ email: "repeat@siwar.eg", password: "Customer12345" });
    const session = await customerSession(user.email);

    const first = await submitReview(ringId, reviewBody(), session);
    expect(first.status).toBe(201);

    const second = await submitReview(ringId, reviewBody(), session);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe("CONFLICT");
  });
});
