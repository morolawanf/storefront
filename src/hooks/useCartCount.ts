'use client';

import { useGuestCartCount } from './useGuestCart';

/**
 * Unified cart count hook
 * - ALWAYS uses localStorage for current session (both guest and authenticated users)
 * - Server cart is only for cross-device/session sync, not for current session state
 *
 * Flow:
 * 1. User adds items → localStorage (whether logged in or not)
 * 2. User logs in → localStorage cart merges TO server (for cross-device sync)
 * 3. User returns later (new session) → Server cart loads INTO localStorage
 * 4. Current session always reads from localStorage
 */
export const useCartCount = () => {
  // Always use localStorage cart count for current session
  const { count } = useGuestCartCount();

  return {
    count,
  };
};
