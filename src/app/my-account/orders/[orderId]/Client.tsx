'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useOrderById } from '@/hooks/queries/useOrderById';
import { OrderType } from '@/types/order';
import * as Icon from '@phosphor-icons/react/dist/ssr';
import TopNavOne from '@/components/Header/TopNav/TopNavOne';
import MenuOne from '@/components/Header/Menu/MenuOne';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer';

interface OrderDetailsClientProps {
  orderId: string;
}

// Status badge styling helper
const getStatusBadge = (status: OrderType['status']) => {
  const statusConfig = {
    Pending: 'bg-yellow text-yellow',
    Processing: 'bg-purple text-purple',
    Completed: 'bg-success text-success',
    Cancelled: 'bg-red text-red',
  };

  return statusConfig[status] || 'bg-secondary text-secondary';
};

// Format date helper
const formatDate = (date: string | Date | undefined) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format currency helper
const formatCurrency = (amount: number) => {
  return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Status Timeline Component
const OrderStatusTimeline = ({ order }: { order: OrderType }) => {
  const statuses = [
    { 
      key: 'Pending', 
      label: 'Order Placed', 
      icon: <Icon.ShoppingBag weight="fill" />,
      date: order.createdAt 
    },
    { 
      key: 'Processing', 
      label: 'Processing', 
      icon: <Icon.Package weight="fill" />,
      date: order.status === 'Processing' || order.status === 'Completed' ? order.updatedAt : undefined 
    },
    { 
      key: 'Shipped', 
      label: 'Shipped', 
      icon: <Icon.Truck weight="fill" />,
      date: order.shipmentId ? order.updatedAt : undefined 
    },
    { 
      key: 'Completed', 
      label: 'Delivered', 
      icon: <Icon.CheckCircle weight="fill" />,
      date: order.deliveredAt 
    },
  ];

  const getCurrentStatusIndex = () => {
    if (order.status === 'Cancelled') return -1;
    if (order.status === 'Completed') return 4;
    if (order.shipmentId) return 2;
    if (order.status === 'Processing') return 1;
    return 0;
  };

  const currentIndex = getCurrentStatusIndex();

  if (order.status === 'Cancelled') {
    return (
      <div className="p-6 border border-line rounded-xl bg-red/5">
        <h6 className="heading6 mb-4">Order Status</h6>
        <div className="flex items-center gap-4 text-red">
          <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center text-2xl">
            <Icon.XCircle weight="fill" />
          </div>
          <div>
            <div className="text-title font-semibold">Order Cancelled</div>
            <div className="text-sm text-secondary mt-1">{formatDate(order.updatedAt)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border border-line rounded-xl">
      <h6 className="heading6 mb-6">Order Status</h6>
      <div className="space-y-4">
        {statuses.map((status, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={status.key} className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 transition-all ${
                isActive 
                  ? 'bg-black text-white' 
                  : 'bg-surface text-secondary'
              } ${isCurrent ? 'ring-4 ring-black/10' : ''}`}>
                {status.icon}
              </div>
              <div className="flex-1 pt-1">
                <div className={`font-semibold ${isActive ? 'text-black' : 'text-secondary'}`}>
                  {status.label}
                </div>
                {status.date && (
                  <div className="text-sm text-secondary mt-1">
                    {formatDate(status.date)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Product Item Component
const OrderProductItem = ({ product, index }: { product: OrderType['products'][0]; index: number }) => {
  return (
    <div className="flex gap-4 pb-5 border-b border-line last:border-0 last:pb-0">
      <div className="bg-img flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-surface">
        <Image
          src={`/images/product/1000x1000.png`}
          width={100}
          height={100}
          alt={`Product ${index + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <div className="text-title font-semibold line-clamp-2">
          Product {index + 1}
        </div>
        {product.attributes && product.attributes.length > 0 && (
          <div className="caption1 text-secondary mt-2 flex gap-2">
            {product.attributes.map((attr, i) => (
              <span key={i}>
                <span className="capitalize">{attr.name}:</span> {attr.value}
                {i < product.attributes.length - 1 && <span className="mx-1">/</span>}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-secondary">Qty: {product.qty}</span>
          <span className="text-secondary">×</span>
          <span className="text-title font-semibold">{formatCurrency(product.price)}</span>
        </div>
        {product.saleDiscount && product.saleDiscount > 0 && (
          <div className="mt-1">
            <span className="text-xs px-2 py-0.5 bg-red/10 text-red rounded">
              -{product.saleDiscount}% Sale Discount
            </span>
          </div>
        )}
      </div>
      <div className="text-right">
        <div className="text-title font-semibold">
          {formatCurrency(product.price * product.qty)}
        </div>
      </div>
    </div>
  );
};

export default function OrderDetailsClient({ orderId }: OrderDetailsClientProps) {
  const router = useRouter();
  const { data: order, isLoading, isError, error } = useOrderById(orderId);

  // Handle loading state (should be rare due to prefetching)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon.CircleNotch className="text-5xl animate-spin text-black mx-auto" />
          <p className="mt-4 text-secondary">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError || !order) {
    return (
      <>
        <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
        <div id="header" className="relative w-full">
          <MenuOne props="bg-transparent" />
        </div>
        <div className="order-detail-block md:py-20 py-10">
          <div className="container">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Icon.WarningCircle className="text-7xl text-red mb-4" />
              <h3 className="heading3 mb-2">Order Not Found</h3>
              <p className="text-secondary mb-6">
                {error?.message || 'The order you are looking for does not exist or you do not have permission to view it.'}
              </p>
              <button
                onClick={() => router.back()}
                className="button-main"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Calculate order totals
  const subtotal = order.totalBeforeDiscount || order.total;
  const discount = order.couponDiscount || 0;
  const shipping = order.shippingPrice || 0;
  const tax = order.taxPrice || 0;

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <br />
      </div>

      <div className="order-detail-block md:py-20 py-10">
        <div className="container">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-secondary hover:text-black transition-colors mb-6"
          >
            <Icon.CaretLeft className="text-xl" />
            <span className="text-button">Back to Orders</span>
          </button>

          {/* Order header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-line">
            <div>
              <h3 className="heading3">Order #{order._id}</h3>
              <p className="text-secondary mt-2">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <span className={`tag px-5 py-2.5 rounded-full bg-opacity-10 text-button font-semibold ${getStatusBadge(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left column - Order information */}
            <div className="space-y-6">
              {/* Status Timeline */}
              <OrderStatusTimeline order={order} />

              {/* Contact Information */}
              <div className="p-6 border border-line rounded-xl">
                <h6 className="heading6 mb-4 text-button-uppercase text-secondary">Contact Information</h6>
                <div className="space-y-2">
                  <div className="text-title font-semibold">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </div>
                  <div className="text-secondary">{order.shippingAddress.phoneNumber}</div>
                  {order.paymentResult?.email && (
                    <div className="text-secondary">{order.paymentResult.email}</div>
                  )}
                </div>
              </div>

              {/* Addresses */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Shipping Address */}
                <div className="p-6 border border-line rounded-xl">
                  <h6 className="text-button-uppercase text-secondary mb-3">
                    {order.deliveryType === 'pickup' ? 'Pickup Information' : 'Shipping Address'}
                  </h6>
                  <div className="text-title leading-relaxed">
                    {order.shippingAddress.address1}
                    {order.shippingAddress.address2 && <>, {order.shippingAddress.address2}</>}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    <br />
                    {order.shippingAddress.country}
                  </div>
                </div>

                {/* Billing Address (same as shipping for now) */}
                <div className="p-6 border border-line rounded-xl">
                  <h6 className="text-button-uppercase text-secondary mb-3">Billing Address</h6>
                  <div className="text-title leading-relaxed">
                    {order.shippingAddress.address1}
                    {order.shippingAddress.address2 && <>, {order.shippingAddress.address2}</>}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    <br />
                    {order.shippingAddress.country}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="p-6 border border-line rounded-xl">
                <h6 className="heading6 mb-4 text-button-uppercase text-secondary">Payment Information</h6>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-secondary">Method:</span>
                    <span className="text-title font-semibold capitalize">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Status:</span>
                    <span className={`font-semibold ${order.isPaid ? 'text-success' : 'text-yellow'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  {order.isPaid && order.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-secondary">Paid At:</span>
                      <span className="text-title">{formatDate(order.paidAt)}</span>
                    </div>
                  )}
                  {order.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-secondary">Transaction ID:</span>
                      <span className="text-title text-xs">{order.transactionId}</span>
                    </div>
                  )}
                  {order.shipmentId && (
                    <div className="flex justify-between">
                      <span className="text-secondary">Shipment ID:</span>
                      <span className="text-title text-xs">{order.shipmentId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column - Products and Summary */}
            <div className="space-y-6">
              {/* Products List */}
              <div className="p-6 border border-line rounded-xl">
                <h6 className="heading6 mb-6">Order Items ({order.products.length})</h6>
                <div className="space-y-5">
                  {order.products.map((product, index) => (
                    <OrderProductItem key={index} product={product} index={index} />
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-6 border border-line rounded-xl bg-surface">
                <h6 className="heading6 mb-6">Order Summary</h6>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-secondary">Subtotal:</span>
                    <span className="text-title font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-secondary">
                        Discount {order.couponCode && `(${order.couponCode})`}:
                      </span>
                      <span className="text-red font-semibold">-{formatCurrency(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-secondary">Shipping ({order.deliveryType}):</span>
                    <span className="text-title font-semibold">
                      {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                    </span>
                  </div>

                  {tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-secondary">Tax:</span>
                      <span className="text-title font-semibold">{formatCurrency(tax)}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-line flex justify-between">
                    <span className="heading6">Total:</span>
                    <span className="heading6">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                {order.status === 'Pending' && !order.isPaid && (
                  <button className="button-main flex-1">
                    Pay Now
                  </button>
                )}
                {order.status === 'Pending' && (
                  <button className="flex-1 px-6 py-3 border border-red text-red rounded-lg hover:bg-red hover:text-white transition-all font-semibold">
                    Cancel Order
                  </button>
                )}
                {order.status === 'Completed' && (
                  <>
                    <button className="button-main flex-1">
                      Reorder
                    </button>
                    <button className="flex-1 px-6 py-3 border border-line rounded-lg hover:bg-black hover:text-white transition-all font-semibold">
                      Leave Review
                    </button>
                  </>
                )}
                {order.status === 'Processing' && (
                  <button className="button-main flex-1">
                    Track Order
                  </button>
                )}
              </div>

              {/* Help section */}
              <div className="p-6 border border-line rounded-xl bg-blue/5">
                <div className="flex gap-4">
                  <Icon.Info className="text-3xl text-blue flex-shrink-0" />
                  <div>
                    <h6 className="font-semibold mb-2">Need Help?</h6>
                    <p className="text-sm text-secondary">
                      If you have any questions about your order, please contact our customer support team.
                    </p>
                    <Link href="/pages/contact" className="text-button text-blue hover:underline mt-2 inline-block">
                      Contact Support →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
