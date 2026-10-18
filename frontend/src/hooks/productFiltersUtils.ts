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
 * URL-driven filter state utilities for /shop, /category/:slug and /search.
 * Pure functions extracted from useProductFilters to keep files under 300 lines.
 */

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
  search: string;
};

export type ProductFilterKey = Exclude<keyof ProductFilterState, "sort" | "page" | "search">;
export type BooleanFilterKey = "inStock" | "discount" | "isNew";

export type ProductFilterOptions = {
  manageCategory?: boolean;
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

export function parseProductFilters(
  params: URLSearchParams,
  options: ProductFilterOptions = {},
): ProductFilterState {
  const { manageCategory = true, manageSearch = true } = options;
  const state: ProductFilterState = {
    sort: isProductSort(params.get(FILTER_PARAM.sort))
      ? (params.get(FILTER_PARAM.sort) as ProductSort)
      : DEFAULT_SORT,
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

export function setFilterValue<K extends keyof ProductFilterState>(
  state: ProductFilterState,
  key: K,
  value: ProductFilterState[K],
): ProductFilterState {
  return { ...state, [key]: value, page: DEFAULT_PAGE };
}

export function toggleFilterValue(
  state: ProductFilterState,
  key: BooleanFilterKey,
): ProductFilterState {
  return { ...state, [key]: state[key] === true ? undefined : true, page: DEFAULT_PAGE };
}

export function clearFilterValue(
  state: ProductFilterState,
  key: ProductFilterKey,
): ProductFilterState {
  return { ...state, [key]: undefined, page: DEFAULT_PAGE };
}

export function clearFilters(state: ProductFilterState): ProductFilterState {
  return { sort: state.sort, page: DEFAULT_PAGE, search: state.search };
}

export function applyFilterPatch(
  state: ProductFilterState,
  patch: Partial<ProductFilterState>,
): ProductFilterState {
  return { ...state, ...patch, page: DEFAULT_PAGE };
}