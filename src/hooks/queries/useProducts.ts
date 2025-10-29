'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/api/axios';
import api from '@/libs/api/endpoints';
import {
  Product,
  ProductListMeta,
  ProductListParams,
  SearchProductParams,
  CategoryBySlugParams,
  TopCategory,
} from '@/types/product';

/**
 * Hook to fetch all products with filters and pagination
 * @param params - Filter and pagination parameters
 * @returns Query result with products list and metadata
 */
export const useProducts = (params?: ProductListParams) => {
  return useQuery<{ data: Product[]; meta: ProductListMeta }>({
    queryKey: ['products', 'list', params],
    queryFn: async () => {
      const response = await apiClient.get<Product[]>(api.products.list, {
        params,
      });
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      // Backend returns { data, meta } structure
      return response as unknown as { data: Product[]; meta: ProductListMeta };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch a single product by ID
 * @param id - Product ID
 * @returns Query result with product details
 */
export const useProductById = (id: string) => {
  return useQuery<Product>({
    queryKey: ['products', 'byId', id],
    queryFn: async () => {
      const response = await apiClient.get<Product>(api.products.byId(id));
      if (!response.data) {
        throw new Error('Product not found');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single product by slug
 * @param slug - Product slug
 * @returns Query result with product details
 */
export const useProductBySlug = (slug: string) => {
  return useQuery<Product>({
    queryKey: ['products', 'bySlug', slug],
    queryFn: async () => {
      const response = await apiClient.get<Product>(api.products.bySlug(slug));
      if (!response.data) {
        throw new Error('Product not found');
      }
      return response.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to search products with filters
 * @param params - Search query and filter parameters
 * @returns Query result with search results and metadata
 */
export const useSearchProducts = (params: SearchProductParams) => {
  return useQuery<{ data: Product[]; meta: ProductListMeta }>({
    queryKey: ['products', 'search', params],
    queryFn: async () => {
      const response = await apiClient.get<Product[]>(api.products.search, {
        params,
      });
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response as unknown as { data: Product[]; meta: ProductListMeta };
    },
    enabled: !!params.q && params.q.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch products by category slug
 * @param params - Category slug and filter parameters
 * @returns Query result with products in category
 */
export const useProductsByCategorySlug = (params: CategoryBySlugParams) => {
  return useQuery<{ data: Product[]; meta: ProductListMeta & { slug: string } }>({
    queryKey: ['products', 'byCategorySlug', params],
    queryFn: async () => {
      const { slug, ...queryParams } = params;
      const response = await apiClient.get<Product[]>(api.products.byCategorySlug(slug), {
        params: queryParams,
      });
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response as unknown as { data: Product[]; meta: ProductListMeta & { slug: string } };
    },
    enabled: !!params.slug,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

/**
 * Hook to fetch products of the week (last 7 days top sellers)
 * @param page - Page number
 * @param limit - Items per page
 * @returns Query result with week's top products
 */
export const useWeekProducts = (page = 1, limit = 10) => {
  return useQuery<{ data: Product[]; meta: ProductListMeta }>({
    queryKey: ['products', 'week', page, limit],
    queryFn: async () => {
      const response = await apiClient.get<Product[]>(api.products.week, {
        params: { page, limit },
      });
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response as unknown as { data: Product[]; meta: ProductListMeta };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch top sold products of all time
 * @param page - Page number
 * @param limit - Items per page
 * @returns Query result with top sold products
 */
export const useTopSoldProducts = (page = 1, limit = 10) => {
  return useQuery<{ data: Product[]; meta: ProductListMeta }>({
    queryKey: ['products', 'topSold', page, limit],
    queryFn: async () => {
      const response = await apiClient.get<Product[]>(api.products.topSold, {
        params: { page, limit },
      });
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response as unknown as { data: Product[]; meta: ProductListMeta };
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch hot sales products (last 30 days)
 * @param page - Page number
 * @param limit - Items per page
 * @returns Query result with hot sales products
 */
export const useHotSalesProducts = (page = 1, limit = 10) => {
  return useQuery<{ data: Product[]; meta: ProductListMeta }>({
    queryKey: ['products', 'hotSales', page, limit],
    queryFn: async () => {
      const response = await apiClient.get<Product[]>(api.products.hotSales, {
        params: { page, limit },
      });
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response as unknown as { data: Product[]; meta: ProductListMeta };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch top categories by purchase volume
 * @param limit - Maximum number of categories (max: 10, default: 10)
 * @returns Query result with top categories
 */
export const useTopCategories = (limit = 10) => {
  return useQuery<TopCategory[]>({
    queryKey: ['products', 'topCategories', limit],
    queryFn: async () => {
      const response = await apiClient.get<TopCategory[]>(api.products.topCategories, {
        params: { limit: Math.min(limit, 10) },
      });
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    staleTime: 20 * 60 * 1000, // 20 minutes
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch personalized product recommendations for a user
 * @param userId - User ID (optional)
 * @param page - Page number
 * @param limit - Items per page
 * @returns Query result with recommended products
 */
export const useProductRecommendations = (userId?: string, page = 1, limit = 10) => {
  return useQuery<{ data: Product[]; meta: ProductListMeta }>({
    queryKey: ['products', 'recommendations', userId, page, limit],
    queryFn: async () => {
      const response = await apiClient.get<Product[]>(api.products.recommendations, {
        params: { userId, page, limit },
      });
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response as unknown as { data: Product[]; meta: ProductListMeta };
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch product recommendations based on a specific product
 * @param productId - Product ID to base recommendations on
 * @param page - Page number
 * @param limit - Items per page
 * @returns Query result with related products
 */
export const useRecommendationsByProduct = (productId: string, page = 1, limit = 20) => {
  return useQuery<{ data: Product[]; meta: ProductListMeta }>({
    queryKey: ['products', 'recommendationsByProduct', productId, page, limit],
    queryFn: async () => {
      const response = await apiClient.get<Product[]>(
        api.products.recommendationsByProduct(productId),
        {
          params: { page, limit },
        }
      );
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response as unknown as { data: Product[]; meta: ProductListMeta };
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
