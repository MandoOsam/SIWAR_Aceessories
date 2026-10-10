/**
 * Catalogue service — products, categories and search.
 *
 * One function per endpoint in `02-architecture.md` §7 (public group). Each function returns the
 * exact shape the real endpoint returns, so components and TanStack Query hooks do not change
 * when `VITE_API_URL` is set: `IS_MOCK_MODE` picks the implementation, nothing else.
 */

import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { popularSearches } from "@/data/search";
import { DEFAULT_PAGE_LIMIT } from "@/config/app";
import { IS_MOCK_MODE } from "@/config/env";

import { getList, getOne } from "./http";
import { paginate, simulateLatency } from "./mockAdapter";
import type {
  Category,
  CategorySlug,
  L10n,
  Paginated,
  Product,
  ProductDetail,
  ProductQuery,
  SearchSuggestResponse,
} from "./types";

function filterProducts(query: ProductQuery): Product[] {
  const search = query.search?.trim().toLowerCase();
  const matchesName = (product: Product, term: string): boolean =>
    product.name.ar.toLowerCase().includes(term) || product.name.en.toLowerCase().includes(term);

  return products.filter((product) => {
    if (query.category !== undefined && product.category.slug !== query.category) return false;
    if (query.minPrice !== undefined && product.price < query.minPrice) return false;
    if (query.maxPrice !== undefined && product.price > query.maxPrice) return false;
    if (query.rating !== undefined && product.rating < query.rating) return false;
    if (query.inStock === true && product.stock <= 0) return false;
    if (query.color !== undefined && !product.colors.includes(query.color)) return false;
    if (query.size !== undefined && !(product.sizes ?? []).includes(query.size)) return false;
    if (query.discount === true && product.oldPrice === undefined) return false;
    if (query.isNew === true && !product.isNew) return false;
    if (search !== undefined && search !== "" && !matchesName(product, search)) return false;
    return true;
  });
}

function sortProducts(items: Product[], sort: ProductQuery["sort"]): Product[] {
  const sorted = [...items];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "best-selling":
      return sorted.sort((a, b) => b.reviewsCount - a.reviewsCount);
    case "newest":
    case undefined:
      return sorted.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }
}

function toQueryString(query: ProductQuery): string {
  const params = new URLSearchParams();
  const set = (key: string, value: string | number | boolean | undefined): void => {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  };

  set("category", query.category);
  set("minPrice", query.minPrice);
  set("maxPrice", query.maxPrice);
  set("rating", query.rating);
  set("inStock", query.inStock);
  set("color", query.color);
  set("size", query.size);
  set("discount", query.discount);
  set("isNew", query.isNew);
  set("sort", query.sort);
  set("page", query.page);
  set("limit", query.limit);
  set("search", query.search);

  const serialized = params.toString();
  return serialized === "" ? "" : `?${serialized}`;
}

/** `GET /products` */
export async function listProducts(
  query: ProductQuery = {},
  signal?: AbortSignal,
): Promise<Paginated<Product>> {
  if (!IS_MOCK_MODE) {
    return getList<Product>(`/products${toQueryString(query)}`, signal);
  }
  await simulateLatency(signal);
  const sorted = sortProducts(filterProducts(query), query.sort);
  return paginate(sorted, query.page ?? 1, query.limit ?? DEFAULT_PAGE_LIMIT);
}

/** `GET /products/:slug` — product details plus related and matching products. */
export async function getProductBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<ProductDetail | null> {
  if (!IS_MOCK_MODE) {
    return getOne<ProductDetail | null>(`/products/${encodeURIComponent(slug)}`, signal);
  }
  await simulateLatency(signal);
  const product = products.find((item) => item.slug === slug);
  if (product === undefined) {
    return null;
  }
  const sameCategory = products.filter(
    (item) => item.slug !== slug && item.category.slug === product.category.slug,
  );
  const others = products.filter(
    (item) => item.slug !== slug && item.category.slug !== product.category.slug,
  );
  return {
    product,
    matching: sameCategory.slice(0, 4),
    related: [...sameCategory, ...others].slice(0, 8),
  };
}

/** `GET /categories` */
export async function listCategories(signal?: AbortSignal): Promise<Category[]> {
  if (!IS_MOCK_MODE) {
    const response = await getList<Category>("/categories", signal);
    return response.data;
  }
  await simulateLatency(signal);
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** `GET /categories/:slug` */
export async function getCategoryBySlug(
  slug: CategorySlug,
  signal?: AbortSignal,
): Promise<Category | null> {
  if (!IS_MOCK_MODE) {
    return getOne<Category | null>(`/categories/${encodeURIComponent(slug)}`, signal);
  }
  await simulateLatency(signal);
  return categories.find((category) => category.slug === slug) ?? null;
}

/** `GET /search/suggest?q=` */
export async function searchSuggest(
  query: string,
  signal?: AbortSignal,
): Promise<SearchSuggestResponse> {
  if (!IS_MOCK_MODE) {
    return getOne<SearchSuggestResponse>(`/search/suggest?q=${encodeURIComponent(query)}`, signal);
  }
  await simulateLatency(signal);
  const term = query.trim().toLowerCase();

  if (term === "") {
    return {
      suggestions: categories.map((category) => ({
        type: "category",
        label: category.name,
        href: `/category/${category.slug}`,
        imageUrl: category.imageUrl,
      })),
      popularSearches,
    };
  }

  // Both sides are lower-cased, so `?q=necklaces` and `?q=NECKLACES` behave the same. English
  // names start with a capital, so matching the raw term would only ever find a capitalised query.
  const matches = (name: L10n): boolean =>
    name.ar.toLowerCase().includes(term) || name.en.toLowerCase().includes(term);

  const suggestions = [
    ...categories
      .filter((category) => matches(category.name))
      .map((category) => ({
        type: "category" as const,
        label: category.name,
        href: `/category/${category.slug}`,
        imageUrl: category.imageUrl,
      })),
    ...products
      .filter((product) => matches(product.name))
      .slice(0, 6)
      .map((product) => ({
        type: "product" as const,
        label: product.name,
        href: `/products/${product.slug}`,
        imageUrl: product.images[0]?.url,
      })),
  ];

  return { suggestions, popularSearches };
}
