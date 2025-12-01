import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/libs/query/get-query-client';
import { ReactNode } from 'react';
import { serverGet, serverGetWithMeta, serverGetAuthenticatedWithMeta } from '@/libs/query/server-api-client';
import { ApiCategory } from '@/types/category';
import { ApiBanner, GroupedBanners } from '@/types/banner';
import api from '@/libs/api/endpoints';
import { TopCategory, ProductListItem, ProductListMeta } from '@/types/product';
import { WishlistItem, WishlistMeta } from '@/types/wishlist';
import { getSession } from 'next-auth/react';
import { auth } from '@@/auth';

/**
 * Server-side fetch functions
 */
async function fetchCategories(): Promise<ApiCategory[]> {
    const data = await serverGet<ApiCategory[]>(api.categories.list);
    return data || [];
}

async function fetchGroupedBanners(): Promise<GroupedBanners[]> {
    const data = await serverGet<GroupedBanners[]>(api.banners.grouped);
    return data || [];
}

async function fetchTopCategories(limit: number = 10): Promise<TopCategory[]> {
    const data = await serverGet<TopCategory[]>(`${api.products.topCategories}?limit=${limit}`);
    return data || [];
}

async function fetchNewProducts(page: number = 1, limit: number = 20): Promise<{ data: ProductListItem[]; meta: ProductListMeta; }> {
    const response = await serverGetWithMeta<ProductListItem[]>(
        `${api.products.newProducts}?page=${page}&limit=${limit}`
    );
    return response || { data: [], meta: { total: 0, page, limit, pages: 0 } };
}

async function fetchWeekProducts(page: number = 1, limit: number = 20): Promise<{ data: ProductListItem[]; meta: ProductListMeta; }> {
    const response = await serverGetWithMeta<ProductListItem[]>(
        `${api.products.week}?page=${page}&limit=${limit}`
    );
    return response || { data: [], meta: { total: 0, page, limit, pages: 0 } };
}

async function fetchTopSoldProducts(page: number = 1, limit: number = 20): Promise<{ data: ProductListItem[]; meta: ProductListMeta; }> {
    const response = await serverGetWithMeta<ProductListItem[]>(
        `${api.products.topSold}?page=${page}&limit=${limit}`
    );
    return response || { data: [], meta: { total: 0, page, limit, pages: 0 } };
}

async function fetchDealsOfTheDay(page: number = 1): Promise<{ data: ProductListItem[]; meta: ProductListMeta; }> {
    const response = await serverGetWithMeta<ProductListItem[]>(
        `${api.products.dealsOfTheDay}?page=${page}`
    );
    return response || { data: [], meta: { total: 0, page, limit: 20, pages: 0 } };
}

/**
 * Authenticated fetch functions for user-specific data
 */
async function fetchWishlistItems(token: string, page: number = 1, limit: number = 30): Promise<{ data: WishlistItem[]; meta: WishlistMeta; }> {
    const response = await serverGetAuthenticatedWithMeta<WishlistItem[]>(
        `${api.wishlist.list}?page=${page}&limit=${limit}`,
        token
    );
    return response || { data: [], meta: { total: 0, page, limit, pages: 0, hasNext: false, hasPrev: false } };
}

async function fetchWishlistCount(token: string): Promise<number> {
    const response = await serverGetAuthenticatedWithMeta<number>(
        api.wishlist.count,
        token
    );
    return (response?.data as number) || 0;
}

// ------------------------------------------------------------
// Server-side Queries Component
// ------------------------------------------------------------

export default async function ServerQueries({ children }: { children: ReactNode; }) {
    const queryClient = getQueryClient();


    // Prefetch all queries here
    // Add more prefetchQuery calls as needed for other data
    const prefetchPromises = [
        // Prefetch categories (used in navigation)
        queryClient.prefetchQuery({
            queryKey: ['categories'],
            queryFn: fetchCategories,
            staleTime: 20 * 60 * 1000, // 20 minutes
        }),

        // Prefetch all banners (used across the site)
        queryClient.prefetchQuery({
            queryKey: ['banners', 'grouped'],
            queryFn: fetchGroupedBanners,
            staleTime: 20 * 60 * 1000, // 20 minutes
        }),

        // Prefetch top categories
        queryClient.prefetchQuery({
            queryKey: ['products', 'topCategories', 10],
            queryFn: () => fetchTopCategories(10),
            staleTime: 20 * 60 * 1000, // 20 minutes
        }),

        // Prefetch new products
        queryClient.prefetchQuery({
            queryKey: ['products', 'new', {page: 1}],
            queryFn: () => fetchNewProducts(1),
            staleTime: 5 * 60 * 1000, // 5 minutes
        }),

        // Prefetch week products
        queryClient.prefetchQuery({
            queryKey: ['products', 'week', {page:1}],
            queryFn: () => fetchWeekProducts(1),
            staleTime: 5 * 60 * 1000, // 10 minutes
        }),

        // Prefetch top sold products
        queryClient.prefetchQuery({
            queryKey: ['products', 'topSold', {page:1}],
            queryFn: () => fetchTopSoldProducts(1),
            staleTime: 5 * 60 * 1000, // 15 minutes
        }),

        // Prefetch deals of the day
        queryClient.prefetchQuery({
            queryKey: ['products', 'dealsOfTheDay', 1],
            queryFn: () => fetchDealsOfTheDay(1),
            staleTime: 5 * 60 * 1000, // 5 minutes (time-sensitive deals)
        }),
    ];
    // Check for authenticated session
    const session = await auth();

    // Add authenticated wishlist prefetch if user is logged in
    if (session?.user?.token) {
        const token = session.user.token;

        prefetchPromises.push(
            // Prefetch wishlist items (first 30 items, most recent first)
            queryClient.prefetchQuery({
                queryKey: ['wishlist', 'list', 1],
                queryFn: () => fetchWishlistItems(token, 1, 30),
                staleTime: 5 * 60 * 1000, // 5 minutes
            }),

            // Prefetch wishlist count
            queryClient.prefetchQuery({
                queryKey: ['wishlist', 'count'],
                queryFn: () => fetchWishlistCount(token),
                staleTime: 5 * 60 * 1000, // 5 minutes
            })
        );
    }

    await Promise.all(prefetchPromises);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
        </HydrationBoundary>
    );
}

