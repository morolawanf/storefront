import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/libs/api/axios';
import { api } from '@/libs/api/endpoints';
import { OrderType } from '@/types/order';
import { queryKeys } from '@/provider/react-query';

// ============================================================================
// TOGGLE: Set to true to use dummy data, false to use real API with TanStack Query
// ============================================================================
const USE_DUMMY_DATA = true;

// ============================================================================
// DUMMY DATA - Remove this section when ready to use real API
// ============================================================================
const DUMMY_ORDER: OrderType = {
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
      ],
      sale: 'sale123',
      saleType: 'Flash',
      saleDiscount: 10
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
    firstName: 'Tony',
    lastName: 'Nguyen',
    phoneNumber: '+12 345-678910',
    address1: '2163 Phillips Gap Rd',
    address2: '',
    city: 'West Jefferson',
    state: 'North Carolina',
    zipCode: '28694',
    country: 'United States'
  },
  paymentMethod: 'card',
  paymentResult: {
    id: 'pay_abc123xyz',
    status: 'success',
    email: 'tony.nguyen@example.com'
  },
  total: 185.00,
  totalBeforeDiscount: 205.00,
  couponCode: 'SAVE20',
  couponDiscount: 20.00,
  deliveryType: 'shipping',
  shippingPrice: 0,
  taxPrice: 0,
  transactionId: 'txn_789xyz',
  isPaid: true,
  status: 'Processing',
  shipmentId: 'ship_456def',
  paidAt: new Date('2025-10-15T10:30:00Z').toISOString(),
  flashSaleApplied: [
    {
      flashSale: 'sale123',
      product: 'prod123456',
      attributeName: 'color',
      attributeValue: 'Yellow',
      discount: 10
    }
  ],
  createdAt: new Date('2025-10-15T10:00:00Z').toISOString(),
  updatedAt: new Date('2025-10-15T10:30:00Z').toISOString()
};

// Map of dummy orders by ID for different test scenarios
const DUMMY_ORDERS: Record<string, OrderType> = {
  's184989823': DUMMY_ORDER,
  's184989824': {
    ...DUMMY_ORDER,
    _id: 's184989824',
    status: 'Pending',
    isPaid: false,
    total: 69.00,
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
    ]
  },
  's184989825': {
    ...DUMMY_ORDER,
    _id: 's184989825',
    status: 'Completed',
    isPaid: true,
    deliveredAt: new Date('2025-10-18T14:00:00Z').toISOString(),
    total: 32.00,
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
    ]
  },
  's184989826': {
    ...DUMMY_ORDER,
    _id: 's184989826',
    status: 'Cancelled',
    isPaid: false,
    total: 49.00,
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
    ]
  }
};
// ============================================================================
// END DUMMY DATA
// ============================================================================

// Response type from backend
interface OrderByIdResponse {
  message: string;
  data: OrderType;
}

// Base function to fetch single order by ID
const fetchOrderById = async (orderId: string): Promise<OrderType> => {
  // ============================================================================
  // TOGGLE LOGIC: Use dummy data or real API
  // ============================================================================
  if (USE_DUMMY_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return dummy order or throw 404
    const dummyOrder = DUMMY_ORDERS[orderId];
    if (!dummyOrder) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    return dummyOrder;
  }
  // ============================================================================

  const response = await apiClient.get<OrderByIdResponse>(api.orders.byId(orderId));

  if (!response.data?.data) {
    throw new Error('Order not found');
  }

  return response.data.data;
};

// Hook for fetching single order by ID
export const useOrderById = (orderId: string): UseQueryResult<OrderType, Error> => {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => fetchOrderById(orderId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!orderId, // Only run query if orderId exists
  });
};

export default useOrderById;
