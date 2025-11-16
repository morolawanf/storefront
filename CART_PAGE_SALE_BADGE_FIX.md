# Cart Page Sale Badge Fix & PricingTierUpgrade Optimization

## Problem Summary

1. **Cart page sale badge bug**: The cart page was showing "SALE X% OFF" badges for pricing tier discounts (bulk deals), not just actual sales. This was the same bug ModalCart had before it was fixed.

2. **PricingTierUpgrade rerendering issue**: The `PricingTierUpgrade` component was causing excessive rerenders due to:
   - Calling `calculateCartItemPricing()` on every render without memoization
   - Not memoizing the `nextTierInfo` calculation
   - Having a `console.log` that shouldn't be there
   - Not using `React.memo` to prevent unnecessary rerenders

## Root Cause

The issue stemmed from how discounts were tracked in `cart-pricing.ts`:

- `appliedDiscount` was cumulative (sale discount + tier discount)
- Components were checking `pricing.appliedDiscount > 0` to show sale badges
- This caused pricing tier discounts to be treated as sales

**Example Scenario**:

- Product with 10% sale + 5% tier discount
- `appliedDiscount` = 15% (cumulative)
- Cart page showed "SALE 15% OFF" (WRONG!)
- Should show "SALE 10% OFF" + "Bulk Deals" badge separately

## Solution Implemented

### 1. Enhanced `cart-pricing.ts`

**File**: `/src/utils/cart-pricing.ts`

Added separate tracking for sale and tier discounts:

```typescript
export interface CartItemPricing {
  basePrice: number;
  unitPrice: number;
  totalPrice: number;
  appliedDiscount: number; // Cumulative sale + tier
  saleDiscount: number; // ✅ NEW: Sale discount only (0-100)
  tierDiscount: number; // ✅ NEW: Tier discount only (0-100)
  discountAmount: number;
  sale: ProductSale | null;
  pricingTier: { ... } | null;
}
```

**Key Changes**:

- Track `saleDiscount` separately when sale is applied (lines 48-51, 110-115)
- Track `tierDiscount` separately when pricing tier is applied (line 151)
- Keep `appliedDiscount` as cumulative for total price calculations
- Return all three discount values

### 2. Fixed Cart Page Sale Badge Logic

**File**: `/src/app/cart/page.tsx`

**Before** (Line 240):

```typescript
const hasDiscount = pricing.appliedDiscount > 0; // ❌ WRONG - includes tier
```

**After** (Lines 240-242):

```typescript
const hasSale = !!pricing.sale;
const hasDiscount = hasSale || hasPricingTier; // ✅ For price slash only
```

**Sale Badge Display** (Lines 290-295):

```typescript
{hasSale && (
  <span className="text-xs bg-red text-white px-2.5 py-1 rounded font-bold uppercase tracking-wide">
    SALE {Math.round(pricing.saleDiscount)}% OFF // ✅ Shows sale discount only
  </span>
)}
```

### 3. Updated ModalCart

**File**: `/src/components/Modal/ModalCart.tsx`

**Before** (Line 62):

```typescript
const salePercentage = hasSale ? Math.round(pricing.appliedDiscount) : 0; // ❌ Cumulative
```

**After** (Line 62):

```typescript
const salePercentage = hasSale ? Math.round(pricing.saleDiscount) : 0; // ✅ Sale only
```

### 4. Optimized PricingTierUpgrade Component

**File**: `/src/components/Cart/PricingTierUpgrade.tsx`

**Changes Made**:

1. **Wrapped with `React.memo`** to prevent unnecessary rerenders when props haven't changed
2. **Memoized pricing calculation** with `useMemo`:
   ```typescript
   const pricing = useMemo(() => {
     return calculateCartItemPricing({ ...item, qty: currentQty });
   }, [item, currentQty]);
   ```
3. **Memoized next tier calculation** with `useMemo`:
   ```typescript
   const nextTierInfo = useMemo(() => {
     return calculateNextTierSavings(...);
   }, [currentQty, pricing.unitPrice, basePrice, pricingTiers]);
   ```
4. **Removed `console.log`** (line 54)
5. **Added `displayName`** for better debugging

**Performance Impact**:

- Component only recalculates when `item` or `currentQty` changes
- Prevents cascade rerenders from parent components
- Next tier calculation only runs when dependencies change

## Testing Checklist

- [x] TypeScript compilation passes (no errors)
- [ ] Sale badges only show for actual sales, not pricing tiers
- [ ] Pricing tier "Bulk Deals" badge shows for tier discounts
- [ ] Sale discount percentage is correct (sale only, not cumulative)
- [ ] Price slash shows for both sale AND pricing tier
- [ ] PricingTierUpgrade doesn't rerender excessively
- [ ] Cart page displays correctly with:
  - Sale only
  - Pricing tier only
  - Both sale and pricing tier
  - Neither sale nor pricing tier

## Example Scenarios

### Scenario 1: Sale Only (10% off)

- Sale badge: "SALE 10% OFF" ✅
- Bulk badge: (none)
- Price: ~~$100~~ → $90

### Scenario 2: Pricing Tier Only (5% bulk discount)

- Sale badge: (none)
- Bulk badge: "Bulk Deals" ✅
- Price: ~~$100~~ → $95

### Scenario 3: Both Sale (10%) + Tier (5%)

- Sale badge: "SALE 10% OFF" ✅ (NOT 15%!)
- Bulk badge: "Bulk Deals" ✅
- Price: ~~$100~~ → $85.50 (15% total)

### Scenario 4: No Discounts

- Sale badge: (none)
- Bulk badge: (none)
- Price: $100 (no slash)

## Files Modified

1. `/src/utils/cart-pricing.ts` - Added `saleDiscount` and `tierDiscount` tracking
2. `/src/app/cart/page.tsx` - Fixed sale badge logic and display
3. `/src/components/Modal/ModalCart.tsx` - Updated to use `saleDiscount`
4. `/src/components/Cart/PricingTierUpgrade.tsx` - Optimized with React.memo and useMemo

## Implementation Notes

- **Backwards Compatible**: The `appliedDiscount` field remains unchanged and cumulative
- **Type Safe**: All changes maintain TypeScript strictness (no `any` types)
- **DRY Principle**: Sale badge logic is now consistent across cart page and modal
- **Performance**: PricingTierUpgrade optimizations reduce unnecessary recalculations

## Related Issues

- Original ModalCart fix: Fixed sale badge showing for tier discounts
- Cart page had same issue as ModalCart before the fix
- PricingTierUpgrade causing performance problems from excessive rerenders

## Next Steps

1. Test all scenarios with actual products having:
   - Sales only
   - Pricing tiers only
   - Both sales and pricing tiers
   - Limited sales with maxBuys restrictions
2. Verify PricingTierUpgrade performance improvements in browser devtools
3. Consider adding similar optimizations to other cart-related components if needed
