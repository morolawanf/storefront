import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ShippingMethodType = 'pickup' | 'normal' | 'express';

interface DiscountInfo {
  amount: number;
  couponCode?: string;
  couponDetails?: {
    code: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    minOrderValue: number;
  };
}

interface CheckoutState {
  shippingMethod: ShippingMethodType;
  discountInfo: DiscountInfo | null;
  setShippingMethod: (method: ShippingMethodType) => void;
  setDiscountInfo: (discount: DiscountInfo | null) => void;
  clearCheckoutState: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      shippingMethod: 'pickup',
      discountInfo: null,
      setShippingMethod: (method) => set({ shippingMethod: method }),
      setDiscountInfo: (discount) => set({ discountInfo: discount }),
      clearCheckoutState: () => set({ shippingMethod: 'pickup', discountInfo: null }),
    }),
    {
      name: 'checkout-storage', // localStorage key
    }
  )
);
