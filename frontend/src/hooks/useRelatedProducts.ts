import { useQuery } from "@tanstack/react-query";

import { getProductBySlug } from "@/services/api";

/**
 * Related and matching products for the product page. Reuses the same query key as `useProduct`,
 * so the data comes from one cached request rather than a second call (D-027).
 */
export function useRelatedProducts(slug: string) {
  const query = useQuery({
    queryKey: ["product", slug],
    queryFn: ({ signal }) => getProductBySlug(slug, signal),
    enabled: slug !== "",
  });

  return {
    related: query.data?.related ?? [],
    matching: query.data?.matching ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
