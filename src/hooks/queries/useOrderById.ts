import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/libs/api/axios';
import { api } from '@/libs/api/endpoints';
import { EnrichedOrder } from '@/types/order';
import { queryKeys } from '@/provider/react-query';

// Response type from backend
export interface OrderByIdResponse {
  message: string;
  data: EnrichedOrder;
}

// Base function to fetch single order by ID
const fetchOrderById = async (orderId: string): Promise<EnrichedOrder> => {
  const response = await apiClient.get<EnrichedOrder>(api.orders.byId(orderId));

  if (!response.data) {
    throw new Error('Order not found');
  }

  return response.data;
};

// Hook for fetching single order by ID
export const useOrderById = (orderId: string): UseQueryResult<EnrichedOrder, Error> => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    enabled: !!orderId, // Only run query if orderId exists
  });
};

export default useOrderById;
