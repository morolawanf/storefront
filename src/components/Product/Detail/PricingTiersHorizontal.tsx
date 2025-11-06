'use client';

import React from 'react';

interface PricingTier {
    minQty: number;
    maxQty?: number;
    strategy: 'fixedPrice' | 'percentOff' | 'amountOff';
    value: number;
}

// Dummy data for demonstration
const dummyPricingTiers: PricingTier[] = [
    {
        minQty: 1,
        maxQty: 9,
        strategy: 'fixedPrice' as const,
        value: 45.0,
    },
    {
        minQty: 10,
        maxQty: 49,
        strategy: 'percentOff' as const,
        value: 10,
    },
    {
        minQty: 50,
        maxQty: 99,
        strategy: 'percentOff' as const,
        value: 15,
    },
    {
        minQty: 100,
        maxQty: 199,
        strategy: 'percentOff' as const,
        value: 20,
    },
    {
        minQty: 200,
        maxQty: 499,
        strategy: 'amountOff' as const,
        value: 10.0,
    },
    {
        minQty: 500,
        maxQty: undefined,
        strategy: 'amountOff' as const,
        value: 15.0,
    },
];

interface PricingTiersHorizontalProps {
    basePrice: number;
    tiers?: PricingTier[];
    salesDiscount?: number;
    attributePrice?: number;
    currentQuantity?: number;
    onTierClick?: (minQty: number) => void;
}

const PricingTiersHorizontal: React.FC<PricingTiersHorizontalProps> = ({
    basePrice,
    tiers = dummyPricingTiers,
    salesDiscount = 0,
    attributePrice,
    currentQuantity = 1,
    onTierClick,
}) => {
    const effectiveBasePrice = attributePrice || basePrice;
    const priceAfterSales = salesDiscount > 0
        ? effectiveBasePrice * (1 - salesDiscount / 100)
        : effectiveBasePrice;

    const calculateTierPrice = (tier: PricingTier): number => {
        switch (tier.strategy) {
            case 'fixedPrice':
                return tier.value;
            case 'percentOff':
                return priceAfterSales * (1 - tier.value / 100);
            case 'amountOff':
                return priceAfterSales - tier.value;
            default:
                return priceAfterSales;
        }
    };

    const calculateSavings = (finalPrice: number): number => {
        if (finalPrice >= effectiveBasePrice) return 0;
        return Math.round(((effectiveBasePrice - finalPrice) / effectiveBasePrice) * 100);
    };

    // Determine which tier the current quantity falls into
    const getCurrentTier = (qty: number): number => {
        for (let i = 0; i < tiers.length; i++) {
            const tier = tiers[i];
            if (qty >= tier.minQty && (tier.maxQty === undefined || qty <= tier.maxQty)) {
                return i;
            }
        }
        return -1;
    };

    const activeTierIndex = getCurrentTier(currentQuantity);

    // Calculate current unit price and total price
    const currentTier = activeTierIndex >= 0 ? tiers[activeTierIndex] : null;
    const currentUnitPrice = currentTier ? calculateTierPrice(currentTier) : priceAfterSales;
    const totalPrice = currentUnitPrice * currentQuantity;

    return (
        <div className="pricing-tiers-horizontal mt-6">
            <div className="flex items-center justify-between mb-3">
                <div className="text-title">Pricing Tier</div>
            </div>

            <div className="grid lg:grid-cols-3 sm:grid-cols-3 grid-cols-3 gap-2 sm:gap-3">
                {tiers.map((tier, index) => {
                    const finalPrice = calculateTierPrice(tier);
                    const savings = calculateSavings(finalPrice);
                    const quantityRange = tier.maxQty
                        ? `${tier.minQty}-${tier.maxQty}`
                        : `${tier.minQty}+`;
                    const isActive = index === activeTierIndex;

                    return (
                        <div
                            key={index}
                            onClick={() => onTierClick?.(tier.minQty)}
                            className={`tier-card border-2 rounded-lg p-3 transition-all duration-200 cursor-pointer group ${isActive
                                ? 'border-green-900 bg-green bg-opacity-5'
                                : 'border-line hover:border-black'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="text-sm font-semibold">{quantityRange}</div>
                                {savings > 0 && (
                                    <div className="text-xs bg-lime-500 text-white px-1.5 py-0.5 rounded font-semibold">
                                        -{savings}%
                                    </div>
                                )}
                            </div>
                            <div className="font-bold text-lg group-hover:text-black">
                                ${finalPrice.toFixed(2)}
                            </div>
                            <div className="text-xs text-secondary2 mt-0.5">per unit</div>
                        </div>
                    );
                })}
            </div>

            {(salesDiscount > 0 || (attributePrice && attributePrice !== basePrice)) && (
                <div className="text-xs text-secondary2 mt-2">
                    {attributePrice && attributePrice !== basePrice && (
                        <span>Variant price applied • </span>
                    )}
                    Prices calculated from ${priceAfterSales.toFixed(2)} base
                </div>
            )}
        </div>
    );
};

export default PricingTiersHorizontal;
