'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { apiClient, handleApiError } from '@/libs/api/axios';
import api from '@/libs/api/endpoints';
import { Cart } from '@/hooks/queries/useCart';

export interface AddToCartInput {
  productId: string;
  qty: number;
  attributes: Array<{
    name: string;
    value: string;
  }>;
}

export interface UpdateCartItemInput {
  qty?: number;
  selectedAttributes?: Array<{
    name: string;
    value: string;
  }>;
}

/**
 * Hook to add an item to the cart
 * @param options - Additional mutation options
 * @returns Mutation result with cart data
 */
export const useAddToCart = (options?: UseMutationOptions<Cart, Error, AddToCartInput>) => {
  const queryClient = useQueryClient();

  return useMutation<Cart, Error, AddToCartInput>({
    mutationFn: async (data: AddToCartInput) => {
      const response = await apiClient.post<Cart>(api.cart.add, data);
      if (!response.data) {
        throw new Error('No cart data returned');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      console.error('Add to cart error:', errorMessage, error);
    },
    ...options,
  });
};

/**
 * Hook to update a cart item quantity or attributes
 * @param options - Additional mutation options
 * @returns Mutation result with cart data
 */
export const useUpdateCartItem = (
  options?: UseMutationOptions<Cart, Error, { itemId: string; data: UpdateCartItemInput }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Cart, Error, { itemId: string; data: UpdateCartItemInput }>({
    mutationFn: async ({ itemId, data }) => {
      const response = await apiClient.put<Cart>(api.cart.item(itemId), data);
      if (!response.data) {
        throw new Error('No cart data returned');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      console.error('Update cart item error:', errorMessage, error);
    },
    ...options,
  });
};

/**
 * Hook to remove an item from the cart
 * @param options - Additional mutation options
 * @returns Mutation result with cart data
 */
export const useRemoveCartItem = (options?: UseMutationOptions<Cart, Error, string>) => {
  const queryClient = useQueryClient();

  return useMutation<Cart, Error, string>({
    mutationFn: async (itemId: string) => {
      const response = await apiClient.delete<Cart>(api.cart.item(itemId));
      if (!response.data) {
        throw new Error('No cart data returned');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      console.error('Remove cart item error:', errorMessage, error);
    },
    ...options,
  });
};

/**
 * Hook to clear the entire cart
 * @param options - Additional mutation options
 * @returns Mutation result
 */
export const useClearCart = (options?: UseMutationOptions<void, Error, void>) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiClient.delete<void>(api.cart.clear);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      console.error('Clear cart error:', errorMessage, error);
    },
    ...options,
  });
};

/**
 * Hook to apply a coupon to the cart
 * @param options - Additional mutation options
 * @returns Mutation result with cart data
 */
export const useApplyCoupon = (options?: UseMutationOptions<Cart, Error, string>) => {
  const queryClient = useQueryClient();

  return useMutation<Cart, Error, string>({
    mutationFn: async (couponCode: string) => {
      const response = await apiClient.post<Cart>(api.cart.coupon, { couponCode });
      if (!response.data) {
        throw new Error('No cart data returned');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      console.error('Apply coupon error:', errorMessage, error);
    },
    ...options,
  });
};

/**
 * Hook to remove a coupon from the cart
 * @param options - Additional mutation options
 * @returns Mutation result with cart data
 */
export const useRemoveCoupon = (options?: UseMutationOptions<Cart, Error, string>) => {
  const queryClient = useQueryClient();

  return useMutation<Cart, Error, string>({
    mutationFn: async (couponId: string) => {
      const response = await apiClient.delete<Cart>(api.cart.removeCoupon(couponId));
      if (!response.data) {
        throw new Error('No cart data returned');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      console.error('Remove coupon error:', errorMessage, error);
    },
    ...options,
  });
};
