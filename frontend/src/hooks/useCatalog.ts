/**
 * Data hooks.
 *
 * Every server-state read in the app goes through one of these, so components never call the
 * service layer directly and caching/staleness rules live in one place.
 */

import { useQuery } from "@tanstack/react-query";

import {
  getHomeContent,
  getPublicSettings,
  listCategories,
  listProducts,
  listReviews,
  type ProductQuery,
} from "@/services/api";

/** Categories change rarely and are needed by the navbar, the drawer and the home page. */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => listCategories(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProducts(query: ProductQuery = {}) {
  return useQuery({
    queryKey: ["products", query],
    queryFn: ({ signal }) => listProducts(query, signal),
    staleTime: 60 * 1000,
  });
}

export function useHomeContent() {
  return useQuery({
    queryKey: ["content", "home"],
    queryFn: ({ signal }) => getHomeContent(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ["settings", "public"],
    queryFn: ({ signal }) => getPublicSettings(signal),
    staleTime: 10 * 60 * 1000,
  });
}

export function useHomeReviews() {
  return useQuery({
    queryKey: ["reviews", { showOnHome: true }],
    queryFn: ({ signal }) => listReviews({ showOnHome: true }, signal),
    staleTime: 5 * 60 * 1000,
  });
}
