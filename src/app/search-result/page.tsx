import { Suspense } from 'react';
import SearchResultClient from './SearchResultClient';
import SearchLoading from './loading';

interface SearchPageProps {
    searchParams: Promise<{ query?: string; }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const query = params.query || '';

    return (
        <Suspense fallback={<SearchLoading />}>
            <SearchResultClient searchQuery={query} />
        </Suspense>
    );
}
