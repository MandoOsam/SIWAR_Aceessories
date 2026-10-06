import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Adapter selection contract (`02-architecture.md` §4 + `src/config/env.ts`).
 *
 * `VITE_API_URL` is the single switch between the mock service layer and the real API, and it is
 * read once at module load. Each test therefore resets the module registry and stubs the env var
 * before importing the module under test.
 */

/** Imports `src/config/env.ts` fresh, with `VITE_API_URL` set to `value`. */
async function loadEnv(value?: string) {
  vi.resetModules();
  if (value === undefined) {
    vi.stubEnv("VITE_API_URL", "");
  } else {
    vi.stubEnv("VITE_API_URL", value);
  }
  return import("@/config/env");
}

describe("IS_MOCK_MODE / VITE_API_URL", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("selects the mock adapter when VITE_API_URL is empty", async () => {
    const { IS_MOCK_MODE, API_BASE_URL } = await loadEnv("");

    expect(IS_MOCK_MODE).toBe(true);
    expect(API_BASE_URL).toBe("");
  });

  it("selects the mock adapter when VITE_API_URL is undefined", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", undefined);
    const env = await import("@/config/env");

    expect(env.IS_MOCK_MODE).toBe(true);
    expect(env.API_BASE_URL).toBe("");
  });

  it("selects the real API when VITE_API_URL is configured", async () => {
    const { IS_MOCK_MODE, API_BASE_URL } = await loadEnv("https://api.siwar.com/api/v1");

    expect(IS_MOCK_MODE).toBe(false);
    expect(API_BASE_URL).toBe("https://api.siwar.com/api/v1");
  });

  it("strips trailing slashes so request URLs are not doubled up", async () => {
    const { API_BASE_URL } = await loadEnv("https://api.siwar.com/api/v1///");

    expect(API_BASE_URL).toBe("https://api.siwar.com/api/v1");
  });

  it("treats a whitespace-only value as mock mode, not as a broken base URL", async () => {
    const { IS_MOCK_MODE, API_BASE_URL } = await loadEnv("   ");

    expect(IS_MOCK_MODE).toBe(true);
    expect(API_BASE_URL).toBe("");
  });

  it("trims surrounding whitespace from a real base URL", async () => {
    const { IS_MOCK_MODE, API_BASE_URL } = await loadEnv("  https://api.siwar.com/api/v1  ");

    expect(IS_MOCK_MODE).toBe(false);
    expect(API_BASE_URL).toBe("https://api.siwar.com/api/v1");
  });
});

describe("adapter selection through the service layer", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("serves mock products and never calls fetch when VITE_API_URL is empty", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "");
    const { listProducts } = await import("@/services/catalogService");

    const result = await listProducts({ limit: 3 });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.data).toHaveLength(3);
    expect(result.limit).toBe(3);
    expect(result.page).toBe(1);
    expect(result.total).toBeGreaterThan(3);
    expect(result.data[0]).toHaveProperty("material", "stainless-steel");
  });

  it("calls the real API at VITE_API_URL when it is configured", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "https://api.siwar.com/api/v1/");
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [{ id: "from-backend" }],
          total: 1,
          page: 2,
          limit: 10,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const { listProducts } = await import("@/services/catalogService");
    const result = await listProducts({ category: "rings", sort: "price-asc", page: 2 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    // No doubled slash, and the documented query keys are serialised.
    expect(url).toBe("https://api.siwar.com/api/v1/products?category=rings&sort=price-asc&page=2");
    expect((result.data as { id: string }[])[0]?.id).toBe("from-backend");
  });

  it("sends cookies and the Accept header, so session auth keeps working", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "https://api.siwar.com/api/v1");
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: [], total: 0, page: 1, limit: 12 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { listCategories } = await import("@/services/catalogService");
    await listCategories();

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.credentials).toBe("include");
    expect((init.headers as Record<string, string>).Accept).toBe("application/json");
  });

  it("turns an API error envelope into a typed ApiError", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "https://api.siwar.com/api/v1");
    // A fresh Response per call: a body can only be read once, so a reused instance would make the
    // second read fail and mask the real error payload.
    fetchMock.mockImplementation(
      async () =>
        new Response(JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Nope" } }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
    );

    const { listProducts } = await import("@/services/catalogService");
    const { ApiError } = await import("@/services/http");

    const error = await listProducts().then(
      () => null,
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401, code: "UNAUTHORIZED", message: "Nope" });
  });

  it("falls back to a typed error when a failure carries no error envelope", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "https://api.siwar.com/api/v1");
    fetchMock.mockImplementation(async () => new Response("", { status: 500 }));

    const { listProducts } = await import("@/services/catalogService");

    await expect(listProducts()).rejects.toMatchObject({
      status: 500,
      code: "UNEXPECTED_ERROR",
    });
  });
});
