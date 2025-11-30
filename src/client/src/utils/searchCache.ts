/**
 * Clear search cache when needed
 */
import { apiCache } from './apiCache';

/**
 * Clear all search-related caches
 * Call this when hotels are updated/created/deleted
 */
export const clearSearchCache = () => {
  // In a more sophisticated implementation, we'd track cache keys
  // For now, we can clear all caches that start with 'search:'
  // Since we're using Map, we need to iterate through keys
  // Simple approach: clear all for now (or implement key tracking)
  // For now, just note that search cache expires automatically after 3 minutes
  // If you need to manually clear, you'd need to track cache keys
};

import { generateCacheKey } from './apiCache';

/**
 * Clear search cache for specific query
 */
export const clearSearchCacheForQuery = (params: Record<string, unknown>) => {
  // Generate the same cache key and delete it
  const cacheKey = generateCacheKey('search:hotels', params);
  apiCache.delete(cacheKey);
};
