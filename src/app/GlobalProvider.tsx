import React from 'react';
import { CartProvider } from '@/context/CartContext';
import { ModalCartProvider } from '@/context/ModalCartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ModalWishlistProvider } from '@/context/ModalWishlistContext';
import { CompareProvider } from '@/context/CompareContext';
import { ModalCompareProvider } from '@/context/ModalCompareContext';
import { ModalSearchProvider } from '@/context/ModalSearchContext';
import { ModalQuickviewProvider } from '@/context/ModalQuickviewContext';
import ReactQueryProvider from '@/provider/react-query';
import { SessionProvider } from 'next-auth/react';
import ServerQueries from '@/provider/Server-queries';
import CartSyncManager from '@/components/CartSyncManager';

const GlobalProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
    return (
        <SessionProvider>
            <ReactQueryProvider>
                <ServerQueries>
                    <CartSyncManager>
                        <CartProvider>
                            <ModalCartProvider>
                                <WishlistProvider>
                                    <ModalWishlistProvider>
                                        <CompareProvider>
                                            <ModalCompareProvider>
                                                <ModalSearchProvider>
                                                    <ModalQuickviewProvider>
                                                        {children}
                                                    </ModalQuickviewProvider>
                                                </ModalSearchProvider>
                                            </ModalCompareProvider>
                                        </CompareProvider>
                                    </ModalWishlistProvider>
                                </WishlistProvider>
                            </ModalCartProvider>
                        </CartProvider>
                    </CartSyncManager>
                </ServerQueries>
            </ReactQueryProvider>
        </SessionProvider>
    );
};
export default GlobalProvider;