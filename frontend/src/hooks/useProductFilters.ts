import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import {
  CATEGORY_SLUGS,
  PRODUCT_COLORS,
  PRODUCT_SORTS,
  type CategorySlug,
  type ProductColor,
  type ProductQuery,
  type ProductSort,
} from "@/services/types";

/**
 * URL-driven filter state for /shop, /category/:slug and /search (05-ui-context.md §7.3–7.6).
 *
 * Filters live in the query string, never in a store, so refresh keeps them and the browser back
 * button restores the previous state. `03-code-standards.md` §5: client state is only for cart,
 * theme, language and similar — catalogue filters are navigational state, which the URL owns.
 *
 * URL shape: `/shop?category=rings&minPrice=200&maxPrice=800&rating=4&color=gold&sort=price-asc&page=2`
 * On the search page the query term is `q` (`/search?q=ring`).
 */

/** Query-string key for each piece of state, kept in one place so nothing hard-codes a key. */
export const FILTER_PARAM = {
  category: "category",
  minPrice: "minPrice",
  maxPrice: "maxPrice",
  rating: "rating",
  inStock: "inStock",
  color: "color",
  size: "size",
  discount: "discount",
  isNew: "isNew",
  sort: "sort",
  page: "page",
  search: "q",
} as const;

export const DEFAULT_SORT: ProductSort = "newest";
export const DEFAULT_PAGE = 1;

const RATING_VALUES = [1, 2, 3, 4, 5] as const;

export type ProductFilterState = {
  category?: CategorySlug;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  color?: ProductColor;
  size?: string;
  discount?: boolean;
  isNew?: boolean;
  sort: ProductSort;
  page: number;
  /** Free-text query; empty string when absent. Mapped to the API `search` param. */
  search: string;
};

/** The optional filters a chip can remove. `sort`/`page`/`search` are not chips. */
export type ProductFilterKey = Exclude<keyof ProductFilterState, "sort" | "page" | "search">;

type BooleanFilterKey = "inStock" | "discount" | "isNew";

export type ProductFilterOptions = {
  /** When false, `category` is neither read nor written (the route supplies it). */
  manageCategory?: boolean;
  /** When false, `q` is neither read nor written (a different route owns it). */
  manageSearch?: boolean;
};

function isCategorySlug(value: string | null): value is CategorySlug {
  return value !== null && (CATEGORY_SLUGS as readonly string[]).includes(value);
}

function isProductColor(value: string | null): value is ProductColor {
  return value !== null && (PRODUCT_COLORS as readonly string[]).includes(value);
}

function isProductSort(value: string | null): value is ProductSort {
  return value !== null && (PRODUCT_SORTS as readonly string[]).includes(value);
}

/** Reads a non-negative number, ignoring empty strings (which `Number` maps to 0). */
function readAmount(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function readRating(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return (RATING_VALUES as readonly number[]).includes(parsed) ? parsed : undefined;
}

function readPage(value: string | null): number {
  if (value === null || value.trim() === "") return DEFAULT_PAGE;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : DEFAULT_PAGE;
}

/** Builds a typed state from URL params, dropping anything invalid so bad URLs never throw. */
export function parseProductFilters(
  params: URLSearchParams,
  options: ProductFilterOptions = {},
): ProductFilterState {
  const { manageCategory = true, manageSearch = true } = options;
  const state: ProductFilterState = {
    sort: isProductSort(params.get(FILTER_PARAM.sort)) ? (params.get(FILTER_PARAM.sort) as ProductSort) : DEFAULT_SORT,
    page: readPage(params.get(FILTER_PARAM.page)),
    search: manageSearch ? (params.get(FILTER_PARAM.search) ?? "").trim() : "",
  };

  if (manageCategory && isCategorySlug(params.get(FILTER_PARAM.category))) {
    state.category = params.get(FILTER_PARAM.category) as CategorySlug;
  }
  const minPrice = readAmount(params.get(FILTER_PARAM.minPrice));
  if (minPrice !== undefined) state.minPrice = minPrice;
  const maxPrice = readAmount(params.get(FILTER_PARAM.maxPrice));
  if (maxPrice !== undefined) state.maxPrice = maxPrice;
  const rating = readRating(params.get(FILTER_PARAM.rating));
  if (rating !== undefined) state.rating = rating;
  if (isProductColor(params.get(FILTER_PARAM.color))) {
    state.color = params.get(FILTER_PARAM.color) as ProductColor;
  }
  const size = params.get(FILTER_PARAM.size)?.trim();
  if (size !== undefined && size !== "") state.size = size;
  if (params.get(FILTER_PARAM.inStock) === "true") state.inStock = true;
  if (params.get(FILTER_PARAM.discount) === "true") state.discount = true;
  if (params.get(FILTER_PARAM.isNew) === "true") state.isNew = true;

  return state;
}

/** Serializes state back to URL params, omitting default values so URLs stay short. */
export function serializeProductFilters(
  state: ProductFilterState,
  options: ProductFilterOptions = {},
): URLSearchParams {
  const { manageCategory = true, manageSearch = true } = options;
  const params = new URLSearchParams();
  const set = (key: string, value: string | number | undefined): void => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  };

  if (manageCategory) set(FILTER_PARAM.category, state.category);
  set(FILTER_PARAM.minPrice, state.minPrice);
  set(FILTER_PARAM.maxPrice, state.maxPrice);
  set(FILTER_PARAM.rating, state.rating);
  if (state.inStock === true) set(FILTER_PARAM.inStock, "true");
  set(FILTER_PARAM.color, state.color);
  set(FILTER_PARAM.size, state.size);
  if (state.discount === true) set(FILTER_PARAM.discount, "true");
  if (state.isNew === true) set(FILTER_PARAM.isNew, "true");
  if (state.sort !== DEFAULT_SORT) set(FILTER_PARAM.sort, state.sort);
  if (state.page !== DEFAULT_PAGE) set(FILTER_PARAM.page, state.page);
  if (manageSearch && state.search !== "") set(FILTER_PARAM.search, state.search);

  return params;
}

