/**
 * Simple in-memory cache for API responses
 * Reduces unnecessary API calls and improves performance
 */

interface CacheEntry<T> {
  data: T;
  expires: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expires) {
      // Expired, remove from cache
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache with optional TTL (time to live) in milliseconds
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
    });
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Singleton instance
export const apiCache = new ApiCache();

// Clean expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      apiCache.cleanExpired();
    },
    5 * 60 * 1000
  );
}

/**
 * Generate cache key from parameters
 */
export const generateCacheKey = (
  base: string,
  params?: Record<string, any>
): string => {
  if (!params || Object.keys(params).length === 0) {
    return base;
  }

  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return `${base}?${sortedParams}`;
};

/**
 * Cache decorator for async functions
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    ttl?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
    skipCache?: (...args: Parameters<T>) => boolean;
  }
): T {
  return (async (...args: Parameters<T>) => {
    // Skip cache if specified
    if (options?.skipCache?.(...args)) {
      return fn(...args);
    }

    // Generate cache key
    const cacheKey =
      options?.keyGenerator?.(...args) || `${fn.name}_${JSON.stringify(args)}`;

    // Check cache
    const cached = apiCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fn(...args);

    // Cache the result
    apiCache.set(cacheKey, data, options?.ttl);

    return data;
  }) as T;
}
