import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProductReviews, submitProductReview } from "@/services/api";
import type { ProductReviewInput } from "@/services/api";

/**
 * Product reviews (`GET`/`POST /products/:id/reviews`).
 *
 * The mutation invalidates the product's review query on success. In mock mode the submitted
 * review is stored as `pending` (moderation), so it does not appear in the list until approved
 * (D-028) — the form feedback is therefore "submitted for review", not "published".
 */
export function useProductReviews(productId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: ({ signal }) => getProductReviews(productId, signal),
    enabled: productId !== "",
  });

  const mutation = useMutation({
    mutationFn: (input: ProductReviewInput) => submitProductReview(productId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
    },
  });

  return {
    reviews: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    submit: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    isSubmitted: mutation.isSuccess,
    submitError: mutation.error,
  };
}
