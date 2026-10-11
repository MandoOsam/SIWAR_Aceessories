import { useQuery } from "@tanstack/react-query";

import { getProductBySlug } from "@/services/api";

/**
 * One product detail (`GET /products/:slug`), which already carries its related and matching
 * lists. `useProduct` and `useRelatedProducts` share the same query key, so mounting both on the
 * product page triggers a single request (D-027).
 */
export function useProduct(slug: string) {
  const query = useQuery({
    queryKey: ["product", slug],
    queryFn: ({ signal }) => getProductBySlug(slug, signal),
    enabled: slug !== "",
  });

  return {
    product: query.data?.product ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    /** True only once the request succeeded but the slug matched nothing. */
    isNotFound: query.isSuccess && query.data === null,
    refetch: query.refetch,
  };
}
