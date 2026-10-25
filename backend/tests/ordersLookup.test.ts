import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { closeDb, runMigrations } from "./db.js";
import { app, createOrder, orderInput, resetOrders } from "./orderFixtures.js";

beforeAll(async () => {
  await runMigrations();
});

afterAll(async () => {
  await closeDb();
});

beforeEach(async () => {
  await resetOrders();
});

describe("GET /orders/track", () => {
  it("returns null when the phone does not match", async () => {
    const created = await createOrder(orderInput());
    const res = await request(app)
      .get("/api/v1/orders/track")
      .query({ number: created.body.data.number, phone: "01111111111" });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });

  it("returns null for an unknown number", async () => {
    const res = await request(app)
      .get("/api/v1/orders/track")
      .query({ number: "SW-99999", phone: "01012345678" });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });
});

describe("GET /orders/:id", () => {
  it("returns the order for the success page", async () => {
    const created = await createOrder(orderInput());
    const res = await request(app).get(`/api/v1/orders/${created.body.data.id as string}`);

    expect(res.status).toBe(200);
    expect(res.body.data.number).toBe(created.body.data.number);
    expect(res.body.data.paymentMethod).toBe("cod");
    expect(res.body.data.address.governorate).toBe("Cairo");
  });

  it("answers null for an unknown id", async () => {
    const res = await request(app).get("/api/v1/orders/018f6f6e-6d3a-7c2b-9e5a-1c2d3e4f5a6b");

    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });
});
