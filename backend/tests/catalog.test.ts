import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app.js";
import { closeDb, runMigrations, truncateAll } from "./db.js";
import { seedCategory, seedProduct } from "./fixtures.js";

const app = createApp();

type ProductBody = {
  id: string;
  slug: string;
  sku: string;
  name: { ar: string; en: string };
  category: { slug: string; name: { ar: string; en: string } };
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  images: { url: string; alt: { ar: string; en: string }; isPrimary: boolean }[];
  colors: string[];
  sizes?: string[];
  stock: number;
  rating: number;
  reviewsCount: number;
};

type ListBody = {
  data: ProductBody[];
  total: number;
  page: number;
  limit: number;
};

type ProductDetailBody = {
  data: {
    product: ProductBody;
    matching: ProductBody[];
    related: ProductBody[];
  } | null;
};

type CategoryBody = {
  data: { id: string; slug: string; name: { ar: string; en: string }; sortOrder: number } | null;
};

type CategoryListBody = {
  data: { slug: string; sortOrder: number; isActive: boolean }[];
};

type ErrorBody = { error: { code: string; message: string } };

async function seedCatalogue(): Promise<void> {
  const necklaces = await seedCategory({ slug: "necklaces", sortOrder: 1 });
  const rings = await seedCategory({ slug: "rings", sortOrder: 2 });
  const sets = await seedCategory({ slug: "sets", sortOrder: 3 });
  await seedCategory({ slug: "hidden", sortOrder: 4, isActive: false });

  await seedProduct({
    slug: "noor-necklace",
    categoryId: necklaces.id,
    price: 780,
    colors: ["gold", "rose-gold"],
    stock: 12,
    isNew: true,
    createdAt: new Date("2026-09-02T00:00:00.000Z"),
    images: [
      { url: "/assets/placeholder/product-gold.svg", isPrimary: false },
      { url: "/assets/placeholder/product-rose.svg", isPrimary: true },
    ],
  });

  await seedProduct({
    slug: "hala-necklace",
    categoryId: necklaces.id,
    price: 640,
    oldPrice: 890,
    discountPercent: 28,
    colors: ["gold", "silver"],
    stock: 0,
    isBestSeller: true,
    createdAt: new Date("2026-07-14T00:00:00.000Z"),
  });

  await seedProduct({
    slug: "signature-ring",
    categoryId: rings.id,
    price: 420,
    oldPrice: 500,
    discountPercent: 16,
    colors: ["gold", "silver", "black"],
    sizes: ["6", "7", "8", "9"],
    stock: 30,
    createdAt: new Date("2026-06-08T00:00:00.000Z"),
  });

  await seedProduct({
    slug: "layla-ring",
    categoryId: rings.id,
    price: 360,
    colors: ["gold", "rose-gold"],
    sizes: ["6", "7", "8"],
    stock: 0,
    isNew: true,
    createdAt: new Date("2026-09-18T00:00:00.000Z"),
  });

  await seedProduct({
    slug: "evening-set",
    categoryId: sets.id,
    price: 1480,
    colors: ["rose-gold", "black"],
    stock: 6,
    createdAt: new Date("2026-09-08T00:00:00.000Z"),
  });

  await seedProduct({
    slug: "qamar-necklace",
    categoryId: necklaces.id,
    price: 900,
    name: { ar: "سلسلة قمر", en: "Qamar Necklace" },
    createdAt: new Date("2026-05-01T00:00:00.000Z"),
  });

  await seedProduct({
    slug: "draft-ring",
    categoryId: rings.id,
    price: 100,
    status: "draft",
    createdAt: new Date("2026-10-01T00:00:00.000Z"),
  });

  await seedProduct({
    slug: "archived-set",
    categoryId: sets.id,
    price: 200,
    status: "archived",
    createdAt: new Date("2026-10-02T00:00:00.000Z"),
  });
}

async function getProducts(query = ""): Promise<request.Response> {
  return request(app).get(`/api/v1/products${query}`);
}

beforeAll(async () => {
  await runMigrations();
});

