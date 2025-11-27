'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/libs/api/axios';
import api from '@/libs/api/endpoints';

export interface StoreSettings {
  _id: string;
  storeName: string;
  companyName: string;
  logoUrl: string;
  websiteUrl: string;
  supportEmail: string;
  supportPhone: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  taxId: string;
  taxRate: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * React Query hook to fetch store settings
 * @returns Query result with store settings data
 */
export const useStoreSettings = (
  options?: Omit<UseQueryOptions<StoreSettings, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<StoreSettings, Error>({
    queryKey: ['storeSettings'],
    queryFn: async () => {
      const response = await apiClient.get<StoreSettings>(api.settings.get);
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - settings don't change often
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3, // Retry failed requests
    ...options,
  });
};
