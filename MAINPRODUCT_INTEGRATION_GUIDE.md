# MainProduct Component Enhancement Guide

## Overview

This guide shows how to integrate the new API-based product detail system into `MainProduct.tsx`. The component is already functional with dummy data - we'll enhance it to use real API data and add advanced features.

## Step 1: Replace Dummy Data with API Hook

### Current (Lines 1-30):

```tsx
import { ProductType } from '@/type/ProductType';

interface Props {
  data: Array<ProductType>;
  productId: string | number | null;
}

const Sale: React.FC<Props> = ({ data, productId }) => {
  let productMain = data.find((product) => product.id === productId) as ProductType;
  // ...
};
```

### New (Replace with):

```tsx
import { useProduct, ProductDetail } from '@/hooks/queries/useProduct';
import { calculateTotalPrice, autoSelectAttributes, isProductOutOfStock, calculateSoldItProgress, getFlashSaleCountdown } from '@/utils/productPricing';

interface Props {
    slug: string; // Change from productId to slug
}

const Sale: React.FC<Props> = ({ slug }) => {
    // Fetch product from API
    const { data: product, isLoading, error } = useProduct({ slug });

    // Initialize selected attributes with first available variants
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

    useEffect(() => {
        if (product && Object.keys(selectedAttributes).length === 0) {
            setSelectedAttributes(autoSelectAttributes(product));
        }
    }, [product]);

    // Handle loading and error states
    if (isLoading) {
        return <div className="container py-20"><LoadingSpinner /></div>;
    }

    if (error || !product) {
        return <div className="container py-20">Product not found</div>;
    }

    // Check out-of-stock status
    const isOutOfStock = isProductOutOfStock(product);
```

## Step 2: Add Total Price Calculation

### After quantity state (around line 40):

```tsx
const [quantity, setQuantity] = useState<number>(1);

// Calculate total price with all factors
const pricing = calculateTotalPrice(product, selectedAttributes, quantity);

// For display
const {
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
} = pricing;
```

## Step 3: Update Attribute Selection Handlers

### Replace existing color/size handlers:

```tsx
// Old handlers (remove these)
const handleActiveColor = (item: string) => {
  setActiveColor(item);
};

const handleActiveSize = (item: string) => {
  setActiveSize(item);
};

// New unified handler
const handleAttributeSelect = (attributeName: string, childName: string) => {
  setSelectedAttributes((prev) => ({
    ...prev,
    [attributeName]: childName,
  }));
};

// Check if child is selected
const isAttributeSelected = (attributeName: string, childName: string): boolean => {
  return selectedAttributes[attributeName] === childName;
};
```

## Step 4: Update Quantity Handlers

### Replace quantity handlers to work with pricing calculation:

```tsx
const handleQuantityChange = (value: string) => {
  const numValue = parseInt(value) || 0;
  const validQty = numValue <= 0 ? 1 : numValue;
  setQuantity(validQty);
};

const handleTierClick = (minQty: number) => {
  setQuantity(minQty);
};
```

## Step 5: Render Dynamic Attributes (Replace Color/Size Sections)

### Replace hardcoded color/size sections (around lines 320-400) with:

```tsx
{
  /* Dynamic Attributes Rendering */
}
{
  product.attributes &&
    product.attributes.map((attribute) => {
      const selectedChild = selectedAttributes[attribute.name];
      const hasInStockOptions = attribute.children.some((child) => !child.isOutOfStock);

      return (
        <div key={attribute._id} className="choose-attribute mt-5">
          <div className="text-title">
            {attribute.name}:
            {selectedChild && (
              <span className="text-title ml-2 font-semibold">{selectedChild}</span>
            )}
            {!hasInStockOptions && <span className="ml-2 text-sm text-red-600">Out of stock</span>}
          </div>

          <div className="list-options mt-3 flex flex-wrap items-center gap-2">
            {attribute.children.map((child) => {
              const isSelected = isAttributeSelected(attribute.name, child.name);
              const isOutOfStock = child.isOutOfStock;

              return (
                <button
                  key={child._id}
                  onClick={() => !isOutOfStock && handleAttributeSelect(attribute.name, child.name)}
                  disabled={isOutOfStock}
                  className={`rounded-lg border px-4 py-2 transition-all ${isSelected ? 'border-black bg-black text-white' : 'border-line'} ${isOutOfStock ? 'cursor-not-allowed line-through opacity-50' : 'cursor-pointer hover:border-black'} `}
                >
                  {child.name}
                  {child.price > 0 && (
                    <span className="ml-2 text-sm">+${child.price.toFixed(2)}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    });
}
```

