import request from "supertest";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/db/client.js";
import { coupons } from "@/db/schema/coupons.js";
import { products } from "@/db/schema/products.js";
import { closeDb, runMigrations } from "./db.js";
import {
  app,
  createOrder,
  currentSeed,
  orderInput,
  resetOrders,
  track,
} from "./orderFixtures.js";
import { customerOrigin } from "./helpers.js";

beforeAll(async () => {
  await runMigrations();
});

afterAll(async () => {
  await closeDb();
});

beforeEach(async () => {
  await resetOrders();
});

describe("POST /orders", () => {
  it("requires a CSRF token", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .set("Origin", customerOrigin)
      .send(orderInput());

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("rejects an empty cart", async () => {
    const res = await createOrder(orderInput({ items: [] }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("recomputes totals, decrements stock and writes the first timeline event", async () => {
    const res = await createOrder(orderInput());

    expect(res.status).toBe(201);
    expect(res.body.data.number).toBe("SW-10025");
    expect(res.body.data.total).toBe(1060);
    expect(typeof res.body.data.id).toBe("string");

    const product = await db.query.products.findFirst({ where: eq(products.id, currentSeed().ringId) });
    expect(product?.stock).toBe(3);

    const tracked = await track("sw-10025", "0101 234 5678");

    expect(tracked.status).toBe(200);
    expect(tracked.body.data.status).toBe("pending");
    expect(tracked.body.data.items).toEqual([
      expect.objectContaining({ productId: currentSeed().ringId, qty: 2, unitPrice: 500, lineTotal: 1000 }),
    ]);
    expect(tracked.body.data.timeline).toEqual([
      expect.objectContaining({ status: "pending", note: "Order created" }),
    ]);
    expect(tracked.body.data.estimatedDelivery).toBeTruthy();
  });

  it("merges duplicate lines and checks their combined quantity", async () => {
    const line = { productId: currentSeed().ringId, variant: { color: "gold" }, qty: 1 };
    const res = await createOrder(orderInput({ items: [line, line] }));

    expect(res.status).toBe(201);
    const tracked = await track(res.body.data.number as string);
    expect(tracked.body.data.items).toHaveLength(1);
    expect(tracked.body.data.items[0].qty).toBe(2);
  });

  it("makes standard shipping free above the threshold", async () => {
    const res = await createOrder(
      orderInput({
        items: [{ productId: currentSeed().necklaceId, variant: {}, qty: 1 }],
      }),
    );

    expect(res.status).toBe(201);
    expect(res.body.data.total).toBe(3500);
  });

  it("charges the express fee from settings", async () => {
    const res = await createOrder(orderInput({ deliveryOptionId: "express" }));

    expect(res.status).toBe(201);
    expect(res.body.data.total).toBe(1120);
  });

  it("applies a percentage coupon and counts the usage", async () => {
    const res = await createOrder(orderInput({ couponCode: "siwar10" }));

    expect(res.status).toBe(201);
    expect(res.body.data.total).toBe(960);

    const coupon = await db.query.coupons.findFirst({ where: eq(coupons.code, "SIWAR10") });
    expect(coupon?.usedCount).toBe(1);

    const tracked = await track(res.body.data.number as string);
    expect(tracked.body.data.couponCode).toBe("SIWAR10");
    expect(tracked.body.data.discount).toBe(100);
  });

  it("frees shipping with FREESHIP without touching the subtotal", async () => {
    const res = await createOrder(orderInput({ couponCode: "FREESHIP" }));

    expect(res.status).toBe(201);
    expect(res.body.data.total).toBe(1000);
  });

  it.each(["WELCOME50", "EXPIRED", "LIMITED", "OFF", "UNKNOWN"])(
    "rejects the %s coupon without creating an order",
    async (couponCode) => {
      const res = await createOrder(
        orderInput({
          couponCode,
          items: [{ productId: currentSeed().cheapId, variant: {}, qty: 1 }],
        }),
      );

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("UNPROCESSABLE_ENTITY");
      expect(res.body.error.details[0].path).toBe("couponCode");
    },
  );

  it("rejects an unknown product", async () => {
    const res = await createOrder(
      orderInput({
        items: [{ productId: "018f6f6e-6d3a-7c2b-9e5a-1c2d3e4f5a6b", variant: {}, qty: 1 }],
      }),
    );

    expect(res.status).toBe(422);
    expect(res.body.error.details[0].path).toBe("items.0.productId");
  });

  it("rejects a draft product", async () => {
    const res = await createOrder(
      orderInput({ items: [{ productId: currentSeed().draftId, variant: {}, qty: 1 }] }),
    );

    expect(res.status).toBe(422);
    expect(res.body.error.message).toBe("Product is not available");
  });

  it("rejects a quantity above the available stock and keeps the stock intact", async () => {
    const res = await createOrder(
      orderInput({ items: [{ productId: currentSeed().ringId, variant: {}, qty: 6 }] }),
    );

    expect(res.status).toBe(422);
    expect(res.body.error.message).toBe("Only 5 left in stock");

    const product = await db.query.products.findFirst({ where: eq(products.id, currentSeed().ringId) });
    expect(product?.stock).toBe(5);
  });

  it("rejects a variant the product does not offer", async () => {
    const res = await createOrder(
      orderInput({
        items: [{ productId: currentSeed().ringId, variant: { color: "rose-gold" }, qty: 1 }],
      }),
    );

    expect(res.status).toBe(422);
    expect(res.body.error.details[0].path).toBe("items.0.variant.color");
  });

  it("rejects a disabled payment method", async () => {
    const res = await createOrder(orderInput({ paymentMethod: "instapay" }));

    expect(res.status).toBe(422);
    expect(res.body.error.details[0].path).toBe("paymentMethod");
  });
});
