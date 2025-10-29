'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/api/axios';
import api from '@/libs/api/endpoints';
import { ApiCategory } from '@/types/category';


/**
 * Client-side fetch function for categories
 * Used by React Query on the client
 */
async function fetchCategoriesClient(): Promise<ApiCategory[]> {
  const response = await apiClient.get<ApiCategory[]>(api.categories.list);
  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
}

/**
 * React Query hook to fetch all categories with subcategories from the API
 * No pagination, returns all categories with their subcategories
 * @returns Query result with categories data (name, image, slug, subcategories)
 */
export const useCategories = () => {
  return useQuery<ApiCategory[]>({
    queryKey: ['categories'],
    queryFn: fetchCategoriesClient,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    refetchOnMount: false, // Don't refetch on every mount since data is stable
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};
