import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import {
  type ProductQuery,
  type ProductSort,
} from "@/services/types";

import {
  applyFilterPatch,
  clearFilterValue,
  clearFilters,
  DEFAULT_PAGE,
  parseProductFilters,
  serializeProductFilters,
  setFilterValue,
  toggleFilterValue,
  toProductQuery,
  type BooleanFilterKey,
  type ProductFilterKey,
  type ProductFilterOptions,
  type ProductFilterState,
} from "./productFiltersUtils";

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

export type {
  BooleanFilterKey,
  ProductFilterKey,
  ProductFilterOptions,
  ProductFilterState,
} from "./productFiltersUtils";

export {
  applyFilterPatch,
  clearFilterValue,
  clearFilters,
  DEFAULT_PAGE,
  DEFAULT_SORT,
  FILTER_PARAM,
  parseProductFilters,
  serializeProductFilters,
  setFilterValue,
  toggleFilterValue,
  toProductQuery,
} from "./productFiltersUtils";

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
