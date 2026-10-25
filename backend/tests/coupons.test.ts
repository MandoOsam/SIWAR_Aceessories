import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { closeDb, runMigrations } from "./db.js";
import { post, resetOrders } from "./orderFixtures.js";

beforeAll(async () => {
  await runMigrations();
});

afterAll(async () => {
  await closeDb();
});

beforeEach(async () => {
  await resetOrders();
});

describe("POST /coupons/validate", () => {
  it("returns the discount for a valid code", async () => {
    const res = await post("/api/v1/coupons/validate", { code: "siwar10", subtotal: 1000 });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      valid: true,
      code: "SIWAR10",
      type: "percent",
      value: 10,
      discount: 100,
    });
  });

  it("reports the minimum-order rule", async () => {
    const res = await post("/api/v1/coupons/validate", { code: "WELCOME50", subtotal: 200 });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ valid: false, error: "min-order" });
  });

  it("reports unknown, expired and exhausted codes as invalid", async () => {
    for (const code of ["NOPE", "EXPIRED", "LIMITED", "OFF"]) {
      const res = await post("/api/v1/coupons/validate", { code, subtotal: 1000 });
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({ valid: false, error: "invalid" });
    }
  });

  it("reports free shipping", async () => {
    const res = await post("/api/v1/coupons/validate", { code: "FREESHIP", subtotal: 500 });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      valid: true,
      code: "FREESHIP",
      type: "fixed",
      value: 0,
      freeShipping: true,
      discount: 0,
    });
  });
});
