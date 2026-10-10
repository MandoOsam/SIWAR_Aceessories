import { describe, expect, it } from "vitest";

import {
  applyFilterPatch,
  clearFilters,
  clearFilterValue,
  parseProductFilters,
  serializeProductFilters,
  setFilterValue,
  toProductQuery,
  toggleFilterValue,
  type ProductFilterState,
} from "@/hooks/useProductFilters";

/**
 * URL state for shop/category/search.
 *
 * These are pure functions, so no router or DOM is needed (vite.config.ts test.environment = node).
 * What matters: bad URLs never throw, defaults are omitted from the URL, and a parse→serialize round
 * trip is stable (refresh and back button both depend on it — 05-ui-context.md §7.3).
 */
describe("parseProductFilters", () => {
  it("returns defaults for an empty query string", () => {
    expect(parseProductFilters(new URLSearchParams(""))).toEqual({
      sort: "newest",
      page: 1,
      search: "",
    });
  });

  it("reads every filter from the documented URL shape", () => {
    const params = new URLSearchParams(
      "category=rings&minPrice=200&maxPrice=800&rating=4&color=gold&sort=price-asc&page=2",
    );
    expect(parseProductFilters(params)).toEqual({
      category: "rings",
      minPrice: 200,
      maxPrice: 800,
      rating: 4,
      color: "gold",
      sort: "price-asc",
      page: 2,
      search: "",
    });
  });

  it("reads boolean filters, size and the search term", () => {
    const params = new URLSearchParams(
      "inStock=true&discount=true&isNew=true&size=8&q=%20ring%20",
    );
    expect(parseProductFilters(params)).toEqual({
      inStock: true,
      discount: true,
      isNew: true,
      size: "8",
      sort: "newest",
      page: 1,
      search: "ring",
    });
  });

  it("only treats the literal 'true' as an active boolean", () => {
    const params = new URLSearchParams("inStock=1&discount=false&isNew=yes");
    const state = parseProductFilters(params);
    expect(state.inStock).toBeUndefined();
    expect(state.discount).toBeUndefined();
    expect(state.isNew).toBeUndefined();
  });

  it("drops invalid values instead of throwing", () => {
    const params = new URLSearchParams(
      "category=hats&color=pink&rating=9&minPrice=-5&maxPrice=abc&size=&sort=cheapest&page=0",
    );
    expect(parseProductFilters(params)).toEqual({
      sort: "newest",
      page: 1,
      search: "",
    });
  });

  it("falls back to page 1 for a non-numeric page", () => {
    expect(parseProductFilters(new URLSearchParams("page=abc")).page).toBe(1);
  });

  it("ignores category and q when the route owns them", () => {
    const params = new URLSearchParams("category=rings&q=ring");
    const state = parseProductFilters(params, { manageCategory: false, manageSearch: false });
    expect(state.category).toBeUndefined();
    expect(state.search).toBe("");
  });
});

describe("serializeProductFilters", () => {
  const defaultState: ProductFilterState = { sort: "newest", page: 1, search: "" };

  it("omits default values so the URL stays short", () => {
    expect(serializeProductFilters(defaultState).toString()).toBe("");
  });

  it("writes fields in a stable order", () => {
    const state: ProductFilterState = {
      category: "rings",
      minPrice: 200,
      maxPrice: 800,
      rating: 4,
      inStock: true,
      color: "gold",
      size: "8",
      discount: true,
      isNew: true,
      sort: "price-asc",
      page: 2,
      search: "ring",
    };
    expect(serializeProductFilters(state).toString()).toBe(
      "category=rings&minPrice=200&maxPrice=800&rating=4&inStock=true&color=gold" +
        "&size=8&discount=true&isNew=true&sort=price-asc&page=2&q=ring",
    );
  });

  it("round-trips through parse without losing anything", () => {
    const state: ProductFilterState = {
      category: "rings",
      minPrice: 200,
      maxPrice: 800,
      rating: 4,
      inStock: true,
      color: "gold",
      size: "8",
      discount: true,
      isNew: true,
      sort: "price-asc",
      page: 2,
      search: "ring",
    };
    expect(parseProductFilters(serializeProductFilters(state))).toEqual(state);
  });

  it("omits category and q when the route owns them", () => {
    const state: ProductFilterState = { category: "rings", sort: "newest", page: 1, search: "ring" };
    expect(
      serializeProductFilters(state, { manageCategory: false, manageSearch: false }).toString(),
    ).toBe("");
  });
});

describe("toProductQuery", () => {
  it("drops an empty search term and keeps the rest", () => {
    const state: ProductFilterState = {
      category: "rings",
      minPrice: 200,
      color: "gold",
      sort: "price-desc",
      page: 3,
      search: "",
    };
    expect(toProductQuery(state)).toEqual({
      category: "rings",
      minPrice: 200,
      maxPrice: undefined,
      rating: undefined,
      inStock: undefined,
      color: "gold",
      size: undefined,
      discount: undefined,
      isNew: undefined,
      sort: "price-desc",
      page: 3,
      search: undefined,
    });
  });
});

describe("update helpers", () => {
  const base: ProductFilterState = { sort: "rating", page: 4, search: "ring" };

  it("resets the page when a filter changes", () => {
    expect(setFilterValue(base, "color", "gold")).toEqual({
      sort: "rating",
      page: 1,
      search: "ring",
      color: "gold",
    });
  });

  it("toggles a boolean filter on and off", () => {
    const on = toggleFilterValue(base, "inStock");
    expect(on.inStock).toBe(true);
    expect(toggleFilterValue(on, "inStock").inStock).toBeUndefined();
  });

  it("removes a single filter and resets the page", () => {
    const state: ProductFilterState = { ...base, color: "gold", page: 3 };
    expect(clearFilterValue(state, "color")).toEqual({
      sort: "rating",
      page: 1,
      search: "ring",
      color: undefined,
    });
  });

  it("clears every filter but keeps sort and search", () => {
    const state: ProductFilterState = {
      category: "rings",
      color: "gold",
      inStock: true,
      sort: "price-asc",
      page: 5,
      search: "ring",
    };
    expect(clearFilters(state)).toEqual({ sort: "price-asc", page: 1, search: "ring" });
  });

  it("patches several fields in one update and resets the page once", () => {
    const state: ProductFilterState = {
      minPrice: 200,
      maxPrice: 800,
      color: "gold",
      sort: "price-asc",
      page: 3,
      search: "",
    };
    expect(applyFilterPatch(state, { minPrice: undefined, maxPrice: undefined })).toEqual({
      minPrice: undefined,
      maxPrice: undefined,
      color: "gold",
      sort: "price-asc",
      page: 1,
      search: "",
    });
  });
});
