'use client';

import { useMemo } from 'react';
import { Product, ProductVariant, ProductVariantChild, ProductPricingTier } from '@/types/product';

/**
 * Utility types matching backend pricing logic
 */
interface PricingTier {
  minQty: number;
  maxQty?: number;
  strategy: 'fixedPrice' | 'percentOff' | 'amountOff';
  value: number;
}

interface VariantOption {
  name: string;
  price?: number;
  stock: number;
  pricingTiers?: PricingTier[];
}

interface AttributeGroup {
  name: string;
  children: VariantOption[];
}

interface ProductPricingShape {
  price: number;
  pricingTiers?: PricingTier[];
  attributes?: AttributeGroup[];
  stock: number;
}

/**
 * Resolve the most specific variant option across multiple attributes.
 * Matches backend logic in old-main-server/src/helpers/pricingUtils.ts
 *
 * Rule: Iterate attribute groups in product order; if a selected option in that group exists and
 * it carries any pricing signal (price | pricingTiers), prefer the first such match.
 */
function resolveBestVariant(
  product: ProductPricingShape,
  attributes: { name: string; value: string }[]
): VariantOption | undefined {
  if (!product?.attributes || product.attributes.length === 0 || !attributes?.length) {
    return undefined;
  }

  // Build quick lookup of requested attributes by name
  const picked = new Map<string, string>();
  for (const attr of attributes) {
    picked.set(attr.name, attr.value);
  }

  for (const group of product.attributes) {
    const requested = picked.get(group.name);
    if (!requested) continue;

    const option = group.children.find((c) => c.name === requested);
    if (!option) continue;

    // If this option has pricing information, return it
    if (
      typeof option.price === 'number' ||
      (Array.isArray(option.pricingTiers) && option.pricingTiers.length > 0)
    ) {
      return option;
    }
  }

  return undefined;
}

/**
 * Apply pricing tier logic to calculate the actual price based on quantity
 * Matches backend logic in old-main-server/src/helpers/pricingUtils.ts
 */
function applyPricingTier(base: number, qty: number, tiers?: PricingTier[]): number {
  if (!tiers || tiers.length === 0) return base;

  // Find all matching tiers and pick the most specific (highest minQty)
  const applicable = tiers.filter((t) => qty >= t.minQty && (t.maxQty == null || qty <= t.maxQty));

  if (applicable.length === 0) return base;

  const tier = applicable.sort((a, b) => b.minQty - a.minQty)[0]!;

  switch (tier.strategy) {
    case 'fixedPrice':
      return tier.value;
    case 'percentOff':
      return Math.max(0, base - (base * tier.value) / 100);
    case 'amountOff':
      return Math.max(0, base - tier.value);
    default:
      return base;
  }
}

/**
 * Convert Product type to ProductPricingShape for variant resolution
 */
function productToPricingShape(product: Product): ProductPricingShape {
  return {
    price: product.price,
    pricingTiers: product.pricingTiers as PricingTier[] | undefined,
    attributes: product.attributes?.map((attr) => ({
      name: attr.name,
      children: attr.children.map((child) => ({
        name: child.name,
        price: child.price,
        stock: child.stock,
        pricingTiers: child.pricingTiers as PricingTier[] | undefined,
      })),
    })),
    stock: product.stock || 0,
  };
}

export interface VariantSelectionResult {
  /**
   * Selected attributes as array of { name, value } pairs
   */
  attributes: Array<{ name: string; value: string }>;

  /**
   * Resolved unit price after variant and pricing tier application
   */
  unitPrice: number;

  /**
   * Base price before any tier adjustments (variant price or product price)
   */
  basePrice: number;

  /**
   * Matched variant option (if any)
   */
  variant: VariantOption | undefined;

  /**
   * Available stock for the selected variant
   */
  availableStock: number;

  /**
   * Whether pricing tiers were applied
   */
  hasPricingTiers: boolean;

  /**
   * Pricing tier details (if applied)
   */
  appliedTier?: {
    minQty: number;
    maxQty?: number;
    strategy: string;
    value: number;
    appliedPrice: number;
  };
}

