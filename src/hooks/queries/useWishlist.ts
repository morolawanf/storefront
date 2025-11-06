import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/libs/api/axios';
import api from '@/libs/api/endpoints';
import { queryKeys } from '@/provider/react-query';
import { WishlistItem, WishlistMeta } from '@/types/wishlist';

/**
 * Fetch wishlist items with pagination
 */
const fetchWishlistItems = async (
  page: number = 1,
  limit: number = 30
): Promise<{ data: WishlistItem[]; meta: WishlistMeta }> => {
  const response = await apiClient.getWithMeta<WishlistItem[], WishlistMeta>(
    `${api.wishlist.list}?page=${page}&limit=${limit}`
  );

  if (!response.data) {
    return {
      data: [],
      meta: { total: 0, page, limit, pages: 0, hasNext: false, hasPrev: false },
    };
  }

  return { data: response.data, meta: response.meta! };
};

/**
 * Fetch wishlist count
 */
const fetchWishlistCount = async (): Promise<number> => {
  const response = await apiClient.get<number>(api.wishlist.count);
  return response.data || 0;
};

/**
 * Hook to get wishlist items with pagination
 */
export const useWishlistItems = (
  page: number = 1,
  limit: number = 30
): UseQueryResult<{ data: WishlistItem[]; meta: WishlistMeta }, Error> => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: queryKeys.wishlist.list(page),
    queryFn: () => fetchWishlistItems(page, limit),
    enabled: !!session?.user, // Only fetch if authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
};

/**
 * Hook to get total wishlist count
 */
export const useWishlistCount = (): UseQueryResult<number, Error> => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: queryKeys.wishlist.count(),
    queryFn: fetchWishlistCount,
    enabled: !!session?.user, // Only fetch if authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
};

/**
 * Hook to check if a product is in the wishlist
 * Scans only page 1 cache (first 30 items from server prefetch)
 * Returns wishlist item ID for removal operations
 */
export const useIsInWishlist = (
  productId: string
): { isInWishlist: boolean; wishlistItemId: string | null } => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  // If not authenticated, product cannot be in wishlist
  if (!session?.user) {
    return { isInWishlist: false, wishlistItemId: null };
  }

  // Get cached wishlist data from page 1 (most recent 30 items)
  const cachedData = queryClient.getQueryData<{ data: WishlistItem[]; meta: WishlistMeta }>(
    queryKeys.wishlist.list(1)
  );

  if (!cachedData?.data) {
    return { isInWishlist: false, wishlistItemId: null };
  }

  // Search for product in cached wishlist items
  const wishlistItem = cachedData.data.find((item) => item.product._id === productId);

  return {
    isInWishlist: !!wishlistItem,
    wishlistItemId: wishlistItem?._id || null,
  };
};