## Step 6: Add Total Price Display Section

### Add after pricing tiers section:

```tsx
{
  /* Total Price Breakdown */
}
<div className="price-breakdown bg-surface mt-6 rounded-lg p-4">
  <div className="mb-2 flex items-center justify-between">
    <span className="text-secondary">Base Price:</span>
    <span>${basePrice.toFixed(2)}</span>
  </div>

  {attributePrice > 0 && (
    <div className="mb-2 flex items-center justify-between">
      <span className="text-secondary">Options:</span>
      <span>+${attributePrice.toFixed(2)}</span>
    </div>
  )}

  {tierDiscount > 0 && appliedTier && (
    <div className="mb-2 flex items-center justify-between text-green-600">
      <span>Tier Discount ({appliedTier.minQuantity}+ items):</span>
      <span>-${tierDiscount.toFixed(2)}</span>
    </div>
  )}

  {salesDiscount > 0 && (
    <div className="mb-2 flex items-center justify-between text-red-600">
      <span>Sale Discount:</span>
      <span>-${salesDiscount.toFixed(2)}</span>
    </div>
  )}

  <div className="border-line mt-2 border-t pt-2">
    <div className="flex items-center justify-between">
      <span className="text-secondary">Unit Price:</span>
      <span className="font-semibold">${finalUnitPrice.toFixed(2)}</span>
    </div>
    <div className="mt-2 flex items-center justify-between">
      <span className="text-secondary">Quantity:</span>
      <span>× {quantity}</span>
    </div>
  </div>

  <div className="border-line mt-3 border-t pt-3">
    <div className="flex items-center justify-between">
      <span className="heading5">Total Price:</span>
      <span className="heading4 text-red-600">${totalPrice.toFixed(2)}</span>
    </div>
  </div>
</div>;
```

## Step 7: Add Merged Specifications Display

### Replace existing description/specifications section with:

```tsx
{
  /* Merged Specifications */
}
{
  product.mergedSpecifications && product.mergedSpecifications.length > 0 && (
    <div className="specifications mt-6">
      <h4 className="heading5 mb-4">Specifications</h4>
      <div className="grid grid-cols-2 gap-4">
        {product.mergedSpecifications.map((spec, index) => (
          <div key={index} className="spec-item">
            <div className="text-secondary text-sm">{spec.key}</div>
            <div className="font-semibold">{spec.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Step 8: Update Sold It Progress for Limited Sales

### Replace existing sold progress section:

```tsx
{
  /* Sold It Progress for Limited Sales */
}
{
  product.sale?.type === 'Limited' &&
    (() => {
      const progress = calculateSoldItProgress(product.sale);
      if (!progress) return null;

      return (
        <div className="sold-progress mt-6 flex flex-wrap gap-4 md:gap-20">
          <div className="text-title">Sold It:</div>
          <div className="right w-3/4">
            <div className="progress bg-line relative h-2 overflow-hidden rounded-full">
              <div
                className="percent-sold bg-red absolute top-0 left-0 h-full"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <span>{progress.percentage}% Sold -</span>
              <span className="text-secondary">
                Only {progress.total - progress.sold} item(s) left!
              </span>
            </div>
          </div>
        </div>
      );
    })();
}
```

## Step 9: Update Flash Sale Countdown

### Replace existing countdown section:

```tsx
{
  /* Flash Sale Countdown */
}
{
  product.sale?.type === 'Flash' &&
    (() => {
      const [countdown, setCountdown] = useState(getFlashSaleCountdown(product.sale));

      useEffect(() => {
        const timer = setInterval(() => {
          setCountdown(getFlashSaleCountdown(product.sale!));
        }, 1000);
        return () => clearInterval(timer);
      }, [product.sale]);

      if (!countdown) return null;

      return (
        <div className="countdown-block mt-6 flex flex-wrap items-center gap-4 md:gap-8">
          <div className="text-title">
            Hurry Up!
            <br />
            Offer ends in:
          </div>
          <div className="countdown-time flex items-center gap-3 lg:gap-5">
            <div className="item border-red flex h-[60px] w-[60px] flex-col items-center justify-center rounded-lg border">
              <div className="days heading6">
                {countdown.days < 10 ? `0${countdown.days}` : countdown.days}
              </div>
              <div className="caption1">Days</div>
            </div>
            <div className="heading5">:</div>
            <div className="item border-red flex h-[60px] w-[60px] flex-col items-center justify-center rounded-lg border">
              <div className="hours heading6">
                {countdown.hours < 10 ? `0${countdown.hours}` : countdown.hours}
              </div>
              <div className="caption1">Hours</div>
            </div>
            <div className="heading5">:</div>
            <div className="item border-red flex h-[60px] w-[60px] flex-col items-center justify-center rounded-lg border">
              <div className="mins heading6">
                {countdown.minutes < 10 ? `0${countdown.minutes}` : countdown.minutes}
              </div>
              <div className="caption1">Mins</div>
            </div>
            <div className="heading5">:</div>
            <div className="item border-red flex h-[60px] w-[60px] flex-col items-center justify-center rounded-lg border">
              <div className="secs heading6">
                {countdown.seconds < 10 ? `0${countdown.seconds}` : countdown.seconds}
              </div>
              <div className="caption1">Secs</div>
            </div>
          </div>
        </div>
      );
    })();
}
```

## Step 10: Add Out-of-Stock Styling

### Update Add to Cart button:

```tsx
<button
  onClick={handleAddToCart}
  disabled={isOutOfStock}
  className={`button-main mt-4 w-full ${
    isOutOfStock
      ? 'cursor-not-allowed bg-gray-300 text-gray-600 opacity-50'
      : 'bg-black text-white hover:bg-gray-800'
  } `}
