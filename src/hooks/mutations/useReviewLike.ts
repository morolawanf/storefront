'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import api from '@/libs/api/endpoints';
import type { Review } from '../queries/useProductReviews';

interface ToggleLikeResponse {
  message: string;
  data: {
    liked: boolean;
    likesCount: number;
  };
}

interface ToggleLikeVariables {
  reviewId: string;
  productId: string;
}

type MutationContext = {
  previousReviews?: any;
};

/**
 * Toggle like on a review with optimistic updates
 * Automatically handles authentication check and updates query cache
 *
 * @example
 * const { data: session } = useSession();
 * const toggleLike = useReviewLike({
 *   onSuccess: () => {
 *     console.log('Like toggled successfully');
 *   },
 *   onError: (error) => {
 *     if (error.message === 'AUTHENTICATION_REQUIRED') {
 *       // Redirect to login
 *       router.push('/login');
 *     }
 *   }
 * });
 *
 * // In component
 * <button onClick={() => toggleLike.mutate({ reviewId: review._id, productId })}>
 *   {review.likes.includes(session?.user?.id) ? 'Unlike' : 'Like'} ({review.likesCount})
 * </button>
 */
export const useReviewLike = (
  options?: Omit<
    UseMutationOptions<ToggleLikeResponse, Error, ToggleLikeVariables, MutationContext>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation<ToggleLikeResponse, Error, ToggleLikeVariables, MutationContext>({
    mutationFn: async ({ reviewId }: ToggleLikeVariables) => {
      // Check authentication
      if (!session?.user) {
        throw new Error('AUTHENTICATION_REQUIRED');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${api.reviews.like(reviewId)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to toggle like');
      }

      return response.json();
    },

    // Optimistic update - immediately update UI before server responds
    onMutate: async ({ reviewId, productId }) => {
      if (!session?.user?.id) return;

      // Cancel outgoing refetches to avoid race conditions
      await queryClient.cancelQueries({ queryKey: ['product-reviews', productId] });

      // Snapshot previous value for rollback
      const previousReviews = queryClient.getQueryData(['product-reviews', productId]);

      // Optimistically update the cache
      queryClient.setQueryData(['product-reviews', productId], (old: any) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((review: Review) => {
              if (review._id !== reviewId) return review;

              const userId = session.user.id;
              const isLiked = review.likes.includes(userId);

              return {
                ...review,
                likes: isLiked
                  ? review.likes.filter((id) => id !== userId)
                  : [...review.likes, userId],
                likesCount: isLiked ? review.likesCount - 1 : review.likesCount + 1,
              };
            }),
          })),
        };
      });

      return { previousReviews };
    },

    // On error, rollback to previous state
    onError: (error, variables, context) => {
      if (context?.previousReviews) {
        queryClient.setQueryData(['product-reviews', variables.productId], context.previousReviews);
      }

      // Call user-provided error handler
      options?.onError?.(error, variables, context);
    },

    // On success, invalidate to refetch and sync with server
    onSuccess: (data, variables, context) => {
      // Invalidate queries to ensure sync with server
      queryClient.invalidateQueries({
        queryKey: ['product-reviews', variables.productId],
        exact: false,
      });

      // Call user-provided success handler
      options?.onSuccess?.(data, variables, context);
    },

    ...options,
  });
};