/**
 * Hook for managing variant selection and price calculation
 *
 * @param product - The product with variant/attribute data
 * @param selectedAttributes - Currently selected attributes from UI state
 * @param quantity - Current quantity selection (default: 1)
 *
 * @returns VariantSelectionResult with computed pricing and variant info
 *
 * @example
 * ```tsx
 * const { unitPrice, variant, availableStock } = useVariantSelection(
 *   product,
 *   [{ name: 'Color', value: 'Red' }, { name: 'Size', value: 'Large' }],
 *   5 // quantity
 * );
 * ```
 */
export function useVariantSelection(
  product: Product | null | undefined,
  selectedAttributes: Array<{ name: string; value: string }>,
  quantity: number = 1
): VariantSelectionResult {
  return useMemo(() => {
    const result: VariantSelectionResult = {
      attributes: selectedAttributes,
      unitPrice: product?.price || 0,
      basePrice: product?.price || 0,
      variant: undefined,
      availableStock: product?.stock || 0,
      hasPricingTiers: false,
    };

    if (!product) return result;

    const pricingShape = productToPricingShape(product);

    // Resolve variant based on selected attributes
    const variant = resolveBestVariant(pricingShape, selectedAttributes);
    result.variant = variant;

    // Determine base price (variant price takes precedence over product price)
    const variantPrice = typeof variant?.price === 'number' ? variant.price : undefined;
    let unitPrice = typeof variantPrice === 'number' ? variantPrice : product.price;
    result.basePrice = unitPrice;

    // Update available stock if variant exists
    if (variant) {
      result.availableStock = variant.stock;
    }

    // Apply pricing tiers (variant tiers first, then product tiers)
    const beforeVariantTier = unitPrice;
    unitPrice = applyPricingTier(unitPrice, quantity, variant?.pricingTiers);
    const variantTierApplied = unitPrice !== beforeVariantTier;

    const beforeProductTier = unitPrice;
    unitPrice = applyPricingTier(unitPrice, quantity, pricingShape.pricingTiers);
    const productTierApplied = unitPrice !== beforeProductTier;

    result.hasPricingTiers = variantTierApplied || productTierApplied;
    result.unitPrice = unitPrice;

    // Find which tier was actually applied for details
    if (result.hasPricingTiers) {
      const tiers = variant?.pricingTiers || pricingShape.pricingTiers || [];
      const applicable = tiers.filter(
        (t) => quantity >= t.minQty && (t.maxQty == null || quantity <= t.maxQty)
      );

      if (applicable.length > 0) {
        const bestTier = applicable.sort((a, b) => b.minQty - a.minQty)[0]!;
        result.appliedTier = {
          minQty: bestTier.minQty,
          maxQty: bestTier.maxQty,
          strategy: bestTier.strategy,
          value: bestTier.value,
          appliedPrice: unitPrice,
        };
      }
    }

    return result;
  }, [product, selectedAttributes, quantity]);
}

/**
 * Validation helper: Check if required attributes are selected
 *
 * @param product - The product
 * @param selectedAttributes - Currently selected attributes
 * @returns Array of missing required attribute names (empty if all required attributes are selected)
 *
 * @example
 * ```tsx
 * const missingAttrs = validateRequiredAttributes(product, selectedAttributes);
 * if (missingAttrs.length > 0) {
 *   alert(`Please select: ${missingAttrs.join(', ')}`);
 * }
 * ```
 */
export function validateRequiredAttributes(
  product: Product | null | undefined,
  selectedAttributes: Array<{ name: string; value: string }>
): string[] {
  if (!product?.attributes || product.attributes.length === 0) {
    return [];
  }

  const selectedNames = new Set(selectedAttributes.map((attr) => attr.name));
  const missing: string[] = [];

  // All attributes are considered required if they have variants
  for (const attr of product.attributes) {
    if (attr.children && attr.children.length > 0 && !selectedNames.has(attr.name)) {
      missing.push(attr.name);
    }
  }

  return missing;
}