>
  {isOutOfStock ? 'Out Of Stock' : 'Add To Cart'}
</button>
```

### Update quantity controls:

```tsx
<div className={`quantity-block ${isOutOfStock ? 'opacity-50' : ''}`}>
  <button onClick={handleDecreaseQuantity} disabled={isOutOfStock || quantity <= 1} className="...">
    -
  </button>
  <input
    type="number"
    value={quantity}
    onChange={(e) => handleQuantityChange(e.target.value)}
    disabled={isOutOfStock}
    className={`${isOutOfStock ? 'cursor-not-allowed' : ''}`}
  />
  <button onClick={handleIncreaseQuantity} disabled={isOutOfStock} className="...">
    +
  </button>
</div>
```

## Step 11: Update Page Component to Pass Slug

### In the parent page component (e.g., `app/product/[slug]/page.tsx`):

```tsx
export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;

  return (
    <Default>
      <Sale slug={slug} />
      <RelatedProducts productId={productId} />
      <ReviewsList productId={productId} />
    </Default>
  );
}
```

## Complete Feature Checklist

After implementing all changes, you'll have:

- [x] API-based product fetching with `useProduct` hook
- [x] Total price calculation with all factors (attributes, tiers, sales)
- [x] Dynamic attribute rendering with stock validation
- [x] Auto-selection of first available variants
- [x] Out-of-stock styling and disabled states
- [x] Price breakdown display
- [x] Merged specifications (dimensions + specs)
- [x] Limited sales "Sold It" progress bar
- [x] Flash sales countdown timer
- [x] Responsive pricing tiers sync
- [x] Type-safe TypeScript interfaces

## Testing Checklist

1. **Basic Display**: Product loads correctly from slug
2. **Attributes**: Can select attributes, prices update
3. **Out of Stock**: Out-of-stock variants are disabled and styled
4. **Pricing Tiers**: Clicking tiers updates quantity and price
5. **Sales**: Discounts apply correctly (Flash/Limited/Normal)
6. **Quantity**: Can change quantity, total updates
7. **Add to Cart**: Validation prevents adding without required attributes
8. **Specifications**: Merged specs display correctly
9. **Progress Bar**: Limited sales show correct progress
10. **Countdown**: Flash sales show live countdown

## Notes

- The component maintains backward compatibility with existing cart/wishlist/compare contexts
- All pricing calculations are centralized in utility functions for consistency
- TypeScript provides full type safety across all operations
- Out-of-stock handling follows the patterns from `OutOfStock.tsx`
- The sticky image container CSS is already correct (`md:sticky md:top-6`)
