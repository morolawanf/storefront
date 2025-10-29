/**
 * Category type definitions matching backend API response
 * These types are specifically for data coming from the /categories endpoint
 */

export interface ApiSubCategory {
  _id: string;
  name: string;
  image: string;
  slug?: string;
  priority?: boolean;
}

export interface ApiCategory {
  _id: string;
  name: string;
  image: string;
  slug: string;
  banner?: string;
  priority: boolean;
  sub_categories: ApiSubCategory[];
}

export interface CategoriesApiResponse {
  message: string;
  data: ApiCategory[];
  code: number;
  meta?: {
    total: number;
  };
}
