import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/libs/api/axios';
import api from '@/libs/api/endpoints';
import { queryKeys } from '@/provider/react-query';
import { WishlistItem, WishlistMeta, AddToWishlistInput, OptimisticWishlistProduct } from '@/types/wishlist';

/**
 * Add product to wishlist mutation
 * Uses optimistic updates with snapshot/rollback pattern
 */
export const useAddToWishlist = (): UseMutationResult<
  null,
  Error,
  { productId: string; product: OptimisticWishlistProduct },
  { previousData: { data: WishlistItem[]; meta: WishlistMeta } | undefined; previousCount: number | undefined }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId }: { productId: string; product: OptimisticWishlistProduct }) => {
      const input: AddToWishlistInput = { product: productId };
      const response = await apiClient.post<null>(api.wishlist.add, input);
      return response.data;
    },

    // Optimistic update before API call
    onMutate: async ({ productId, product }) => {
      // Cancel outgoing queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.wishlist.list(1) });
      await queryClient.cancelQueries({ queryKey: queryKeys.wishlist.count() });

      // Snapshot current state for rollback
      const previousData = queryClient.getQueryData<{ data: WishlistItem[]; meta: WishlistMeta }>(
        queryKeys.wishlist.list(1)
      );
      const previousCount = queryClient.getQueryData<number>(queryKeys.wishlist.count());

      // Optimistically create temp wishlist item
      const tempWishlistItem: WishlistItem = {
        _id: `temp-${productId}-${Date.now()}`,
        product: product,
        user: '', // Will be set by server
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update page 1 cache: prepend new item (most recent first)
      if (previousData) {
        queryClient.setQueryData<{ data: WishlistItem[]; meta: WishlistMeta }>(
          queryKeys.wishlist.list(1),
          {
            data: [tempWishlistItem, ...previousData.data],
            meta: {
              ...previousData.meta,
              total: previousData.meta.total + 1,
            },
          }
        );
      }

      // Increment count cache
      if (typeof previousCount === 'number') {
        queryClient.setQueryData<number>(queryKeys.wishlist.count(), previousCount + 1);
      }

      // Return snapshot for rollback
      return { previousData, previousCount };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.wishlist.list(1), context.previousData);
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(queryKeys.wishlist.count(), context.previousCount);
      }
      console.error('Failed to add to wishlist:', err);
    },

    // Always refetch after mutation (success or error) to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
    },
  });
};

/**
 * Remove product from wishlist mutation
 * Uses optimistic updates with snapshot/rollback pattern
 */
export const useRemoveFromWishlist = (): UseMutationResult<
  null,
  Error,
  string,
  { previousData: { data: WishlistItem[]; meta: WishlistMeta } | undefined; previousCount: number | undefined }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wishlistItemId: string) => {
      const response = await apiClient.delete<null>(api.wishlist.remove(wishlistItemId));
      return response.data;
    },

    // Optimistic update before API call
    onMutate: async (wishlistItemId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.wishlist.list(1) });
      await queryClient.cancelQueries({ queryKey: queryKeys.wishlist.count() });

      // Snapshot current state
      const previousData = queryClient.getQueryData<{ data: WishlistItem[]; meta: WishlistMeta }>(
        queryKeys.wishlist.list(1)
      );
      const previousCount = queryClient.getQueryData<number>(queryKeys.wishlist.count());

      // Optimistically remove item from page 1 cache
      if (previousData) {
        queryClient.setQueryData<{ data: WishlistItem[]; meta: WishlistMeta }>(
          queryKeys.wishlist.list(1),
          {
            data: previousData.data.filter((item) => item._id !== wishlistItemId),
            meta: {
              ...previousData.meta,
              total: Math.max(0, previousData.meta.total - 1),
            },
          }
        );
      }

      // Decrement count cache
      if (typeof previousCount === 'number') {
        queryClient.setQueryData<number>(queryKeys.wishlist.count(), Math.max(0, previousCount - 1));
      }

      // Return snapshot for rollback
      return { previousData, previousCount };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.wishlist.list(1), context.previousData);
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(queryKeys.wishlist.count(), context.previousCount);
      }
      console.error('Failed to remove from wishlist:', err);
    },

    // Always refetch after mutation to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
    },
  });
};
