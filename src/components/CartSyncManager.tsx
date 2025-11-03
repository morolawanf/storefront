'use client';

import { useMergeGuestCart } from '@/hooks/useMergeGuestCart';
import { useEffect } from 'react';

/**
 * Cart Sync Manager
 * Handles automatic guest cart merging on login
 * Place this component inside SessionProvider and ReactQueryProvider
 */
export default function CartSyncManager({ children }: { children: React.ReactNode; }) {
    const { isMerging, mergeError, clearError } = useMergeGuestCart();

    // Log merge status for debugging
    useEffect(() => {
        if (isMerging) {
            console.log('🔄 Syncing guest cart to server...');
        }
    }, [isMerging]);

    useEffect(() => {
        if (mergeError) {
            console.error('❌ Cart merge error:', mergeError);
            // Auto-clear error after 5 seconds
            const timer = setTimeout(clearError, 5000);
            return () => clearTimeout(timer);
        }
    }, [mergeError, clearError]);

    return <>{children}</>;
}