beforeEach(async () => {
  await truncateAll();
  await seedCatalogue();
});

afterAll(async () => {
  await truncateAll();
  await closeDb();
});

describe("GET /api/v1/categories", () => {
  it("returns only active categories ordered by sortOrder", async () => {
    const res = await request(app).get("/api/v1/categories");

    expect(res.status).toBe(200);
    const body = res.body as CategoryListBody;
    expect(body.data.map((category) => category.slug)).toEqual(["necklaces", "rings", "sets"]);
    expect(body.data.every((category) => category.isActive)).toBe(true);
  });
});

describe("GET /api/v1/categories/:slug", () => {
  it("returns the category", async () => {
    const res = await request(app).get("/api/v1/categories/rings");

    expect(res.status).toBe(200);
    const body = res.body as CategoryBody;
    expect(body.data?.slug).toBe("rings");
    expect(body.data?.name.ar.length).toBeGreaterThan(0);
  });

  it("returns 200 with null data for an unknown slug", async () => {
    const res = await request(app).get("/api/v1/categories/unknown");

    expect(res.status).toBe(200);
    expect((res.body as CategoryBody).data).toBeNull();
  });

  it("returns 200 with null data for an inactive category", async () => {
    const res = await request(app).get("/api/v1/categories/hidden");

    expect(res.status).toBe(200);
    expect((res.body as CategoryBody).data).toBeNull();
  });

  it("rejects a malformed slug", async () => {
    const res = await request(app).get("/api/v1/categories/Not%20A%20Slug");

    expect(res.status).toBe(400);
    expect((res.body as ErrorBody).error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/v1/products", () => {
  it("returns only active products wrapped in the list envelope", async () => {
    const res = await getProducts();

    expect(res.status).toBe(200);
    const body = res.body as ListBody;
    expect(body.total).toBe(6);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(20);
    expect(body.data.map((item) => item.slug)).not.toContain("draft-ring");
    expect(body.data.map((item) => item.slug)).not.toContain("archived-set");

    const product = body.data[0];
    expect(product).toBeDefined();
    expect(typeof product?.price).toBe("number");
    expect(product?.category.slug).toBe("rings");
    expect(product?.images[0]?.isPrimary).toBe(true);
    expect(product?.rating).toBe(0);
    expect(product?.reviewsCount).toBe(0);
  });

  it("sorts newest first by default", async () => {
    const res = await getProducts();

    const body = res.body as ListBody;
    expect(body.data[0]?.slug).toBe("layla-ring");
    expect(body.data.at(-1)?.slug).toBe("qamar-necklace");
  });

  it("paginates with total counting every active match", async () => {
    const res = await getProducts("?limit=2&page=3");

    const body = res.body as ListBody;
    expect(body.total).toBe(6);
    expect(body.page).toBe(3);
    expect(body.limit).toBe(2);
    expect(body.data).toHaveLength(2);
  });

  it("rejects a limit above the maximum", async () => {
    const res = await getProducts("?limit=101");

    expect(res.status).toBe(400);
    expect((res.body as ErrorBody).error.code).toBe("VALIDATION_ERROR");
  });

  it("filters by category slug", async () => {
    const res = await getProducts("?category=rings");

    const body = res.body as ListBody;
    expect(body.total).toBe(2);
    expect(body.data.every((item) => item.category.slug === "rings")).toBe(true);
  });

  it("returns an empty page for an unknown category", async () => {
    const res = await getProducts("?category=unknown");

    expect(res.status).toBe(200);
    const body = res.body as ListBody;
    expect(body.total).toBe(0);
    expect(body.data).toEqual([]);
  });

  it("filters by price range", async () => {
    const res = await getProducts("?minPrice=400&maxPrice=800");

    const body = res.body as ListBody;
    expect(body.data.map((item) => item.slug).sort()).toEqual([
      "hala-necklace",
      "noor-necklace",
      "signature-ring",
    ]);
  });

  it("rejects an inverted price range", async () => {
    const res = await getProducts("?minPrice=900&maxPrice=100");

    expect(res.status).toBe(400);
    expect((res.body as ErrorBody).error.code).toBe("VALIDATION_ERROR");
  });

  it("filters by color", async () => {
    const res = await getProducts("?color=rose-gold");

    const body = res.body as ListBody;
    expect(body.data.map((item) => item.slug).sort()).toEqual([
      "evening-set",
      "layla-ring",
      "noor-necklace",
    ]);
  });

  it("rejects an unknown color", async () => {
    const res = await getProducts("?color=blue");

    expect(res.status).toBe(400);
  });

  it("filters by size", async () => {
    const res = await getProducts("?size=7");

    const body = res.body as ListBody;
    expect(body.data.map((item) => item.slug).sort()).toEqual(["layla-ring", "signature-ring"]);
  });

  it("filters in-stock products", async () => {
    const res = await getProducts("?inStock=true");

    const body = res.body as ListBody;
    expect(body.data.map((item) => item.slug)).not.toContain("hala-necklace");
    expect(body.data.map((item) => item.slug)).not.toContain("layla-ring");
    expect(body.total).toBe(4);
  });

  it("filters discounted products", async () => {
    const res = await getProducts("?discount=true");

    const body = res.body as ListBody;
    expect(body.data.map((item) => item.slug).sort()).toEqual(["hala-necklace", "signature-ring"]);
  });

  it("filters new arrivals", async () => {
    const res = await getProducts("?isNew=true");

    const body = res.body as ListBody;
    expect(body.data.map((item) => item.slug).sort()).toEqual(["layla-ring", "noor-necklace"]);
  });

  it("searches Arabic and English names case-insensitively", async () => {
    const arabic = await getProducts(`?search=${encodeURIComponent("قمر")}`);
    const english = await getProducts("?search=SIGNATURE");

    expect((arabic.body as ListBody).data.map((item) => item.slug)).toEqual(["qamar-necklace"]);
    expect((english.body as ListBody).data.map((item) => item.slug)).toEqual(["signature-ring"]);
  });

  it("sorts by price ascending and descending", async () => {
    const ascending = await getProducts("?sort=price-asc");
    const descending = await getProducts("?sort=price-desc");

    const prices = (body: ListBody): number[] => body.data.map((item) => item.price);
    expect(prices(ascending.body as ListBody)).toEqual([360, 420, 640, 780, 900, 1480]);
    expect(prices(descending.body as ListBody)).toEqual([1480, 900, 780, 640, 420, 360]);
  });
});

describe("GET /api/v1/products/:slug", () => {
  it("returns the product with matching and related lists", async () => {
    const res = await request(app).get("/api/v1/products/signature-ring");

    expect(res.status).toBe(200);
    const body = res.body as ProductDetailBody;
    expect(body.data?.product.slug).toBe("signature-ring");
    expect(body.data?.product.sizes).toEqual(["6", "7", "8", "9"]);
    expect(body.data?.matching.map((item) => item.slug)).toEqual(["layla-ring"]);
    expect(body.data?.matching.every((item) => item.category.slug === "rings")).toBe(true);
    expect(body.data?.related.map((item) => item.slug)).not.toContain("signature-ring");
    expect(body.data?.related.length).toBeLessThanOrEqual(8);
    expect(body.data?.related.length).toBe(5);
  });

  it("returns 200 with null data for an unknown slug", async () => {
    const res = await request(app).get("/api/v1/products/does-not-exist");

    expect(res.status).toBe(200);
    expect((res.body as ProductDetailBody).data).toBeNull();
  });

  it("returns 200 with null data for a draft product", async () => {
    const res = await request(app).get("/api/v1/products/draft-ring");

    expect(res.status).toBe(200);
    expect((res.body as ProductDetailBody).data).toBeNull();
  });

  it("rejects a malformed slug", async () => {
    const res = await request(app).get("/api/v1/products/Bad_Slug");

    expect(res.status).toBe(400);
    expect((res.body as ErrorBody).error.code).toBe("VALIDATION_ERROR");
  });
});
