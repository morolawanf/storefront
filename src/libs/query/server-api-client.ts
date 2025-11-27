import axios from 'axios';
import { ApiResponse, ApiResponseWithMeta } from '@/libs/api/axios';
import { signOut } from '@@/auth';

/**
 * Server-side API client for prefetching data
 * Does NOT use NextAuth session (runs on server before hydration)
 * Use this ONLY for public API endpoints that don't require authentication
 */
export const serverApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => status >= 200 && status < 400,
});

// Response interceptor to unwrap data (same as client apiClient)
serverApiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Server API] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
      });
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Server API Error]', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });

      if (error.response?.status === 401) {
            const respData = error.response.data as Record<string, unknown> | undefined;
            if (
              respData &&
              typeof respData.message === 'string' &&
              respData.message === 'Invalid token'
            ) {
              console.error('[Unauthenticaed]');
              // signOut();
              if (typeof window === 'undefined') {
              signOut({ redirectTo: `/` });
            }

            }
          }
    }
    return Promise.reject(error);
  }
);

/**
 * Server-side typed GET request
 * Automatically unwraps response.data.data → response.data
 */
export async function serverGet<T>(url: string): Promise<T | null> {
  try {
    const response = await serverApiClient.get<ApiResponse<T>>(url);
    return response.data.data;
  } catch (error) {
    console.error(`[Server API] Failed to fetch ${url}:`, error);
    return null;
  }
}

/**
 * Server-side typed GET request with meta
 * Automatically unwraps response.data.data → response.data
 */
export async function serverGetWithMeta<T>(url: string): Promise<{ data: T | []; meta: any }> {
  try {
    const response = await serverApiClient.get<ApiResponseWithMeta<T>>(url);
    return { data: response.data.data, meta: response.data.meta };
  } catch (error) {
    console.error(`[Server API] Failed to fetch ${url}:`, error);
    return { data: [], meta: null };
  }
}

/**
 * Server-side authenticated API client
 * Used for endpoints that require authentication (JWT token)
 */
const createAuthenticatedClient = (token: string) => {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    validateStatus: (status) => status >= 200 && status < 400,
  });
};

/**
 * Server-side authenticated GET request
 * Requires JWT token for authenticated endpoints
 */
export async function serverGetAuthenticated<T>(url: string, token: string): Promise<T | null> {
  try {
    const client = createAuthenticatedClient(token);
    const response = await client.get<ApiResponse<T>>(url);
    return response.data.data;
  } catch (error) {
    console.error(`[Server API Auth] Failed to fetch ${url}:`, error);
    return null;
  }
}

/**
 * Server-side authenticated GET request with meta
 * Requires JWT token for authenticated endpoints with pagination
 */
export async function serverGetAuthenticatedWithMeta<T>(
  url: string,
  token: string
): Promise<{ data: T | []; meta: any }> {
  try {
    const client = createAuthenticatedClient(token);
    const response = await client.get<ApiResponseWithMeta<T>>(url);
    return { data: response.data.data, meta: response.data.meta };
  } catch (error) {
    console.error(`[Server API Auth] Failed to fetch ${url}:`, error);
    return { data: [], meta: null };
  }
}
