/**
 * Checkout Error Handling Types
 *
 * Structured error format returned by /checkout/secure endpoint when cart discrepancies are detected.
 */

export type ProductIssueType =
  | 'outOfStock'
  | 'quantityReduced'
  | 'priceChanged'
  | 'attributeUnavailable'
  | 'saleExpired';

export type IssueSeverity = 'critical' | 'warning' | 'info';

export type SuggestedAction = 'remove' | 'reduceQuantity' | 'changeAttribute' | 'acceptPrice';

export interface ProductIssue {
  productId: string;
  productName: string;
  productSlug: string;
  cartItemId: string;
  issueType: ProductIssueType;
  message: string;
  severity: IssueSeverity;
  currentQty: number;
  availableStock: number;
  currentPrice: number | null;
  correctedPrice: number | null;
  unavailableAttributes: Array<{ name: string; value: string }> | null;
  availableAttributes: Array<Array<{ name: string; value: string }>> | null;
  suggestedAction: SuggestedAction;
  saleInfo?: {
    previousSaleId: string;
    previousDiscount: number;
    expiryReason: 'endDateReached' | 'maxBuysReached' | 'deactivated';
  };
}

export interface CouponIssue {
  code: string;
  reason: string;
  previousDiscount: number;
  expiryDate?: string;
}

export interface ShippingIssue {
  previousCost: number;
  currentCost: number;
  reason: string;
  destination?: {
    state: string;
    city?: string;
  };
}

export interface TotalIssue {
  expectedTotal: number;
  calculatedTotal: number;
  discrepancy: number;
  message: string;
}

export interface CheckoutErrors {
  products?: ProductIssue[];
  coupons?: CouponIssue[];
  shipping?: ShippingIssue;
  total?: TotalIssue;
}

/**
 * Cart update payload for batch corrections
 */
export interface CartUpdateOperation {
  cartItemId: string;
  action: 'update' | 'remove';
  updates?: {
    qty?: number;
    selectedAttributes?: Array<{ name: string; value: string }>;
  };
}

export interface CorrectionPayload {
  operations: CartUpdateOperation[];
  affectedProductSlugs: string[];
  removedCouponCodes: string[];
  updatedShippingCost: number | null;
}

/**
 * Enhanced checkout correction response from backend
 */
export interface CheckoutCorrectionResponse {
  needsUpdate: true;
  shippingCost: number;
  deliveryType: 'shipping' | 'pickup';
  correctedCart: {
    items: any[];
    subtotal: number;
    total: number;
    totalDiscount: number;
    couponDiscount: number;
    estimatedShipping: { cost: number; days: number };
  };
  changes: string[];
  changeDetails: any[];
  checkoutErrors: CheckoutErrors;
}
