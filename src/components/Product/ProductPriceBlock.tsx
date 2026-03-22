'use client';

import React from 'react';
import { formatToNaira } from '@/utils/currencyFormatter';

interface ProductSalePriceUi {
    hasActiveSale: boolean;
    discountedPrice: number;
    originalPrice: number;
    percentOff: number;
    basePrice: number;
}

interface ProductPriceBlockProps {
    priceUi: ProductSalePriceUi;
}

const ProductPriceBlock: React.FC<ProductPriceBlockProps> = ({ priceUi }) => {
    return (
        <div className="product-price-block flex items-center gap-2 flex-wrap mt-0.5 duration-300 relative z-[1]">
            {priceUi.hasActiveSale ? (
                <>
                    <div className="product-price text-title">{formatToNaira(priceUi.discountedPrice)}</div>
                    <div className="product-origin-price caption1 text-secondary2">
                        <del>{formatToNaira(priceUi.originalPrice)}</del>
                    </div>
                    <div className="product-sale text-xs font-medium bg-green px-1.5 md:px-2 py-0.5 inline-block rounded-full">
                        -{priceUi.percentOff}%
                    </div>
                </>
            ) : (
                <div className="product-price text-title">{formatToNaira(priceUi.basePrice)}</div>
            )}
        </div>
    );
};

export default ProductPriceBlock;
