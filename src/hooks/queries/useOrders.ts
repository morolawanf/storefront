import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/libs/api/axios';
import { api } from '@/libs/api/endpoints';
import { OrdersResponse, OrderQueryParams } from '@/types/order';

// Base function to fetch orders
const fetchOrders = async (params: OrderQueryParams): Promise<OrdersResponse> => {
  const response = await apiClient.getWithMeta<
    { orders: OrdersResponse['orders']; totalOrders: number },
    OrdersResponse['meta']
  >(api.orders.list, { params });

  if (!response.data) {
    throw new Error('No data received from server');
  }

  return {
    orders: response.data.orders,
    totalOrders: response.data.totalOrders,
    meta: response.meta || { page: 1, limit: 10, total: 0, totalPages: 0 },
  };
};

// Hook for all orders
export const useAllOrders = (page: number = 1, limit: number = 10): UseQueryResult<OrdersResponse, Error> => {
  return useQuery({
    queryKey: ['orders', 'all', page, limit],
    queryFn: () => fetchOrders({ page, limit, status: 'all' }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for pending orders
export const usePendingOrders = (page: number = 1, limit: number = 10): UseQueryResult<OrdersResponse, Error> => {
  return useQuery({
    queryKey: ['orders', 'pending', page, limit],
    queryFn: () => fetchOrders({ page, limit, status: 'pending' }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Hook for processing/delivery orders
export const useDeliveryOrders = (page: number = 1, limit: number = 10): UseQueryResult<OrdersResponse, Error> => {
  return useQuery({
    queryKey: ['orders', 'delivery', page, limit],
    queryFn: () => fetchOrders({ page, limit, status: 'processing' }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Hook for completed orders
export const useCompletedOrders = (page: number = 1, limit: number = 10): UseQueryResult<OrdersResponse, Error> => {
  return useQuery({
    queryKey: ['orders', 'completed', page, limit],
    queryFn: () => fetchOrders({ page, limit, status: 'completed' }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Hook for canceled orders
export const useCanceledOrders = (page: number = 1, limit: number = 10): UseQueryResult<OrdersResponse, Error> => {
  return useQuery({
    queryKey: ['orders', 'canceled', page, limit],
    queryFn: () => fetchOrders({ page, limit, status: 'cancelled' }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Generic hook that uses a single query with dynamic status
export const useOrders = (
  status: 'all' | 'pending' | 'delivery' | 'completed' | 'canceled',
  page: number = 1,
  limit: number = 10
): UseQueryResult<OrdersResponse, Error> => {
  // Map display status to API status
  const apiStatus = status === 'delivery' ? 'processing' : status === 'canceled' ? 'cancelled' : status;

  return useQuery({
    queryKey: ['orders', status, page, limit],
    queryFn: () => fetchOrders({ page, limit, status: apiStatus as OrderQueryParams['status'] }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
