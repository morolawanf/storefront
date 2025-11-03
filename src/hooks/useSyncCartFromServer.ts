'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/hooks/queries/useCart';
import { setGuestCart, getGuestCart } from '@/libs/guestCart';

/**
 * Hook to sync server cart TO localStorage when user returns (new session)
 *
 * Flow:
 * 1. User logs in → localStorage cart merges TO server (useMergeGuestCart)
 * 2. User closes browser/tab
 * 3. User returns later → Server cart loads INTO localStorage (this hook)
 * 4. Current session always uses localStorage
 *
 * Usage: Place in root layout or app initialization
 */
export function useSyncCartFromServer() {
  const { data: session, status } = useSession();
  const { data: serverCart, isLoading } = useCart();
  const [hasSynced, setHasSynced] = useState(false);

  const syncFromServer = useCallback(() => {
    // Only sync once per session when authenticated
    if (!session?.user || hasSynced || isLoading) return;

    const localCart = getGuestCart();

    // If localStorage is empty and server has items, sync them down
    if (localCart.items.length === 0 && serverCart && serverCart.items.length > 0) {
      console.log(`Syncing ${serverCart.items.length} items from server to localStorage...`);

      // Convert server cart items to guest cart format
      const guestCartItems = serverCart.items.map((item) => ({
        _id: item._id,
        product: item.product,
        qty: item.qty,
        selectedAttributes: item.selectedAttributes,
        productSnapshot: item.productSnapshot,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        sale: item.sale,
        saleVariantIndex: item.saleVariantIndex,
        addedAt: item.addedAt,
      }));

      // Save to localStorage
      setGuestCart({
        items: guestCartItems,
        lastUpdated: new Date().toISOString(),
      });

      setHasSynced(true);
      console.log('Server cart synced to localStorage');
    } else if (localCart.items.length > 0) {
      // Local cart already has items - don't overwrite
      setHasSynced(true);
      console.log('Local cart has items - skipping server sync');
    }
  }, [session, serverCart, hasSynced, isLoading]);

  // Sync when session is authenticated and cart data is loaded
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !isLoading) {
      syncFromServer();
    }
  }, [status, session, isLoading, syncFromServer]);

  return {
    hasSynced,
  };
}
