/**
 * CDN URL utilities
 * Constructs full CDN URLs from relative paths
 */

const CDN_BASE_URL = 'https://oeptest.b-cdn.net/';

/**
 * Image variant type
 */
export type ImageVariant = 'base' | 'mini';

/**
 * Constructs full CDN URL from a relative path
 * @param path - Relative path from upload response (e.g., "reviews/c140fb28-...")
 * @param variant - Image variant: 'base' (original) or 'mini' (optimized thumbnail)
 * @returns Full CDN URL or original if already a full URL
 */
export function getCdnUrl(path: string | undefined | null, variant: ImageVariant = 'base'): string {
  if (!path) return '';
  
  // If already a full URL, return as is (but apply variant logic)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // For mini variant, convert path to mini version if not already
    if (variant === 'mini' && !path.includes('-mini.')) {
      return convertToMiniUrl(path);
    }
    return path;
  }
  
  // Remove leading slash if present
  let cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // For mini variant, convert path to mini version
  if (variant === 'mini' && !cleanPath.includes('-mini.')) {
    cleanPath = convertToMiniPath(cleanPath);
  }
  
  // Construct full CDN URL
  return `${CDN_BASE_URL}${cleanPath}`;
}

/**
 * Convert a base path to mini path
 * @param path - Base path (e.g., "products/uuid-timestamp.webp")
 * @returns Mini path (e.g., "products/uuid-timestamp-mini.webp")
 */
function convertToMiniPath(path: string): string {
  const lastDotIndex = path.lastIndexOf('.');
  if (lastDotIndex === -1) return path; // No extension, return as is
  
  const basePath = path.substring(0, lastDotIndex);
  const extension = path.substring(lastDotIndex);
  return `${basePath}-mini${extension}`;
}

/**
 * Convert a base URL to mini URL
 * @param url - Base URL
 * @returns Mini URL
 */
function convertToMiniUrl(url: string): string {
  const lastDotIndex = url.lastIndexOf('.');
  if (lastDotIndex === -1) return url; // No extension, return as is
  
  const baseUrl = url.substring(0, lastDotIndex);
  const extension = url.substring(lastDotIndex);
  return `${baseUrl}-mini${extension}`;
}

/**
 * Get CDN base URL
 */
export function getCdnBaseUrl(): string {
  return CDN_BASE_URL;
}

/**
 * Check if a URL is a CDN URL
 */
export function isCdnUrl(url: string): boolean {
  return url.startsWith(CDN_BASE_URL);
}

/**
 * Extract path from CDN URL
 * @param url - Full CDN URL
 * @returns Relative path
 */
export function extractPathFromCdnUrl(url: string): string {
  if (url.startsWith(CDN_BASE_URL)) {
    return url.slice(CDN_BASE_URL.length);
  }
  return url;
}
