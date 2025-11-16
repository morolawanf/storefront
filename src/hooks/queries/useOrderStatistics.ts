import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/libs/api/axios';
import { api } from '@/libs/api/endpoints';

export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  failedOrders: number;
}

const fetchOrderStatistics = async (): Promise<OrderStatistics> => {
  const response = await apiClient.get<OrderStatistics>(api.orders.statistics);

  if (!response.data) {
    throw new Error('No statistics data received from server');
  }

  return response.data;
};

export const useOrderStatistics = (): UseQueryResult<OrderStatistics, Error> => {
  return useQuery({
    queryKey: ['orders', 'statistics'],
    queryFn: fetchOrderStatistics,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
