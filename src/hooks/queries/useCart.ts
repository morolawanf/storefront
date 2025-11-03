'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/api/axios';
import api from '@/libs/api/endpoints';
import { Product } from '@/types/product';

export interface CartItem {
  _id: string;
  product: string;
  qty: number;
  productSnapshot: {
    name: string;
    price: number;
    sku: string | number;
  };
  selectedAttributes: Array<{
    name: string;
    value: string;
  }>;
  productDetails?: Product | null;
  unitPrice: number;
  totalPrice: number;
  sale?: string;
  saleVariantIndex?: number;
  appliedDiscount: number;
  discountAmount: number;
  pricingTier?: {
    minQty: number;
    maxQty?: number;
    strategy: string;
    value: number;
    appliedPrice: number;
  };
  addedAt: string;
}

export interface CouponDetails {
  _id: string;
  coupon: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  minOrderValue: number;
  maxDiscount?: number;
  active: boolean;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  timesUsed: number;
}

export interface AppliedCoupon {
  coupon: string;
  code: string;
  couponDetails?: CouponDetails | null;
  discountAmount: number;
  appliedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  subtotal: number;
  totalDiscount: number;
  couponDiscount: number;
  total: number;
  appliedCoupons: AppliedCoupon[];
  status: 'active' | 'abandoned' | 'converted';
  estimatedShipping: {
    cost: number;
    days: number;
  };
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartValidationResult {
  valid: boolean;
  message: string;
  updatedItems?: Array<{
    itemId: string;
    productId: string;
    productName: string;
    reason: 'price_changed' | 'sale_expired' | 'sale_reduced';
    oldPrice: number;
    newPrice: number;
    oldDiscount?: number;
    newDiscount?: number;
  }>;
  outOfStockItems?: Array<{
    itemId: string;
    productId: string;
    productName: string;
    requestedQty: number;
    availableStock: number;
  }>;
  totals?: {
    oldSubtotal: number;
    newSubtotal: number;
    totalDiscount: number;
    total: number;
  };
}

/**
 * Hook to fetch the current user's cart
 * Returns cart with items, totals, and applied coupons
 * @returns Query result with cart data
 */
export const useCart = () => {
  return useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await apiClient.get<Cart>(api.cart.get);
      if (!response.data) {
        throw new Error('No cart data returned');
      }
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds - cart changes frequently
    retry: 1,
  });
};

/**
 * Hook to validate cart sales and pricing before checkout
 * Returns validation result with updated items and OOS items
 * @returns Query result with validation data
 */
export const useValidateCartSales = () => {
  return useQuery<CartValidationResult>({
    queryKey: ['cart', 'validate-sales'],
    queryFn: async () => {
      const response = await apiClient.get<CartValidationResult>(api.cart.validateSales);
      if (!response.data) {
        throw new Error('No validation data returned');
      }
      return response.data;
    },
    enabled: false, // Only run when explicitly triggered
    staleTime: 0, // Always fresh validation
    retry: 0,
  });
};
