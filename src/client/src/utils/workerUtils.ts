/**
 * Utilities for using Web Workers
 * Provides easy-to-use functions for common worker tasks
 */

import WorkerPool from '../workers/workerPool';

// Worker pools - lazy loaded
let dataFilterPool: WorkerPool | null = null;
let searchPool: WorkerPool | null = null;
let analyticsPool: WorkerPool | null = null;

// Initialize worker pools
let statsPool: WorkerPool | null = null;

function getDataFilterPool(): WorkerPool {
  if (!dataFilterPool) {
    dataFilterPool = new WorkerPool('./dataFilter.worker.ts', 4);
  }
  return dataFilterPool;
}

function getSearchPool(): WorkerPool {
  if (!searchPool) {
    searchPool = new WorkerPool('./search.worker.ts', 4);
  }
  return searchPool;
}

function getAnalyticsPool(): WorkerPool {
  if (!analyticsPool) {
    analyticsPool = new WorkerPool('./analytics.worker.ts', 2);
  }
  return analyticsPool;
}

function getStatsPool(): WorkerPool {
  if (!statsPool) {
    statsPool = new WorkerPool('./stats.worker.ts', 2);
  }
  return statsPool;
}

/**
 * Filter and sort data using Web Worker
 */
export async function filterAndSortData<T = any>(
  data: T[],
  options: {
    searchTerm?: string;
    filters?: Record<string, any>;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<T[]> {
  const pool = getDataFilterPool();

  return pool.execute<T[]>({
    type: 'filter',
    payload: {
      data,
      filters: options,
    },
  });
}

/**
 * Sort data using Web Worker
 */
export async function sortData<T = any>(
  data: T[],
  sortBy: string,
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<T[]> {
  const pool = getDataFilterPool();

  return pool.execute<T[]>({
    type: 'sort',
    payload: {
      data,
      sortBy,
      sortOrder,
    },
  });
}

/**
 * Search items using Web Worker
 */
export async function searchItems<T = any>(
  items: T[],
  searchTerm: string,
  searchFields: string[]
): Promise<T[]> {
  const pool = getDataFilterPool();

  return pool.execute<T[]>({
    type: 'search',
    payload: {
      items,
      searchTerm,
      searchFields,
    },
  });
}

/**
 * Filter hotels using Web Worker
 */
export async function filterHotels(
  hotels: any[],
  filters: {
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    stars?: number[];
    amenities?: number[];
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }
): Promise<{ hotels: any[]; count: number; matchedFields: string[] }> {
  const pool = getSearchPool();

  return pool.execute({
    type: 'filter',
    payload: {
      hotels,
      filters,
    },
  });
}

/**
 * Calculate analytics using Web Worker
 */
export async function calculateAnalyticsInWorker(
  bookings: any[],
  filters?: {
    startDate?: string;
    endDate?: string;
    hotelId?: number;
  }
): Promise<{
  revenue: number;
  bookingsCount: number;
  averageBookingValue: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  bookingsByStatus: Record<string, number>;
}> {
  const pool = getAnalyticsPool();

  return pool.execute({
    type: 'analytics',
    payload: {
      bookings,
      type: 'analytics',
      filters,
    },
  });
}

/**
 * Calculate earnings using Web Worker
 */
export async function calculateEarningsInWorker(
  bookings: any[],
  filters?: {
    startDate?: string;
    endDate?: string;
    hotelId?: number;
  }
): Promise<{
  totalEarnings: number;
  completedCount: number;
  averageBookingValue: number;
  earningsByHotel: Record<string, number>;
  earningsByMonth: Array<{ month: string; earnings: number }>;
}> {
  const pool = getAnalyticsPool();

  return pool.execute({
    type: 'earnings',
    payload: {
      bookings,
      type: 'earnings',
      filters,
    },
  });
}

/**
 * Calculate dashboard stats using Web Worker
 */
export async function calculateDashboardStatsInWorker(
  hotels: any[],
  bookings: any[]
): Promise<{
  totalHotels: number;
  totalRooms: number;
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  upcomingBookings: number;
  pendingCheckIns: number;
  pendingCheckOuts: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
}> {
  const pool = getStatsPool();

  return pool.execute({
    type: 'calculate-stats',
    payload: {
      hotels,
      bookings,
    },
  });
}

/**
 * Cleanup all worker pools (call when app unmounts)
 */
export function cleanupWorkers() {
  if (dataFilterPool) {
    dataFilterPool.terminate();
    dataFilterPool = null;
  }
  if (searchPool) {
    searchPool.terminate();
    searchPool = null;
  }
  if (analyticsPool) {
    analyticsPool.terminate();
    analyticsPool = null;
  }
  if (statsPool) {
    statsPool.terminate();
    statsPool = null;
  }
}

/**
 * Get worker pool status (for debugging)
 */
export function getWorkerStatus() {
  return {
    dataFilter: dataFilterPool?.getStatus() || null,
    search: searchPool?.getStatus() || null,
    analytics: analyticsPool?.getStatus() || null,
    stats: statsPool?.getStatus() || null,
  };
}
