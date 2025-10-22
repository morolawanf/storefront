'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAccountStore } from '@/store/accountStore';
import { useOrders } from '@/hooks/queries/useOrders';
import { WithPagination } from '@/components/common/WithPagination';
import { OrdersResponse, OrderType } from '@/types/order';
import * as Icon from '@phosphor-icons/react/dist/ssr';

// ============================================================================
// TOGGLE: Set to true to use dummy data, false to use real API with TanStack Query
// ============================================================================
const USE_DUMMY_DATA = true;

// ============================================================================
// DUMMY DATA - Remove this section when ready to use real API
// ============================================================================
const DUMMY_ORDERS: OrderType[] = [
  {
    _id: 's184989823',
    user: 'user123',
    products: [
      {
        product: 'prod123456',
        qty: 1,
        price: 45.00,
        attributes: [
          { name: 'size', value: 'XL' },
          { name: 'color', value: 'Yellow' }
        ]
      },
      {
        product: 'prod123457',
        qty: 2,
        price: 70.00,
        attributes: [
          { name: 'size', value: 'XL' },
          { name: 'color', value: 'White' }
        ]
      }
    ],
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentMethod: 'card',
    total: 115.00,
    couponDiscount: 0,
    deliveryType: 'shipping',
    shippingPrice: 0,
    taxPrice: 0,
    isPaid: true,
    status: 'Processing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 's184989824',
    user: 'user123',
    products: [
      {
        product: 'prod123458',
        qty: 1,
        price: 69.00,
        attributes: [
          { name: 'size', value: 'L' },
          { name: 'color', value: 'Pink' }
        ]
      }
    ],
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentMethod: 'card',
    total: 69.00,
    couponDiscount: 0,
    deliveryType: 'shipping',
    shippingPrice: 0,
    taxPrice: 0,
    isPaid: false,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 's184989825',
    user: 'user123',
    products: [
      {
        product: 'prod123459',
        qty: 1,
        price: 32.00,
        attributes: [
          { name: 'size', value: 'L' },
          { name: 'color', value: 'Black' }
        ]
      }
    ],
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentMethod: 'card',
    total: 32.00,
    couponDiscount: 0,
    deliveryType: 'shipping',
    shippingPrice: 0,
    taxPrice: 0,
    isPaid: true,
    status: 'Completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 's184989826',
    user: 'user123',
    products: [
      {
        product: 'prod123460',
        qty: 1,
        price: 49.00,
        attributes: [
          { name: 'size', value: 'M' },
          { name: 'color', value: 'Blue' }
        ]
      }
    ],
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentMethod: 'card',
    total: 49.00,
    couponDiscount: 0,
    deliveryType: 'shipping',
    shippingPrice: 0,
    taxPrice: 0,
    isPaid: false,
    status: 'Cancelled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper to filter dummy data by status
const filterDummyOrders = (status: string): OrderType[] => {
  if (status === 'all') return DUMMY_ORDERS;
  if (status === 'delivery') return DUMMY_ORDERS.filter(o => o.status === 'Processing');
  if (status === 'canceled') return DUMMY_ORDERS.filter(o => o.status === 'Cancelled');
  return DUMMY_ORDERS.filter(o => o.status.toLowerCase() === status.toLowerCase());
};

// ============================================================================
// END DUMMY DATA
// ============================================================================

// Order item component
const OrderItem = ({ order }: { order: OrderType }) => {
  const { setOpenDetail } = useAccountStore();

  // Determine status badge styling
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Pending: 'bg-yellow text-yellow',
      Processing: 'bg-purple text-purple',
      Completed: 'bg-success text-success',
      Cancelled: 'bg-red text-red',
    };

    return statusConfig[status as keyof typeof statusConfig] || 'bg-secondary text-secondary';
  };

  return (
    <div className="order_item mt-5 border border-line rounded-lg box-shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-line">
        <div className="flex items-center gap-2">
          <strong className="text-title">Order Number:</strong>
          <strong className="order_number text-button uppercase">{order._id}</strong>
        </div>
        <div className="flex items-center gap-2">
          <strong className="text-title">Order status:</strong>
          <span className={`tag px-4 py-1.5 rounded-full bg-opacity-10 caption1 font-semibold ${getStatusBadge(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>
      <div className="list_prd px-5">
        {order.products.map((item, index) => (
          <div key={index} className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line last:border-b-0">
            <Link href={`/product/${item.product}`} className="flex items-center gap-5">
              <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                <Image
                  src={'/images/product/1000x1000.png'}
                  width={1000}
                  height={1000}
                  alt={'Product image'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="prd_name text-title">Product #{item.product.slice(-6)}</div>
                <div className="caption1 text-secondary mt-2">
                  {item.attributes.map((attr, idx) => (
                    <span key={idx}>
                      <span className="capitalize">{attr.name}</span>: <span className="uppercase">{attr.value}</span>
                      {idx < item.attributes.length - 1 && ' / '}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
            <div className="text-title">
              <span className="prd_quantity">{item.qty}</span>
              <span> X </span>
              <span className="prd_price">${item.price.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 p-5">
        <Link href={`/my-account/orders/${order._id}`} className="button-main">
          Order Details
        </Link>
        {order.status === 'Pending' && (
          <button className="button-main bg-surface border border-line hover:bg-black text-black hover:text-white">
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
};

export default function HistoryOrders() {
  const { activeTab, activeOrders, setActiveOrders, orderPage, setOrderPage, orderLimit } = useAccountStore();

  const handleActiveOrders = (order: string) => {
    setActiveOrders(order);
  };

  // IMPORTANT: Call hooks unconditionally BEFORE any early returns
  // Get the query based on active tab
  const query = useOrders(activeOrders as 'all' | 'pending' | 'delivery' | 'completed' | 'canceled', orderPage, orderLimit);

  // Early return AFTER all hooks have been called
  if (activeTab !== 'orders') return null;

  // ============================================================================
  // TOGGLE LOGIC: Use dummy data or real API response
  // ============================================================================
  const orders = USE_DUMMY_DATA 
    ? filterDummyOrders(activeOrders) 
    : (query.data?.orders || []);
  
  const paginationMeta = USE_DUMMY_DATA 
    ? { 
        currentPage: 1, 
        totalPages: 1, 
        totalItems: orders.length, 
        itemsPerPage: orderLimit 
      }
    : query.data?.meta;
  // ============================================================================

  const isEmpty = orders.length === 0;

  return (
    <div className="tab text-content overflow-hidden w-full p-7 border border-line rounded-xl">
      <h6 className="heading6">Your Orders</h6>
      <div className="w-full overflow-x-auto">
        <div className="menu-tab grid grid-cols-5 max-lg:w-[500px] border-b border-line mt-3">
          {['all', 'pending', 'delivery', 'completed', 'canceled'].map((item, index) => (
            <button
              key={index}
              className={`item relative px-3 py-2.5 text-secondary text-center duration-300 hover:text-black border-b-2 ${
                activeOrders === item ? 'active border-black' : 'border-transparent'
              }`}
              onClick={() => handleActiveOrders(item)}
            >
              <span className="relative text-button z-[1] capitalize">{item}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* DUMMY DATA MODE: Render orders directly without pagination HOC */}
      {/* ====================================================================== */}
      {USE_DUMMY_DATA ? (
        <>
          {isEmpty ? (
            <div className="flex flex-col items-center gap-3 text-center py-12">
              <Icon.Package className="text-5xl text-secondary" />
              <p className="text-title font-semibold">No orders found</p>
              <p className="text-secondary">You don&apos;t have any {activeOrders !== 'all' ? activeOrders : ''} orders yet</p>
            </div>
          ) : (
            <div className="list_order">
              {orders.map((order) => (
                <OrderItem key={order._id} order={order} />
              ))}
            </div>
          )}
        </>
      ) : (
        /* ====================================================================== */
        /* REAL API MODE: Use WithPagination HOC with TanStack Query */
        /* ====================================================================== */
        <WithPagination
          query={query}
          currentPage={orderPage}
          onPageChange={setOrderPage}
          emptyComponent={
            <div className="flex flex-col items-center gap-3 text-center py-12">
              <Icon.Package className="text-5xl text-secondary" />
              <p className="text-title font-semibold">No orders found</p>
              <p className="text-secondary">You don&apos;t have any {activeOrders !== 'all' ? activeOrders : ''} orders yet</p>
            </div>
          }
        >
          {(data: OrdersResponse) => (
            <div className="list_order">
              {data.orders.map((order) => (
                <OrderItem key={order._id} order={order} />
              ))}
            </div>
          )}
        </WithPagination>
      )}
      {/* ====================================================================== */}
    </div>
  );
}
