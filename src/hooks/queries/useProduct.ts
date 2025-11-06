'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import api from '@/libs/api/endpoints';

// Product Detail Interface (extended from base ProductType)
export interface ProductDetail {
  _id: string;
  name: string;
  slug: string;
  price: number;
  description?: string;
  description_images?: Array<{ url: string; cover_image?: boolean; _id?: string }>;
  sku: string;
  stock: number;
  originStock: number;
  rating?: number;
  tags?: string[];
  brand?: string;

  // Category info
  category?: {
    _id: string;
    name: string;
    slug: string;
    image?: string;
  };

  // Dimensions (optional _id will be ignored)
  dimension?: Array<{
    key: 'length' | 'breadth' | 'height' | 'volume' | 'width' | 'weight';
    value: string;
    _id?: string; // Optional - will be removed in future
  }>;

  // Specifications
  specifications?: Array<{
    key: string;
    value: string;
  }>;

  // Attributes (nested with children)
  attributes?: Array<{
    name: string;
    children: Array<{
      name: string;
      price: number;
      stock: number;
      colorCode?: string; // Hex color code for color attributes
      isOutOfStock?: boolean; // Added by backend
      _id: string;
    }>;
    _id: string;
  }>; // Pricing tiers
  pricingTiers?: Array<{
    minQuantity: number;
    strategy: 'fixedPrice' | 'percentOff' | 'amountOff';
    fixedPrice?: number;
    percentOff?: number;
    amountOff?: number;
    _id: string;
  }>;

  // Pack sizes
  packSizes?: Array<{
    label: string;
    quantity: number;
    unit: string;
    _id: string;
  }>;

  // Sales information
  sale?: {
    _id: string;
    type: 'Flash' | 'Limited' | 'Normal';
    startDate?: Date;
    endDate?: Date;
    variants: Array<{
      variantId: string | null; // null = applies to base product
      discount?: number; // percentage
      amountOff?: number;
      maxBuys?: number; // For Limited sales
      boughtCount?: number; // For Limited sales
    }>;
    isActive: boolean;
  } | null;

  // Review statistics
  reviewStats?: {
    averageRating: number;
    totalReviews: number;
  };

  createdAt: string;
  updatedAt?: string;
}

interface UseProductOptions
  extends Omit<UseQueryOptions<ProductDetail, Error>, 'queryKey' | 'queryFn'> {
  slug: string;
}

/**
 * Fetches product by slug with full details including:
 * - Active sales information
 * - Category details
 * - Review statistics
 * - Merged specifications (dimensions + specifications)
 * - Out-of-stock flags for attribute children
 *
 * @param slug - Product slug
 * @param options - Additional react-query options
 *
 * @example
 * const { data: product, isLoading, error } = useProduct({ slug: 'plastic-chair' });
 */
export const useProduct = ({ slug, ...options }: UseProductOptions) => {
  return useQuery<ProductDetail, Error>({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${api.products.bySlug(slug)}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch product');
      }

      const { data } = await response.json();

      if (!data) {
        throw new Error('Product not found');
      }

      return data as ProductDetail;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!slug, // Only run if slug is provided
    ...options,
  });
};
