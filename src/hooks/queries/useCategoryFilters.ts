'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/api/axios';
import api from '@/libs/api/endpoints';
import type { CategoryFiltersResponse } from '@/types/product';

/**
 * Fetch dynamic filters for a given category slug (and its direct subcategories)
 * - priceRange: { min, max }
 * - attributes: list of attribute names with available values and counts
 * - specifications: list of specification keys with values and counts
 * - tags: popular tags with counts
 * - packSizes: available pack size labels with counts
 */
export const useCategoryFilters = (slug: string | undefined) => {
  return useQuery<CategoryFiltersResponse>({
    queryKey: ['categories', 'filters', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Category slug is required');
      const response = await apiClient.get<CategoryFiltersResponse>(
        api.categories.filtersBySlug(slug)
      );
      if (!response.data) {
        throw new Error('No filters returned from server');
      }
      return response.data;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
