'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { getGuestCart, clearGuestCart } from '@/libs/guestCart';
import { useAddToCart } from '@/hooks/mutations/useCart';

/**
 * Hook to merge guest cart with server cart on login
 *
 * Usage: Place in root layout or CartContext provider
 * Automatically triggers when session becomes available
 */
export function useMergeGuestCart() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();
  const [isMerging, setIsMerging] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);

  const mergeCart = useCallback(async () => {
    // Only merge if authenticated and not already merging
    if (!session?.user || isMerging) return;

    const guestCart = getGuestCart();

    // No guest cart items to merge
    if (guestCart.items.length === 0) return;

    console.log(`Merging ${guestCart.items.length} guest cart items to server...`);
    setIsMerging(true);
    setMergeError(null);

    try {
      let successCount = 0;
      let errorCount = 0;

      // Merge each guest cart item to server
      for (const item of guestCart.items) {
        try {
          await addToCart.mutateAsync({
            productId: item.product,
            qty: item.qty,
            attributes: item.selectedAttributes,
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to merge item ${item.product}:`, error);
          errorCount++;
        }
      }

      // Clear guest cart after successful merge
      if (successCount > 0) {
        clearGuestCart();

        // Invalidate cart queries to fetch updated server cart
        queryClient.invalidateQueries({ queryKey: ['cart'] });

        console.log(`Cart merge complete: ${successCount} items merged, ${errorCount} errors`);
      }

      if (errorCount > 0) {
        setMergeError(`Some items could not be added (${errorCount} failed)`);
      }
    } catch (error) {
      console.error('Cart merge error:', error);
      setMergeError('Failed to merge cart. Please try again.');
    } finally {
      setIsMerging(false);
    }
  }, [session, isMerging, addToCart, queryClient]);

  // Watch for session changes - merge when user logs in
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Small delay to ensure session is fully initialized
      const timer = setTimeout(() => {
        mergeCart();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [status, session, mergeCart]);

  return {
    isMerging,
    mergeError,
    clearError: () => setMergeError(null),
  };
}
