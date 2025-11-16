'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/api/axios';
import api from '@/libs/api/endpoints';
import type { Coupon } from '@/types/coupon';

/**
 * Fetch all active coupons
 */
export const useAllCoupons = () => {
  return useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: async () => {
      const response = await apiClient.get<Coupon[]>(api.coupons.list);
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch coupons to display on cart page (showOnCartPage: true)
 */
export const useCartCoupons = () => {
  return useQuery<Coupon[]>({
    queryKey: ['coupons', 'cart'],
    queryFn: async () => {
      const response = await apiClient.get<Coupon[]>(api.coupons.cart);
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch a specific coupon by code
 */
export const useCouponByCode = (code: string) => {
  return useQuery<Coupon>({
    queryKey: ['coupon', code],
    queryFn: async () => {
      const response = await apiClient.get<Coupon>(api.coupons.byCode(code));
      if (!response.data) {
        throw new Error('Coupon not found');
      }
      return response.data;
    },
    enabled: !!code && code.length >= 4, // Only fetch if code is at least 4 chars
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
