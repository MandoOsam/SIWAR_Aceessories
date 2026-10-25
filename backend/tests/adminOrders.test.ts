import request from "supertest";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app.js";
import { db } from "@/db/client.js";
import { orderEvents } from "@/db/schema/orderEvents.js";
import { closeDb, runMigrations, truncateAll } from "./db.js";
import { seedCategory, seedProduct, seedSettings, seedUser } from "./fixtures.js";
import { adminLogin, adminOrigin, csrfHeader, customerOrigin, getCsrf } from "./helpers.js";

const app = createApp();

const ADMIN = { email: "owner@siwar.eg", password: "Owner12345", role: "super_admin" as const };
const SUPPORT = { email: "support@siwar.eg", password: "Support12345", role: "support" as const };
const CONTENT = { email: "content@siwar.eg", password: "Content12345", role: "content" as const };

let adminCookie: string;
let supportCookie: string;
let adminId: string;
let productId: string;

async function guestPost(path: string, body: unknown): Promise<request.Response> {
  const { token, cookie } = await getCsrf(app);
  return request(app)
    .post(path)
    .set("Origin", customerOrigin)
    .set("Cookie", cookie)
    .set(csrfHeader, token)
    .send(body as object);
}

function orderBody(): Record<string, unknown> {
  return {
    customer: { name: "Nour Hassan", phone: "01012345678" },
    address: { governorate: "Cairo", city: "Nasr City", street: "12 Abbas El Akkad" },
    deliveryOptionId: "standard",
    paymentMethod: "cod",
    items: [{ productId, variant: {}, qty: 1 }],
  };
}

