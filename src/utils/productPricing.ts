import { ProductDetail } from '@/hooks/queries/useProduct';

/**
 * Utility functions for product pricing calculations
 * Handles complex pricing logic with multiple layers:
 * 1. Base price
 * 2. Attribute price adjustments
 * 3. Pricing tier discounts
 * 4. Sales discounts (Flash/Limited/Normal)
 */

interface SelectedAttributes {
  [attributeName: string]: string; // attributeName -> selected child name
}

interface PricingTier {
  minQuantity: number;
  strategy: 'fixedPrice' | 'percentOff' | 'amountOff';
  fixedPrice?: number;
  percentOff?: number;
  amountOff?: number;
}

interface SaleVariant {
  variantId: string | null;
  discount?: number;
  amountOff?: number;
  maxBuys?: number;
  boughtCount?: number;
}

/**
 * Calculate total price for a product with all pricing factors
 *
 * Calculation order (precedence):
 * 1. Base price + attribute price
 * 2. Apply pricing tier discount (if applicable)
 * 3. Apply sales discount (if applicable)
 * 4. Multiply by quantity
 *
 * @param product - Full product detail
 * @param selectedAttributes - Map of selected attribute names to child names
 * @param quantity - Purchase quantity
 * @returns Object with breakdown of pricing

export function calculateTotalPrice(
  product: ProductDetail,
  selectedAttributes: SelectedAttributes,
  quantity: number
): {
  basePrice: number;
  attributePrice: number;
  subtotal: number; // base + attribute
  tierDiscount: number;
  priceAfterTier: number;
  salesDiscount: number;
  finalUnitPrice: number;
  totalPrice: number;
  appliedTier?: PricingTier;
  appliedSale?: SaleVariant;
} {
  // Step 1: Base price
  const basePrice = product.price;

  // Step 2: Calculate attribute price adjustments
  let attributePrice = 0;
  if (product.attributes && selectedAttributes) {
    for (const attribute of product.attributes) {
      const selectedChildName = selectedAttributes[attribute.name];
      if (selectedChildName) {
        const selectedChild = attribute.children.find((child) => child.name === selectedChildName);
        if (selectedChild) {
          attributePrice += selectedChild?.price || 0;
        }
      }
    }
  }

  const subtotal = basePrice + attributePrice;

  // Step 3: Apply pricing tier discount
  let tierDiscount = 0;
  let priceAfterTier = subtotal;
  let appliedTier: PricingTier | undefined;

  if (product.pricingTiers && product.pricingTiers.length > 0) {
    // Find applicable tier (highest minQuantity that's <= quantity)
    const applicableTiers = product.pricingTiers
      .filter((tier) => tier.minQuantity <= quantity)
      .sort((a, b) => b.minQuantity - a.minQuantity);

    if (applicableTiers.length > 0) {
      appliedTier = applicableTiers[0];

      if (appliedTier.strategy === 'fixedPrice' && appliedTier.fixedPrice !== undefined) {
        priceAfterTier = appliedTier.fixedPrice;
        tierDiscount = subtotal - appliedTier.fixedPrice;
      } else if (appliedTier.strategy === 'percentOff' && appliedTier.percentOff !== undefined) {
        tierDiscount = subtotal * (appliedTier.percentOff / 100);
        priceAfterTier = subtotal - tierDiscount;
      } else if (appliedTier.strategy === 'amountOff' && appliedTier.amountOff !== undefined) {
        tierDiscount = appliedTier.amountOff;
        priceAfterTier = Math.max(0, subtotal - appliedTier.amountOff);
      }
    }
  }

  // Step 4: Apply sales discount
  let salesDiscount = 0;
  let finalUnitPrice = priceAfterTier;
  let appliedSale: SaleVariant | undefined;

  if (product.sale?.isActive && product.sale.variants) {
    // Build variant ID from selected attributes
    const variantId = buildVariantId(selectedAttributes);

    // Find matching sale variant (exact match or null for base product)
    const saleVariant =
      product.sale.variants.find((v) => v.variantId === variantId) ||
      product.sale.variants.find((v) => v.variantId === null);

    if (saleVariant) {
      appliedSale = saleVariant;

      if (saleVariant.discount !== undefined) {
        salesDiscount = priceAfterTier * (saleVariant.discount / 100);
        finalUnitPrice = priceAfterTier - salesDiscount;
      } else if (saleVariant.amountOff !== undefined) {
        salesDiscount = saleVariant.amountOff;
        finalUnitPrice = Math.max(0, priceAfterTier - saleVariant.amountOff);
      }
    }
  }

  // Step 5: Calculate total
  const totalPrice = finalUnitPrice * quantity;

  return {
    basePrice,
    attributePrice,
    subtotal,
    tierDiscount,
    priceAfterTier,
    salesDiscount,
    finalUnitPrice,
    totalPrice,
    appliedTier,
    appliedSale,
  };
}
 */

