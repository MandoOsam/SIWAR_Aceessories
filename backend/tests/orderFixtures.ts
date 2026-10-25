import request from "supertest";

import { createApp } from "@/app.js";
import type { CreateOrderInput } from "@/modules/orders/schema.js";
import { truncateAll } from "./db.js";
import {
  seedCategory,
  seedCoupon,
  seedProduct,
  seedSettings,
} from "./fixtures.js";
import { csrfHeader, customerOrigin, getCsrf } from "./helpers.js";

export const app = createApp();

export const CUSTOMER = { name: "Nour Hassan", phone: "01012345678" };
export const ADDRESS = {
  governorate: "Cairo",
  city: "Nasr City",
  street: "12 Abbas El Akkad",
  building: "4",
};

export type SeededOrders = {
  ringId: string;
  pendantId: string;
  necklaceId: string;
  draftId: string;
  cheapId: string;
};

let seeded: SeededOrders;

/** Products, settings and coupons seeded by the last `resetOrders` call. */
export function currentSeed(): SeededOrders {
  return seeded;
}

/** Truncates the schema and seeds products, settings and every coupon rule. */
export async function resetOrders(): Promise<void> {
  await truncateAll();

  const category = await seedCategory({ slug: "rings" });
  const ring = await seedProduct({
    slug: "ring",
    categoryId: category.id,
    price: 500,
    stock: 5,
    colors: ["gold", "silver"],
    sizes: ["50", "52"],
  });
  const pendant = await seedProduct({
    slug: "pendant",
    categoryId: category.id,
    price: 200,
    stock: 0,
  });
  const necklace = await seedProduct({
    slug: "necklace",
    categoryId: category.id,
    price: 3500,
    stock: 2,
  });
  const draft = await seedProduct({
    slug: "draft",
    categoryId: category.id,
    price: 100,
    stock: 10,
    status: "draft",
  });
  const cheap = await seedProduct({
    slug: "cheap",
    categoryId: category.id,
    price: 100,
    stock: 5,
  });

  seeded = {
    ringId: ring.id,
    pendantId: pendant.id,
    necklaceId: necklace.id,
    draftId: draft.id,
    cheapId: cheap.id,
  };

  await seedSettings();
  await seedCoupon({ code: "SIWAR10", type: "percent", value: 10 });
  await seedCoupon({ code: "WELCOME50", type: "fixed", value: 50, minOrder: 300 });
  await seedCoupon({ code: "FREESHIP", type: "fixed", value: 0, freeShipping: true });
  await seedCoupon({
    code: "LIMITED",
    value: 10,
    usageLimit: 1,
    usedCount: 1,
  });
  await seedCoupon({
    code: "EXPIRED",
    value: 10,
    expiresAt: new Date("2020-01-01T00:00:00.000Z"),
  });
  await seedCoupon({ code: "OFF", value: 10, isActive: false });
}

export function orderInput(overrides: Partial<CreateOrderInput> = {}): CreateOrderInput {
  return {
    customer: CUSTOMER,
    address: ADDRESS,
    deliveryOptionId: "standard",
    paymentMethod: "cod",
    items: [{ productId: seeded.ringId, variant: { color: "gold", size: "50" }, qty: 2 }],
    ...overrides,
  };
}

export async function post(path: string, body: unknown): Promise<request.Response> {
  const { token, cookie } = await getCsrf(app);

  return request(app)
    .post(path)
    .set("Origin", customerOrigin)
    .set("Cookie", cookie)
    .set(csrfHeader, token)
    .send(body as object);
}

export function createOrder(body: CreateOrderInput): Promise<request.Response> {
  return post("/api/v1/orders", body);
}

export function track(number: string, phone: string = CUSTOMER.phone) {
  return request(app).get("/api/v1/orders/track").query({ number, phone });
}
