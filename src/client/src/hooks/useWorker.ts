/**
 * React Hook for Web Workers
 * Provides easy integration of Web Workers in React components
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  filterAndSortData,
  sortData,
  searchItems,
  filterHotels,
  calculateAnalyticsInWorker,
  calculateEarningsInWorker,
  cleanupWorkers,
} from '../utils/workerUtils';

interface UseWorkerOptions {
  enabled?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Hook for filtering and sorting data using Web Worker
 */
export function useWorkerFilter<T = unknown>(
  data: T[],
  options: {
    searchTerm?: string;
    filters?: Record<string, unknown>;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } & UseWorkerOptions
) {
  const { enabled = true, onError, ...filterOptions } = options;
  const [filtered, setFiltered] = useState<T[]>(data);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const filterOptionsKey = useMemo(
    () => JSON.stringify(filterOptions),
    [filterOptions]
  );

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFiltered(data);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);

    filterAndSortData(data, filterOptions)
      .then((result) => {
        setFiltered(result);
        setLoading(false);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Worker filter error:', error);
          onError?.(error);
          setFiltered(data); // Fallback to original data
        }
        setLoading(false);
      });

    return () => {
      // Cleanup on unmount
    };
  }, [data, enabled, filterOptionsKey, onError, filterOptions]);

  return { filtered, loading };
}

/**
 * Hook for sorting data using Web Worker
 */
export function useWorkerSort<T = unknown>(
  data: T[],
  sortBy: string,
  sortOrder: 'asc' | 'desc' = 'asc',
  options: UseWorkerOptions = {}
) {
  const { enabled = true, onError } = options;
  const [sorted, setSorted] = useState<T[]>(data);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !sortBy) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSorted(data);
      return;
    }

    setLoading(true);

    sortData(data, sortBy, sortOrder)
      .then((result) => {
        setSorted(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Worker sort error:', error);
        onError?.(error);
        setSorted(data); // Fallback to original data
        setLoading(false);
      });
  }, [data, sortBy, sortOrder, enabled, onError]);

  return { sorted, loading };
}

/**
 * Hook for searching items using Web Worker
 */
export function useWorkerSearch<T = unknown>(
  items: T[],
  searchTerm: string,
  searchFields: string[],
  options: UseWorkerOptions = {}
) {
  const { enabled = true, onError } = options;
  const [results, setResults] = useState<T[]>(items);
  const [loading, setLoading] = useState(false);

  const searchFieldsKey = useMemo(
    () => JSON.stringify(searchFields),
    [searchFields]
  );

  useEffect(() => {
    if (!enabled || !searchTerm || searchFields.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults(items);
      return;
    }

    setLoading(true);

    searchItems(items, searchTerm, searchFields)
      .then((result) => {
        setResults(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Worker search error:', error);
        onError?.(error);
        setResults(items); // Fallback to all items
        setLoading(false);
      });
  }, [items, searchTerm, searchFieldsKey, enabled, onError, searchFields]);

  return { results, loading };
}

/**
 * Hook for filtering hotels using Web Worker
 */
export function useHotelFilter(
  hotels: unknown[],
  filters: {
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    stars?: number[];
    amenities?: number[];
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  },
  options: UseWorkerOptions = {}
) {
  const { enabled = true, onError } = options;
  const [filtered, setFiltered] = useState<{
    hotels: unknown[];
    count: number;
    matchedFields: string[];
  }>({
    hotels,
    count: hotels.length,
    matchedFields: [],
  });
  const [loading, setLoading] = useState(false);

  const filter = useCallback(() => {
    if (!enabled) {
      setFiltered({
        hotels,
        count: hotels.length,
        matchedFields: [],
      });
      return;
    }

    setLoading(true);

    filterHotels(hotels, filters)
      .then((result) => {
        setFiltered(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Hotel filter error:', error);
        onError?.(error);
        setFiltered({
          hotels,
          count: hotels.length,
          matchedFields: [],
        });
        setLoading(false);
      });
  }, [hotels, enabled, onError, filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    filter();
  }, [filter]);

  return {
    filtered: filtered.hotels,
    count: filtered.count,
    loading,
    refetch: filter,
  };
}

/**
 * Hook for calculating analytics using Web Worker
 */
export function useWorkerAnalytics(
  bookings: unknown[],
  filters?: {
    startDate?: string;
    endDate?: string;
    hotelId?: number;
  },
  options: UseWorkerOptions = {}
) {
  const { enabled = true, onError } = options;
  const [analytics, setAnalytics] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const calculate = useCallback(() => {
    if (!enabled || bookings.length === 0) {
      setAnalytics(null);
      return;
    }

    setLoading(true);

    calculateAnalyticsInWorker(bookings, filters)
      .then((result) => {
        setAnalytics(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Analytics calculation error:', error);
        onError?.(error);
        setAnalytics(null);
        setLoading(false);
      });
  }, [bookings, enabled, onError, filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    calculate();
  }, [calculate]);

  return { analytics, loading, refetch: calculate };
}

/**
 * Hook for calculating earnings using Web Worker
 */
export function useWorkerEarnings(
  bookings: unknown[],
  filters?: {
    startDate?: string;
    endDate?: string;
    hotelId?: number;
  },
  options: UseWorkerOptions = {}
) {
  const { enabled = true, onError } = options;
  const [earnings, setEarnings] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const calculate = useCallback(() => {
    if (!enabled || bookings.length === 0) {
      setEarnings(null);
      return;
    }

    setLoading(true);

    calculateEarningsInWorker(bookings, filters)
      .then((result) => {
        setEarnings(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Earnings calculation error:', error);
        onError?.(error);
        setEarnings(null);
        setLoading(false);
      });
  }, [bookings, enabled, onError, filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    calculate();
  }, [calculate]);

  return { earnings, loading, refetch: calculate };
}

/**
 * Cleanup workers on unmount
 */
export function useWorkerCleanup() {
  useEffect(() => {
    return () => {
      cleanupWorkers();
    };
  }, []);
}
