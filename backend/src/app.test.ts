import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "@/app.js";
import { apiPrefix } from "@/app.js";

const app = createApp();

describe("GET /api/v1/health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get(`${apiPrefix}/health`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: "ok" } });
  });
});

describe("unknown route", () => {
  it("returns 404 in the contract error shape", async () => {
    const res = await request(app).get(`${apiPrefix}/does-not-exist`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: "NOT_FOUND", message: "Route not found", details: [] },
    });
  });
});
