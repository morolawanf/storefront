import { redirect } from 'next/navigation';
import { auth } from '../../../../../auth';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/provider/react-query';
import { apiClient } from '@/libs/api/axios';
import { api } from '@/libs/api/endpoints';
import { OrderType } from '@/types/order';
import OrderDetailsClient from './Client';

// Fetch function for server-side prefetch
async function prefetchOrder(orderId: string): Promise<OrderType> {
  const response = await apiClient.get<{ message: string; data: OrderType }>(
    api.orders.byId(orderId)
  );

  if (!response.data?.data) {
    throw new Error('Order not found');
  }

  return response.data.data;
}

export default async function OrderDetailsPage({ 
  params 
}: { 
  params: Promise<{ orderId: string }> 
}) {
  // Server-side auth check
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const { orderId } = await params;

  // Create a new QueryClient for this request
  const queryClient = new QueryClient();

  // Prefetch order data on the server
  
  try {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.orders?.detail(orderId),
      queryFn: () => prefetchOrder(orderId),
    });
  } catch (error) {
    console.error('Failed to prefetch order:', error);
    // Don't redirect, let the client handle the error
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrderDetailsClient orderId={orderId} />
    </HydrationBoundary>
  );
}