/** Maps the URL state to the `GET /products` query the service layer expects. */
export function toProductQuery(state: ProductFilterState): ProductQuery {
  return {
    category: state.category,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
    rating: state.rating,
    inStock: state.inStock,
    color: state.color,
    size: state.size,
    discount: state.discount,
    isNew: state.isNew,
    sort: state.sort,
    page: state.page,
    search: state.search === "" ? undefined : state.search,
  };
}

/** Sets one field and resets to page 1, because a changed filter invalidates the current page. */
export function setFilterValue<K extends keyof ProductFilterState>(
  state: ProductFilterState,
  key: K,
  value: ProductFilterState[K],
): ProductFilterState {
  return { ...state, [key]: value, page: DEFAULT_PAGE };
}

/** Flips a boolean filter (availability, discount, new) on or off. */
export function toggleFilterValue(
  state: ProductFilterState,
  key: BooleanFilterKey,
): ProductFilterState {
  return { ...state, [key]: state[key] === true ? undefined : true, page: DEFAULT_PAGE };
}

/** Removes a single optional filter. */
export function clearFilterValue(
  state: ProductFilterState,
  key: ProductFilterKey,
): ProductFilterState {
  return { ...state, [key]: undefined, page: DEFAULT_PAGE };
}

/** Clears every filter but keeps the sort order and the search term. */
export function clearFilters(state: ProductFilterState): ProductFilterState {
  return { sort: state.sort, page: DEFAULT_PAGE, search: state.search };
}

/**
 * Applies several fields at once and resets the page once.
 *
 * Used by chips that own two values (the price range), so removing them is a single URL update
 * instead of two commits built from a stale snapshot.
 */
export function applyFilterPatch(
  state: ProductFilterState,
  patch: Partial<ProductFilterState>,
): ProductFilterState {
  return { ...state, ...patch, page: DEFAULT_PAGE };
}

export type UseProductFiltersResult = {
  filters: ProductFilterState;
  /** Ready to pass to `useProducts(query)`. */
  query: ProductQuery;
  setFilter: <K extends keyof ProductFilterState>(
    key: K,
    value: ProductFilterState[K],
  ) => void;
  /** Applies several fields at once (e.g. clearing both price bounds). */
  setFilters: (patch: Partial<ProductFilterState>) => void;
  toggleFilter: (key: BooleanFilterKey) => void;
  setSort: (sort: ProductSort) => void;
  setPage: (page: number) => void;
  setSearch: (search: string, options?: { replace?: boolean }) => void;
  removeFilter: (key: ProductFilterKey) => void;
  clearFilters: () => void;
};

export function useProductFilters(options: ProductFilterOptions = {}): UseProductFiltersResult {
  const { manageCategory = true, manageSearch = true } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  const resolvedOptions = useMemo<ProductFilterOptions>(
    () => ({ manageCategory, manageSearch }),
    [manageCategory, manageSearch],
  );

  const filters = useMemo(
    () => parseProductFilters(searchParams, resolvedOptions),
    [searchParams, resolvedOptions],
  );

  const commit = useCallback(
    (next: ProductFilterState, replace = false) => {
      setSearchParams(serializeProductFilters(next, resolvedOptions), { replace });
    },
    [setSearchParams, resolvedOptions],
  );

  const setFilter = useCallback(
    <K extends keyof ProductFilterState>(key: K, value: ProductFilterState[K]) => {
      commit(setFilterValue(filters, key, value));
    },
    [commit, filters],
  );

  const toggleFilter = useCallback(
    (key: BooleanFilterKey) => commit(toggleFilterValue(filters, key)),
    [commit, filters],
  );

  const setFilters = useCallback(
    (patch: Partial<ProductFilterState>) => commit(applyFilterPatch(filters, patch)),
    [commit, filters],
  );

  const setSort = useCallback(
    (sort: ProductSort) => commit({ ...filters, sort, page: DEFAULT_PAGE }),
    [commit, filters],
  );

  const setPage = useCallback(
    (page: number) => commit({ ...filters, page }),
    [commit, filters],
  );

  const setSearch = useCallback(
    (search: string, searchOptions: { replace?: boolean } = {}) =>
      commit(setFilterValue(filters, "search", search), searchOptions.replace),
    [commit, filters],
  );

  const removeFilter = useCallback(
    (key: ProductFilterKey) => commit(clearFilterValue(filters, key)),
    [commit, filters],
  );

  const clearAll = useCallback(() => commit(clearFilters(filters)), [commit, filters]);

  const query = useMemo(() => toProductQuery(filters), [filters]);

  return {
    filters,
    query,
    setFilter,
    setFilters,
    toggleFilter,
    setSort,
    setPage,
    setSearch,
    removeFilter,
    clearFilters: clearAll,
  };
}
