import { QueryClient, defaultShouldDehydrateQuery, isServer } from '@tanstack/react-query';

/**
 * Creates a new QueryClient instance with default options
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Queries are considered stale after 60 seconds by default
        staleTime: 60 * 1000,
        // Retry failed requests 3 times
        retry: 3,
        // Exponential backoff for retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      dehydrate: {
        // Include pending queries in dehydration for streaming
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Gets a QueryClient instance
 * - Server: Always creates a new client (each request gets fresh client)
 * - Browser: Reuses singleton client across renders
 * 
 * @returns QueryClient instance
 */
export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client for each request
    // This ensures no data leaks between different user requests
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This ensures that data is not shared between different users and requests
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}
