'use client';

import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/react-query';
import api from '@/libs/api/endpoints';

// Review Interface
export interface Review {
  _id: string;
  rating: number;
  title?: string;
  message: string;
  images?: string[];
  likes: string[]; // Array of user IDs who liked
  likesCount: number;
  createdAt: string;
  reviewBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  transactionId?: string;
  orderId?: string;
}

interface ReviewsResponse {
  message: string;
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface UseProductReviewsOptions
  extends Omit<
    UseInfiniteQueryOptions<ReviewsResponse, Error>,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  > {
  productId: string;
  limit?: number;
  filters?: {
    rating?: 1 | 2 | 3 | 4 | 5;
    hasImages?: boolean;
    sortBy?: 'recent' | 'helpful' | 'rating-high' | 'rating-low';
  };
}

/**
 * Fetches product reviews with infinite scroll pagination
 *
 * @param productId - Product ID to fetch reviews for
 * @param limit - Number of reviews per page (default: 10)
 * @param filters - Optional filters for rating, images, and sorting
 *
 * @example
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 *   isLoading
 * } = useProductReviews({
 *   productId: '507f1f77bcf86cd799439011',
 *   limit: 10,
 *   filters: { sortBy: 'helpful', hasImages: true }
 * });
 *
 * // Access all reviews
 * const allReviews = data?.pages.flatMap(page => page.data) || [];
 *
 * // Load more reviews
 * <button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
 *   {isFetchingNextPage ? 'Loading...' : hasNextPage ? 'Load More' : 'No more reviews'}
 * </button>
 */
export const useProductReviews = ({
  productId,
  limit = 10,
  filters,
  enabled,
  staleTime,
  refetchOnMount,
  refetchOnWindowFocus,
  retry,
  ...restOptions
}: UseProductReviewsOptions) => {
  return useInfiniteQuery<ReviewsResponse, Error>({
    queryKey: ['product-reviews', productId, limit, filters],
    queryFn: async ({ pageParam = 1 }) => {
      // Build query params
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(limit),
      });

      if (filters?.rating) {
        params.append('rating', String(filters.rating));
      }
      if (filters?.hasImages !== undefined) {
        params.append('hasImages', String(filters.hasImages));
      }
      if (filters?.sortBy) {
        params.append('sortBy', filters.sortBy);
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}${api.products.reviews(productId)}?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch reviews');
      }

      const result = await response.json();
      return result as ReviewsResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.meta;
      return page < pages ? page + 1 : undefined;
    },
    enabled: enabled ?? !!productId,
    staleTime: staleTime ?? 2 * 60 * 1000, // 2 minutes
    refetchOnMount: refetchOnMount ?? false,
    refetchOnWindowFocus: refetchOnWindowFocus ?? false,
    retry: retry ?? 3,
  });
};
