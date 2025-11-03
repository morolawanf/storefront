import { ProductListItem } from './product';

/**
 * Wishlist item returned from backend API
 * Product is populated with full details (without sale info)
 */
export interface WishlistItem {
  _id: string;
  product: ProductListItem;
  user: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pagination metadata for wishlist responses
 */
export interface WishlistMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Wishlist response with pagination
 */
export interface WishlistResponse {
  data: WishlistItem[];
  meta: WishlistMeta;
}

/**
 * Input for adding product to wishlist
 */
export interface AddToWishlistInput {
  product: string; // Product ID
}

/**
 * Partial product data for optimistic wishlist updates
 * Excludes sale field as wishlist products don't have sales
 */
export interface OptimisticWishlistProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: Array<{
    url: string;
    cover_image: boolean;
  }>;
  category: {
    _id: string;
    name: string;
    image: string;
    slug: string;
  };
  stock: number;
  originStock: number;
  sku: string | number;
  sale: null; // Wishlist products don't have sales
}
