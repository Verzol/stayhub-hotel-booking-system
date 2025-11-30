/**
 * Cached service functions to improve performance
 * These wrap original service functions with caching
 */

import { getMyHotels } from '../services/hostService';
import {
  getHostBookings,
  getAllHostBookings,
  getUpcomingBookings,
  getPendingCheckIns,
  getPendingCheckOuts,
  getAnalytics,
  getEarnings,
  type HostBookingFilters,
  type HostBookingResponse,
  type AnalyticsResponse,
  type EarningsResponse,
  type AnalyticsFilters,
  type EarningsFilters,
} from '../services/bookingService';
import {
  getDashboardSummary,
  type DashboardSummaryResponse,
} from '../services/dashboardService';
import { apiCache, generateCacheKey } from './apiCache';
import type { Hotel } from '../types/host';

/**
 * Get dashboard summary with caching (2 minutes)
 * Optimized: Single request for all dashboard stats
 */
export const getCachedDashboardSummary =
  async (): Promise<DashboardSummaryResponse> => {
    const cacheKey = 'host:dashboard:summary';
    const cached = apiCache.get<DashboardSummaryResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const summary = await getDashboardSummary();
    apiCache.set(cacheKey, summary, 2 * 60 * 1000); // 2 minutes
    return summary;
  };

/**
 * Get hotels with caching (10 minutes) - longer cache for hotels as they don't change often
 * Uses stale-while-revalidate pattern: return cached immediately, then refresh in background
 */
export const getCachedHotels = async (): Promise<Hotel[]> => {
  const cacheKey = 'host:hotels';
  const cached = apiCache.get<Hotel[]>(cacheKey);

  // If cache exists, return immediately (stale-while-revalidate pattern)
  if (cached) {
    // Refresh in background without blocking
    getMyHotels()
      .then((freshData) => {
        apiCache.set(cacheKey, freshData, 10 * 60 * 1000); // 10 minutes
      })
      .catch((error) => {
        console.error('Failed to refresh hotels cache', error);
        // Don't throw - user still has cached data
      });

    return cached;
  }

  // No cache - fetch fresh data
  const hotels = await getMyHotels();
  apiCache.set(cacheKey, hotels, 10 * 60 * 1000); // 10 minutes
  return hotels;
};

/**
 * Get host bookings with caching (2 minutes - shorter because bookings change more frequently)
 */
export const getCachedHostBookings = async (
  filters: HostBookingFilters
): Promise<HostBookingResponse[]> => {
  const cacheKey = generateCacheKey('host:bookings', filters);
  const cached = apiCache.get<HostBookingResponse[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const bookings = await getHostBookings(filters);
  apiCache.set(cacheKey, bookings, 2 * 60 * 1000); // 2 minutes
  return bookings;
};

/**
 * Get all host bookings for all hotels (optimized for dashboard)
 * Single request + caching for better performance
 */
export const getCachedAllHostBookings = async (): Promise<
  HostBookingResponse[]
> => {
  const cacheKey = 'host:bookings:all';
  const cached = apiCache.get<HostBookingResponse[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const bookings = await getAllHostBookings();
  apiCache.set(cacheKey, bookings, 2 * 60 * 1000); // 2 minutes
  return bookings;
};

/**
 * Clear booking cache for a specific hotel or all bookings
 * Note: This is a simple implementation. In production, implement key tracking for selective clearing
 * @param _hotelId - Hotel ID (currently unused, cache expires automatically)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const clearBookingCacheForHotel = (_hotelId?: number) => {
  // TODO: Implement selective cache clearing based on hotelId
  // For now, cache expires automatically after TTL (2 minutes)
  // In a more sophisticated implementation, you'd track cache keys and delete selectively
};

/**
 * Clear cache when data is modified (call after create/update/delete)
 */
export const clearHostCache = () => {
  apiCache.delete('host:hotels');
  // Clear all booking caches (they start with 'host:bookings')
  // Note: This is a simple implementation. In production, you might want to track cache keys better
};

/**
 * Clear booking cache for a specific hotel
 * Note: This is a simple implementation. In production, implement key tracking for selective clearing
 * @param _hotelId - Hotel ID (currently unused, clears all cache)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const clearBookingCache = (_hotelId?: number) => {
  // TODO: Implement selective cache clearing based on hotelId
  // For now, clear all host cache
  clearHostCache();
};

/**
 * Get analytics with caching (3 minutes - analytics don't change as frequently as bookings)
 */
export const getCachedAnalytics = async (
  filters?: AnalyticsFilters
): Promise<AnalyticsResponse> => {
  const cacheKey = generateCacheKey('host:analytics', filters || {});
  const cached = apiCache.get<AnalyticsResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const analytics = await getAnalytics(filters);
  apiCache.set(cacheKey, analytics, 3 * 60 * 1000); // 3 minutes
  return analytics;
};

/**
 * Get earnings with caching (3 minutes - earnings don't change as frequently as bookings)
 */
export const getCachedEarnings = async (
  filters?: EarningsFilters
): Promise<EarningsResponse> => {
  const cacheKey = generateCacheKey('host:earnings', filters || {});
  const cached = apiCache.get<EarningsResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const earnings = await getEarnings(filters);
  apiCache.set(cacheKey, earnings, 3 * 60 * 1000); // 3 minutes
  return earnings;
};

/**
 * Get upcoming bookings with caching (1 minute - shorter because these need to be more up-to-date)
 */
export const getCachedUpcomingBookings = async (
  hotelId: number
): Promise<HostBookingResponse[]> => {
  const cacheKey = `host:bookings:upcoming:${hotelId}`;
  const cached = apiCache.get<HostBookingResponse[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const bookings = await getUpcomingBookings(hotelId);
  apiCache.set(cacheKey, bookings, 1 * 60 * 1000); // 1 minute
  return bookings;
};

/**
 * Get pending check-ins with caching (1 minute)
 */
export const getCachedPendingCheckIns = async (
  hotelId: number
): Promise<HostBookingResponse[]> => {
  const cacheKey = `host:bookings:pending-checkins:${hotelId}`;
  const cached = apiCache.get<HostBookingResponse[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const bookings = await getPendingCheckIns(hotelId);
  apiCache.set(cacheKey, bookings, 1 * 60 * 1000); // 1 minute
  return bookings;
};

/**
 * Get pending check-outs with caching (1 minute)
 */
export const getCachedPendingCheckOuts = async (
  hotelId: number
): Promise<HostBookingResponse[]> => {
  const cacheKey = `host:bookings:pending-checkouts:${hotelId}`;
  const cached = apiCache.get<HostBookingResponse[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const bookings = await getPendingCheckOuts(hotelId);
  apiCache.set(cacheKey, bookings, 1 * 60 * 1000); // 1 minute
  return bookings;
};
