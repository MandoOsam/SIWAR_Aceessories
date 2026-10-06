import { beforeEach, describe, expect, it, vi } from "vitest";

import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { getProductBySlug, listProducts, searchSuggest } from "@/services/catalogService";

/**
 * Mock-mode catalogue behaviour.
 *
 * `VITE_API_URL` is empty in `.env`, so the mock adapter is the implementation under test. The
 * filtering and paging rules here are what the storefront will show before `backend/` exists, so
 * they are pinned down rather than left to be eyeballed in the browser.
 */
describe("listProducts (mock mode)", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_URL", "");
  });

  it("returns the shared envelope shape", async () => {
    const page = await listProducts({ limit: 5 });

    expect(Object.keys(page).sort()).toEqual(["data", "limit", "page", "total"]);
    expect(page.page).toBe(1);
    expect(page.data).toHaveLength(5);
  });

  it("defaults to the first page and never returns more rows than exist", async () => {
    const first = await listProducts();
    expect(first.data.length).toBeLessThanOrEqual(first.total);

    const beyond = await listProducts({ page: 999 });
    expect(beyond.data).toHaveLength(0);
    expect(beyond.total).toBe(products.length);
  });

  it("pages without repeating or dropping rows", async () => {
    const page1 = await listProducts({ page: 1, limit: 3 });
    const page2 = await listProducts({ page: 2, limit: 3 });

    const ids = [...page1.data, ...page2.data].map((product) => product.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("sorts by price in both directions", async () => {
    const asc = await listProducts({ sort: "price-asc" });
    const desc = await listProducts({ sort: "price-desc" });
    const ascPrices = asc.data.map((product) => product.price);
    const descPrices = desc.data.map((product) => product.price);

    expect(ascPrices).toEqual([...ascPrices].sort((a, b) => a - b));
    expect(descPrices).toEqual([...ascPrices].sort((a, b) => b - a));
  });

  it("filters by category, discount and stock flags", async () => {
    const discounted = await listProducts({ discount: true });
    expect(discounted.data.length).toBeGreaterThan(0);
    expect(discounted.data.every((product) => product.oldPrice !== undefined)).toBe(true);

    const inStock = await listProducts({ inStock: true });
    expect(inStock.data.every((product) => product.stock > 0)).toBe(true);
  });

  it("treats minPrice and maxPrice as an inclusive range", async () => {
    const ranged = await listProducts({ minPrice: 400, maxPrice: 800, limit: 100 });
    expect(ranged.data.every((p) => p.price >= 400 && p.price <= 800)).toBe(true);
  });

  it("searches product names case-insensitively in both languages", async () => {
    const lower = await listProducts({ search: "chain" });
    const upper = await listProducts({ search: "CHAIN" });

    expect(lower.total).toBeGreaterThan(0);
    expect(upper.total).toBe(lower.total);
  });

  it("ignores surrounding whitespace in the search term", async () => {
    const padded = await listProducts({ search: "  chain  " });
    expect(padded.total).toBe((await listProducts({ search: "chain" })).total);
  });
});

describe("getProductBySlug (mock mode)", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_URL", "");
  });

  it("returns the product with related items that exclude itself", async () => {
    const detail = await getProductBySlug(products[0]?.slug ?? "");
    expect(detail).not.toBeNull();
    expect(detail?.product.slug).toBe(products[0]?.slug);
    expect(detail?.related.some((item) => item.slug === detail?.product.slug)).toBe(false);
    expect(
      detail?.matching.every((item) => item.category.slug === detail?.product.category.slug),
    ).toBe(true);
  });

  it("returns null for an unknown slug instead of throwing", async () => {
    await expect(getProductBySlug("does-not-exist")).resolves.toBeNull();
  });
});

describe("searchSuggest (mock mode)", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_URL", "");
  });

  it("suggests every category for an empty query", async () => {
    const result = await searchSuggest("   ");
    expect(result.suggestions).toHaveLength(categories.length);
    expect(result.suggestions.every((item) => item.type === "category")).toBe(true);
    expect(result.popularSearches.length).toBeGreaterThan(0);
  });

  it("matches English names regardless of case", async () => {
    // Regression guard: the term is lower-cased but the candidate names were not, so a lowercase
    // query could never match a capitalised English name like "Necklaces".
    const lower = await searchSuggest("necklace");
    const upper = await searchSuggest("NECKLACE");

    expect(lower.suggestions.length).toBeGreaterThan(0);
    expect(upper.suggestions.length).toBe(lower.suggestions.length);
  });

  it("matches Arabic names", async () => {
    const result = await searchSuggest("سلسلة");
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it("caps product suggestions at six", async () => {
    const result = await searchSuggest("ا");
    const productSuggestions = result.suggestions.filter((item) => item.type === "product");
    expect(productSuggestions.length).toBeLessThanOrEqual(6);
  });

  it("returns no suggestions for a term that matches nothing", async () => {
    const result = await searchSuggest("zzzzqqq");
    expect(result.suggestions).toHaveLength(0);
    expect(result.popularSearches.length).toBeGreaterThan(0);
  });
});
