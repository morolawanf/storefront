import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/libs/query/get-query-client';
import { ReactNode } from 'react';
import { serverGet } from '@/libs/query/server-api-client';
import { ApiCategory } from '@/types/category';
import { ApiBanner, GroupedBanners } from '@/types/banner';
import api from '@/libs/api/endpoints';

/**
 * Server-side fetch functions
 */
export async function fetchCategories(): Promise<ApiCategory[]> {
    const data = await serverGet<ApiCategory[]>(api.categories.list);
    return data || [];
}

export async function fetchGroupedBannersClient(): Promise<GroupedBanners[]> {
    const data = await serverGet<GroupedBanners[]>(api.banners.grouped);
    return data || [];
}

// ------------------------------------------------------------
// Server-side Queries Component
// ------------------------------------------------------------

export default async function ServerQueries({ children }: { children: ReactNode }) {
    const queryClient = getQueryClient();

    // Prefetch all queries here
    // Add more prefetchQuery calls as needed for other data
    await Promise.all([
        // Prefetch categories (used in navigation)
        queryClient.prefetchQuery({
            queryKey: ['categories'],
            queryFn: fetchCategories,
            staleTime: 20 * 60 * 1000, // 20 minutes
        }),

        // Prefetch all banners (used across the site)
        queryClient.prefetchQuery({
            queryKey: ['banners', 'grouped'],
            queryFn: fetchGroupedBannersClient,
            staleTime: 20 * 60 * 1000, // 20 minutes
        }),

    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
        </HydrationBoundary>
    );
}
