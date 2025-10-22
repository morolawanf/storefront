// Order types matching backend schema

export interface OrderAddress {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderProductAttribute {
  name: string;
  value: string;
}

export interface OrderProduct {
  product: string; // Product ID
  qty: number;
  price: number;
  attributes: OrderProductAttribute[];
  sale?: string; // Sale ID
  saleType?: 'Flash' | 'Limited' | 'Normal';
  saleVariantIndex?: number;
  saleDiscount?: number;
}

export interface CouponAppliesTo {
  scope: 'order' | 'product' | 'category';
  productIds?: string[];
  categoryIds?: string[];
}

export interface CouponSnapshot {
  discount: number;
  discountType: 'percentage' | 'fixed';
  appliesTo: CouponAppliesTo;
}

export interface PaymentResult {
  id: string;
  status: string;
  email: string;
}

export interface FlashSaleApplied {
  flashSale: string; // Sale ID
  product: string; // Product ID
  attributeName?: string | null;
  attributeValue?: string | null;
  discount: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Cancelled' | 'Completed';
export type DeliveryType = 'shipping' | 'pickup';

export interface OrderType {
  _id: string;
  user: string; // User ID
  products: OrderProduct[];
  shippingAddress: OrderAddress;
  paymentMethod: string;
  paymentResult?: PaymentResult;
  total: number;
  totalBeforeDiscount?: number;
  couponApplied?: string;
  coupon?: string; // Coupon ID
  couponCode?: string;
  couponDiscount: number;
  couponSnapshot?: CouponSnapshot;
  deliveryType: DeliveryType;
  shippingPrice: number;
  taxPrice: number;
  transactionId?: string | null; // Transaction ID
  isPaid: boolean;
  status: OrderStatus;
  shipmentId?: string | null; // Shipment ID
  paidAt?: string | Date;
  deliveredAt?: string | Date;
  flashSaleApplied?: FlashSaleApplied[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Query params for fetching orders
export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'processing' | 'cancelled' | 'completed' | 'all';
  deliveryStatus?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'failed';
  transactionStatus?: 'all' | 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
}

// Response type with pagination meta
export interface OrdersResponseMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrdersResponse {
  orders: OrderType[];
  totalOrders: number;
  meta: OrdersResponseMeta;
}
