'use client';

// ModalQuickviewContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalQuickviewContextProps {
    children: ReactNode;
}

interface ModalQuickviewContextValue {
    selectedProductId: string | null;
    openQuickview: (productId: string) => void;
    closeQuickview: () => void;
}

const ModalQuickviewContext = createContext<ModalQuickviewContextValue | undefined>(undefined);

export const ModalQuickviewProvider: React.FC<ModalQuickviewContextProps> = ({ children }) => {
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    const openQuickview = (productId: string) => {
        setSelectedProductId(productId);
    };

    const closeQuickview = () => {
        setSelectedProductId(null);
    };

    return (
        <ModalQuickviewContext.Provider value={{ selectedProductId, openQuickview, closeQuickview }}>
            {children}
        </ModalQuickviewContext.Provider>
    );
};

export const useModalQuickviewContext = () => {
    const context = useContext(ModalQuickviewContext);
    if (!context) {
        throw new Error('useModalQuickviewContext must be used within a ModalQuickviewProvider');
    }
    return context;
};