/**
 * Build variant ID from selected attributes
 * Format: "Color:Red|Size:Large" (alphabetically sorted)
 */
function buildVariantId(selectedAttributes: SelectedAttributes): string | null {
  const keys = Object.keys(selectedAttributes).sort();
  if (keys.length === 0) return null;

  return keys.map((key) => `${key}:${selectedAttributes[key]}`).join('|');
}

/**
 * Get current applicable pricing tier for a quantity
 */
export function getCurrentTier(
  pricingTiers: PricingTier[] | undefined,
  quantity: number
): PricingTier | null {
  if (!pricingTiers || pricingTiers.length === 0) return null;

  const applicableTiers = pricingTiers
    .filter((tier) => tier.minQuantity <= quantity)
    .sort((a, b) => b.minQuantity - a.minQuantity);

  return applicableTiers[0] || null;
}

/**
 * Calculate unit price for a tier
 */
export function calculateTierPrice(
  tier: PricingTier,
  basePrice: number,
  salesDiscount: number = 0
): number {
  let price = basePrice;

  // Apply tier discount
  if (tier.strategy === 'fixedPrice' && tier.fixedPrice !== undefined) {
    price = tier.fixedPrice;
  } else if (tier.strategy === 'percentOff' && tier.percentOff !== undefined) {
    price = basePrice * (1 - tier.percentOff / 100);
  } else if (tier.strategy === 'amountOff' && tier.amountOff !== undefined) {
    price = Math.max(0, basePrice - tier.amountOff);
  }

  // Apply sales discount on top
  if (salesDiscount > 0) {
    price = Math.max(0, price - salesDiscount);
  }

  return price;
}

/**
 * Check if all required attributes are selected

export function validateAttributeSelection(
  product: ProductDetail,
  selectedAttributes: SelectedAttributes
): { isValid: boolean; missingAttributes: string[] } {
  if (!product.attributes || product.attributes.length === 0) {
    return { isValid: true, missingAttributes: [] };
  }

  const missingAttributes: string[] = [];

  for (const attribute of product.attributes) {
    // Check if there are any in-stock children
    const hasInStockChildren = attribute.children.some((child) => !child.isOutOfStock);

    if (hasInStockChildren && !selectedAttributes[attribute.name]) {
      missingAttributes.push(attribute.name);
    }
  }

  return {
    isValid: missingAttributes.length === 0,
    missingAttributes,
  };
}
   */

/**
 * Auto-select first available (in-stock) variant for each attribute

export function autoSelectAttributes(product: ProductDetail): SelectedAttributes {
  const selected: SelectedAttributes = {};

  if (product.attributes) {
    for (const attribute of product.attributes) {
      // Find first in-stock child
      const firstInStock = attribute.children.find((child) => !child.isOutOfStock);

      if (firstInStock) {
        selected[attribute.name] = firstInStock.name;
      }
    }
  }

  return selected;
}
   */

/**
 * Check if product is completely out of stock

export function isProductOutOfStock(product: ProductDetail): boolean {
  // Check base stock
  if (!product.stock || product.stock <= 0) {
    // If has attributes, check if any variant is in stock
    if (product.attributes && product.attributes.length > 0) {
      return !product.attributes.some((attribute) =>
        attribute.children.some((child) => !child.isOutOfStock)
      );
    }
    return true;
  }
  return false;
}
 */

/**
 * Calculate "Sold It" progress for Limited sales
 * Sums maxBuys and boughtCount across all variants
 */
export function calculateSoldItProgress(
  sale: ProductDetail['sale']
): { percentage: number; sold: number; total: number } | null {
  if (!sale || sale.type !== 'Limited' || !sale.variants) {
    return null;
  }

  let totalMaxBuys = 0;
  let totalBought = 0;

  for (const variant of sale.variants) {
    if (variant.maxBuys !== undefined) {
      totalMaxBuys += variant.maxBuys;
    }
    if (variant.boughtCount !== undefined) {
      totalBought += variant.boughtCount;
    }
  }

  if (totalMaxBuys === 0) return null;

  const percentage = Math.floor((totalBought / totalMaxBuys) * 100);

  return {
    percentage,
    sold: totalBought,
    total: totalMaxBuys,
  };
}

/**
 * Get countdown time for Flash sales
 */
export function getFlashSaleCountdown(
  sale: ProductDetail['sale']
): { days: number; hours: number; minutes: number; seconds: number } | null {
  if (!sale || sale.type !== 'Flash' || !sale.endDate) {
    return null;
  }

  const now = new Date().getTime();
  const end = new Date(sale.endDate).getTime();
  const distance = end - now;

  if (distance < 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
  };
}
