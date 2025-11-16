import {
  CheckoutErrors,
  ProductIssue,
  CartUpdateOperation,
  CorrectionPayload,
} from '@/types/checkout';

/**
 * Parse backend checkout errors from response
 */
export function parseCheckoutErrors(responseData: any): CheckoutErrors | null {
  if (!responseData?.checkoutErrors) {
    return null;
  }

  return responseData.checkoutErrors as CheckoutErrors;
}

/**
 * Select first available attribute combination from available options
 * Returns null if no attributes available
 */
export function selectFirstAvailableAttribute(
  availableAttributes: Array<Array<{ name: string; value: string }>> | null
): Array<{ name: string; value: string }> | null {
  if (!availableAttributes || availableAttributes.length === 0) {
    return null;
  }

  // Return the first combination
  return availableAttributes[0];
}

/**
 * Build cart update operations from product issues
 * Handles: quantity reduction, attribute changes, removal of out-of-stock items
 */
export function buildCartUpdatePayload(productIssues: ProductIssue[]): CorrectionPayload {
  const operations: CartUpdateOperation[] = [];
  const affectedProductSlugs: string[] = [];

  for (const issue of productIssues) {
    affectedProductSlugs.push(issue.productSlug);

    switch (issue.suggestedAction) {
      case 'remove':
        // Out of stock - remove item completely
        operations.push({
          cartItemId: issue.cartItemId,
          action: 'remove',
        });
        break;

      case 'reduceQuantity':
        // Quantity exceeds available stock - reduce to available
        operations.push({
          cartItemId: issue.cartItemId,
          action: 'update',
          updates: {
            qty: issue.availableStock,
          },
        });
        break;

      case 'changeAttribute':
        // Attribute unavailable - select first available
        const firstAvailable = selectFirstAvailableAttribute(issue.availableAttributes);
        if (firstAvailable) {
          operations.push({
            cartItemId: issue.cartItemId,
            action: 'update',
            updates: {
              selectedAttributes: firstAvailable,
            },
          });
        } else {
          // No available attributes - remove item
          operations.push({
            cartItemId: issue.cartItemId,
            action: 'remove',
          });
        }
        break;

      case 'acceptPrice':
        // Price changed - no action needed, backend already updated
        // Just track for product refresh
        break;
    }
  }

  return {
    operations,
    affectedProductSlugs: Array.from(new Set(affectedProductSlugs)), // Remove duplicates
    removedCouponCodes: [],
    updatedShippingCost: null,
  };
}

/**
 * Format user-friendly issue messages for display
 */
export function formatIssueMessage(issue: ProductIssue): string {
  switch (issue.issueType) {
    case 'outOfStock':
      return 'This product is currently out of stock';

    case 'quantityReduced':
      return `Only ${issue.availableStock} unit${
        issue.availableStock !== 1 ? 's' : ''
      } available (you requested ${issue.currentQty})`;

    case 'priceChanged':
      const oldPrice = issue.currentPrice?.toLocaleString() || '0';
      const newPrice = issue.correctedPrice?.toLocaleString() || '0';
      const priceIncreased = (issue.correctedPrice || 0) > (issue.currentPrice || 0);
      return `Price ${priceIncreased ? 'increased' : 'decreased'}: ₦${oldPrice} → ₦${newPrice}`;

    case 'attributeUnavailable':
      const unavailableAttrs = issue.unavailableAttributes
        ?.map((attr) => `${attr.name}: ${attr.value}`)
        .join(', ');
      return `Selected variant (${unavailableAttrs}) is no longer available`;

    case 'saleExpired':
      const saleReason = issue.saleInfo?.expiryReason || 'expired';
      const reasonText =
        saleReason === 'endDateReached'
          ? 'ended'
          : saleReason === 'maxBuysReached'
            ? 'sold out'
            : 'ended';
      const oldSalePrice = issue.currentPrice?.toLocaleString() || '0';
      const regularPrice = issue.correctedPrice?.toLocaleString() || '0';
      return `Sale ${reasonText} - price increased from ₦${oldSalePrice} to ₦${regularPrice}`;

    default:
      return issue.message || 'Item requires attention';
  }
}

/**
 * Get badge color based on issue severity
 */
export function getIssueBadgeColor(severity: ProductIssue['severity']): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'info':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get action button text based on suggested action
 */
export function getActionButtonText(action: ProductIssue['suggestedAction']): string {
  switch (action) {
    case 'remove':
      return 'Remove Item';
    case 'reduceQuantity':
      return 'Reduce Quantity';
    case 'changeAttribute':
      return 'Change Variant';
    case 'acceptPrice':
      return 'Accept New Price';
    default:
      return 'Update';
  }
}

/**
 * Check if checkout errors contain only shipping/coupon issues (no product issues)
 */
export function hasOnlyNonProductIssues(errors: CheckoutErrors): boolean {
  return !errors.products || errors.products.length === 0;
}

/**
 * Check if checkout has any product issues
 */
export function hasProductIssues(errors: CheckoutErrors): boolean {
  return !!(errors.products && errors.products.length > 0);
}

/**
 * Group product issues by severity for rendering
 */
export function groupIssuesBySeverity(issues: ProductIssue[]): {
  critical: ProductIssue[];
  warning: ProductIssue[];
  info: ProductIssue[];
} {
  return {
    critical: issues.filter((i) => i.severity === 'critical'),
    warning: issues.filter((i) => i.severity === 'warning'),
    info: issues.filter((i) => i.severity === 'info'),
  };
}
