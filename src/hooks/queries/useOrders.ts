import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/libs/api/axios';
import { api } from '@/libs/api/endpoints';
import { OrdersResponse, OrderQueryParams } from '@/types/order';

// Base function to fetch orders
const fetchOrders = async (params: OrderQueryParams): Promise<OrdersResponse> => {
  const response = await apiClient.getWithMeta<
    { orders: OrdersResponse['orders'] },
    OrdersResponse['meta']
  >(api.orders.list, { params });

  if (!response.data) {
    throw new Error('No data received from server');
  }

  return {
    orders: response.data.orders,
    meta: response.meta || { page: 1, limit: 10, total: 0, totalPages: 0 },
  };
};

// Hook for all orders
export const useAllOrders = (
  page: number = 1,
  limit: number = 10
): UseQueryResult<OrdersResponse, Error> => {
  return useQuery({
    queryKey: ['orders', 'all', page, limit],
    queryFn: () => fetchOrders({ page, limit, status: 'All' }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for Pending orders
export const usePendingOrders = (
  page: number = 1,
  limit: number = 10
): UseQueryResult<OrdersResponse, Error> => {
  return useQuery({
    queryKey: ['orders', 'Pending', page, limit],
    queryFn: () => fetchOrders({ page, limit, status: 'Pending' }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Hook for Processing/delivery orders
export const useDeliveryOrders = (
  page: number = 1,
  limit: number = 10
): UseQueryResult<OrdersResponse, Error> => {
  return useQuery({
    queryKey: ['orders', 'delivery', page, limit],
    queryFn: () => fetchOrders({ page, limit, status: 'Processing' }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Hook for Completed orders
export const useCompletedOrders = (
  page: number = 1,
  limit: number = 10
): UseQueryResult<OrdersResponse, Error> => {
  return useQuery({
    queryKey: ['orders', 'Completed', page, limit],
    queryFn: () => fetchOrders({ page, limit, status: 'Completed' }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Hook for Canceled orders
export const useCanceledOrders = (
  page: number = 1,
  limit: number = 10
): UseQueryResult<OrdersResponse, Error> => {
  return useQuery({
    queryKey: ['orders', 'Canceled', page, limit],
    queryFn: () => fetchOrders({ page, limit, status: 'Cancelled' }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Generic hook that uses a single query with dynamic status
export const useOrders = (
  status: 'All' | 'Pending' | 'Processing' | 'Completed' | 'Cancelled' | 'Failed',
  page: number = 1,
  limit: number = 10
): UseQueryResult<OrdersResponse, Error> => {
  // Map display status to API status
  const apiStatus = status === 'All' ? undefined : status;
  return useQuery({
    queryKey: ['orders', status, page, limit],
    queryFn: () => fetchOrders({ page, limit, status: apiStatus as OrderQueryParams['status'] }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
