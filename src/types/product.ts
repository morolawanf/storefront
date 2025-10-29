/**
 * Product types for the storefront
 */

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  sku?: string;
  brand?: string;
  stock?: number;
  description?: string;
  tags?: string[];
  attributes?: ProductAttribute[];
  specifications?: ProductSpecification[];
  category?: ProductCategory;
  description_images?: string[];
  rating?: number;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  search?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'createdAt' | 'rating' | 'sales';
  sortOrder?: 'asc' | 'desc';
  availability?: 'in-stock' | 'out-of-stock' | 'low-stock';
  specKey?: string;
  specValue?: string;
}

export interface SearchProductParams {
  q: string;
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  sortBy?: 'price' | 'name' | 'createdAt' | 'rating' | 'sales';
  sortOrder?: 'asc' | 'desc';
  specKey?: string;
  specValue?: string;
}

export interface CategoryBySlugParams {
  slug: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

export interface TopCategory {
  _id: string;
  name: string;
  slug: string;
  image: string;
  totalSold: number;
  productCount: number;
}