async function createOrder(): Promise<{ id: string; number: string }> {
  const res = await guestPost("/api/v1/orders", orderBody());
  if (res.status !== 201) throw new Error(`order failed: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.data as { id: string; number: string };
}

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

async function eventsFor(orderId: string) {
  return db.query.orderEvents.findMany({ where: eq(orderEvents.orderId, orderId) });
}

beforeAll(async () => {
  await runMigrations();
});

afterAll(async () => {
  await closeDb();
});

beforeEach(async () => {
  await truncateAll();
  const admin = await seedUser(ADMIN);
  await seedUser(SUPPORT);
  await seedUser(CONTENT);
  adminId = admin.id;

  const category = await seedCategory({ slug: "rings" });
  const product = await seedProduct({
    slug: "ring",
    categoryId: category.id,
    price: 500,
    stock: 20,
  });
  productId = product.id;

  await seedSettings();
  adminCookie = await adminLogin(app, ADMIN);
  supportCookie = await adminLogin(app, SUPPORT);
});

describe("admin orders access", () => {
  it("requires a staff session", async () => {
    const res = await request(app).get("/api/v1/admin/orders");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects a role without order permission", async () => {
    const contentCookie = await adminLogin(app, CONTENT);
    const res = await read("/api/v1/admin/orders", contentCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("requires a CSRF token on status changes", async () => {
    const order = await createOrder();
    const res = await request(app)
      .patch(`/api/v1/admin/orders/${order.id}/status`)
      .set("Origin", adminOrigin)
      .set("Cookie", adminCookie)
      .send({ status: "confirmed" });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });
});

describe("GET /admin/orders", () => {
  it("lists orders with items and pagination", async () => {
    const first = await createOrder();
    const second = await createOrder();

    const res = await read("/api/v1/admin/orders?page=1&limit=1");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(1);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].items).toHaveLength(1);
    expect(res.body.data[0].timeline).toEqual([]);
    expect([first.number, second.number]).toContain(res.body.data[0].number);
  });

  it("filters by status and searches by number", async () => {
    const order = await createOrder();

    const byStatus = await read("/api/v1/admin/orders?status=pending");
    expect(byStatus.body.total).toBe(1);

    const bySearch = await read(`/api/v1/admin/orders?q=${order.number}`);
    expect(bySearch.body.total).toBe(1);
    expect(bySearch.body.data[0].number).toBe(order.number);

    const none = await read("/api/v1/admin/orders?status=delivered");
    expect(none.body.total).toBe(0);
  });

  it("returns the full order with its timeline", async () => {
    const order = await createOrder();
    const res = await read(`/api/v1/admin/orders/${order.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.number).toBe(order.number);
    expect(res.body.data.timeline[0].status).toBe("pending");
    expect(res.body.data.timeline[0].note).toBe("Order created");
  });

  it("answers 404 for an unknown id", async () => {
    const res = await read("/api/v1/admin/orders/018f6f6e-6d3a-7c2b-9e5a-1c2d3e4f5a6b");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("PATCH /admin/orders/:id/status", () => {
  it("moves pending to confirmed, appends an event and records the actor", async () => {
    const order = await createOrder();
    const res = await patch(`/api/v1/admin/orders/${order.id}/status`, {
      status: "confirmed",
      note: "Paid on the phone",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("confirmed");
    expect(res.body.data.timeline).toHaveLength(2);
    expect(res.body.data.timeline[1]).toEqual(
      expect.objectContaining({ status: "confirmed", note: "Paid on the phone" }),
    );

    const events = await eventsFor(order.id);
    expect(events).toHaveLength(2);
    expect(events[1]?.actorId).toBe(adminId);
  });

  it("rejects a transition that skips steps and writes no event", async () => {
    const order = await createOrder();
    const res = await patch(`/api/v1/admin/orders/${order.id}/status`, { status: "shipped" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
    expect(await eventsFor(order.id)).toHaveLength(1);
  });

  it("cancels from pending and treats cancelled as final", async () => {
    const order = await createOrder();

    const cancelled = await patch(`/api/v1/admin/orders/${order.id}/status`, {
      status: "cancelled",
    });
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe("cancelled");

    const again = await patch(`/api/v1/admin/orders/${order.id}/status`, { status: "confirmed" });
    expect(again.status).toBe(409);
  });

  it("walks the linear path through to refunded", async () => {
    const order = await createOrder();
    for (const status of [
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "returned",
      "refunded",
    ]) {
      const res = await patch(`/api/v1/admin/orders/${order.id}/status`, { status });
      expect(res.status).toBe(200);
    }

    const final = await read(`/api/v1/admin/orders/${order.id}`);
    expect(final.body.data.status).toBe("refunded");
    expect(final.body.data.timeline).toHaveLength(8);
  });

  it("allows support staff to move an order", async () => {
    const order = await createOrder();
    const res = await patch(
      `/api/v1/admin/orders/${order.id}/status`,
      { status: "confirmed" },
      supportCookie,
    );

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("confirmed");
  });
});

describe("PATCH /admin/orders/:id/payment", () => {
  it("marks a transfer as paid and keeps the order status", async () => {
    const order = await createOrder();
    const res = await patch(`/api/v1/admin/orders/${order.id}/payment`, {
      paymentStatus: "paid",
      note: "InstaPay screenshot verified",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.paymentStatus).toBe("paid");
    expect(res.body.data.status).toBe("pending");
    expect(res.body.data.timeline).toHaveLength(2);
    expect(res.body.data.timeline[1].note).toBe("InstaPay screenshot verified");
  });

  it("is idempotent when the payment status does not change", async () => {
    const order = await createOrder();
    await patch(`/api/v1/admin/orders/${order.id}/payment`, { paymentStatus: "paid" });
    const res = await patch(`/api/v1/admin/orders/${order.id}/payment`, {
      paymentStatus: "paid",
    });

    expect(res.status).toBe(200);
    expect(await eventsFor(order.id)).toHaveLength(2);
  });

  it("answers 404 for an unknown order", async () => {
    const res = await patch(
      "/api/v1/admin/orders/018f6f6e-6d3a-7c2b-9e5a-1c2d3e4f5a6b/payment",
      { paymentStatus: "paid" },
    );

    expect(res.status).toBe(404);
  });
});
