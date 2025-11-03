'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getGuestCart,
  addToGuestCart as addToGuestCartUtil,
  updateGuestCartItem as updateGuestCartItemUtil,
  removeFromGuestCart as removeFromGuestCartUtil,
  clearGuestCart as clearGuestCartUtil,
  getGuestCartItemCount,
  getGuestCartTotals,
  hasGuestCart,
  GuestCart,
  GuestCartItem,
} from '@/libs/guestCart';

/**
 * Hook for managing guest cart with reactive state
 * Use this in components for automatic re-renders on cart changes
 */
export function useGuestCart() {
  const [cart, setCart] = useState<GuestCart>(() => getGuestCart());
  const [itemCount, setItemCount] = useState<number>(0);

  // Refresh cart state from localStorage
  const refreshCart = useCallback(() => {
    const updatedCart = getGuestCart();
    setCart(updatedCart);
    setItemCount(updatedCart.items.reduce((count, item) => count + item.qty, 0));
  }, []);

  // Listen for storage changes (sync across tabs) and custom events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'oep-cart-1') {
        refreshCart();
      }
    };

    const handleCartUpdate = () => {
      refreshCart();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('guestCartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('guestCartUpdated', handleCartUpdate);
    };
  }, [refreshCart]);

  // Add item to cart
  const addItem = useCallback(
    (
      productId: string,
      qty: number,
      attributes: Array<{ name: string; value: string }>,
      productSnapshot: { name: string; price: number; sku: string | number; image?: string },
      unitPrice: number,
      sale?: string,
      saleVariantIndex?: number
    ): GuestCartItem => {
      const item = addToGuestCartUtil(
        productId,
        qty,
        attributes,
        productSnapshot,
        unitPrice,
        sale,
        saleVariantIndex
      );
      refreshCart();
      return item;
    },
    [refreshCart]
  );

  // Update cart item
  const updateItem = useCallback(
    (
      itemId: string,
      updates: {
        qty?: number;
        selectedAttributes?: Array<{ name: string; value: string }>;
      }
    ): GuestCartItem | null => {
      const item = updateGuestCartItemUtil(itemId, updates);
      refreshCart();
      return item;
    },
    [refreshCart]
  );

  // Remove item from cart
  const removeItem = useCallback(
    (itemId: string): boolean => {
      const success = removeFromGuestCartUtil(itemId);
      refreshCart();
      return success;
    },
    [refreshCart]
  );

  // Clear cart
  const clearCart = useCallback(() => {
    clearGuestCartUtil();
    refreshCart();
  }, [refreshCart]);

  // Get totals
  const getTotals = useCallback(() => {
    return getGuestCartTotals();
  }, []);

  return {
    cart,
    items: cart.items,
    itemCount,
    hasItems: cart.items.length > 0,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    refreshCart,
    getTotals,
  };
}

/**
 * Lightweight hook for just the cart item count
 * Use in headers/badges where you only need the count
 */
export function useGuestCartCount() {
  const [count, setCount] = useState<number>(() => getGuestCartItemCount());

  const refreshCount = useCallback(() => {
    setCount(getGuestCartItemCount());
  }, []);

  // Listen for storage changes and custom events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'oep-cart-1') {
        refreshCount();
      }
    };

    const handleCartUpdate = () => {
      refreshCount();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('guestCartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('guestCartUpdated', handleCartUpdate);
    };
  }, [refreshCount]);

  return { count, refreshCount };
}

/**
 * Hook to check if user has a guest cart
 * Useful for showing merge prompts on login
 */
export function useHasGuestCart() {
  const [hasCart, setHasCart] = useState<boolean>(() => hasGuestCart());

  const checkCart = useCallback(() => {
    setHasCart(hasGuestCart());
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'oep-cart-1') {
        checkCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkCart]);

  return { hasCart, checkCart };
}
