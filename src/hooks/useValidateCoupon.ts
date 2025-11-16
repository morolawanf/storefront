'use client';

import { useMutation } from '@tanstack/react-query';
import type { ValidateCouponRequest, ValidateCouponResponse } from '@/types/coupon';

/**
 * Validate a coupon code and calculate discount
 */
export const useValidateCoupon = () => {
  return useMutation<ValidateCouponResponse, Error, ValidateCouponRequest>({
    mutationFn: async (request: ValidateCouponRequest) => {
      const baseURL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseURL}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Request failed with status code 404');
        }
        // For 400 or other errors, try to get the error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status code ${response.status}`);
      }

      const result = await response.json();
      console.log(result);

      return result;
    },
  });
};
