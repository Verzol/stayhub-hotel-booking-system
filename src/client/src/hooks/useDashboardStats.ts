/**
 * React Hook for Dashboard Stats Calculation using Web Worker
 */

import { useState, useEffect, useCallback } from 'react';
import { calculateDashboardStatsInWorker } from '../utils/workerUtils';
import type { Hotel } from '../types/host';
import type { BookingResponse } from '../services/bookingService';

interface UseDashboardStatsOptions {
  enabled?: boolean;
  onError?: (error: Error) => void;
}

interface DashboardStats {
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
}

/**
 * Hook for calculating dashboard stats using Web Worker
 */
export function useDashboardStats(
  hotels: Hotel[],
  bookings: BookingResponse[],
  options: UseDashboardStatsOptions = {}
) {
  const { enabled = true, onError } = options;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = useCallback(() => {
    if (!enabled || (hotels.length === 0 && bookings.length === 0)) {
      setStats(null);
      return;
    }

    // Only use worker for large datasets (more than 100 bookings or 20 hotels)
    const shouldUseWorker = bookings.length > 100 || hotels.length > 20;

    if (!shouldUseWorker) {
      // Calculate synchronously for small datasets
      const result = calculateStatsSync(hotels, bookings);
      setStats(result);
      return;
    }

    // Use worker for large datasets
    setLoading(true);

    calculateDashboardStatsInWorker(hotels, bookings)
      .then((result) => {
        setStats(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Dashboard stats calculation error:', error);
        onError?.(error);
        // Fallback to sync calculation
        const result = calculateStatsSync(hotels, bookings);
        setStats(result);
        setLoading(false);
      });
  }, [hotels, bookings, enabled, onError]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    calculate();
  }, [calculate]);

  return { stats, loading, refetch: calculate };
}

/**
 * Synchronous stats calculation (fallback for small datasets)
 */
function calculateStatsSync(
  hotels: Hotel[],
  bookings: BookingResponse[]
): DashboardStats {
  if (hotels.length === 0 && bookings.length === 0) {
    return {
      totalHotels: 0,
      totalRooms: 0,
      totalBookings: 0,
      confirmedBookings: 0,
      totalRevenue: 0,
      upcomingBookings: 0,
      pendingCheckIns: 0,
      pendingCheckOuts: 0,
      thisMonthRevenue: 0,
      lastMonthRevenue: 0,
    };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const totalHotels = hotels.length;
  const totalRooms = hotels.reduce(
    (sum: number, hotel: Hotel) => sum + (hotel.rooms?.length || 0),
    0
  );

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(
    (b: BookingResponse) =>
      b.status === 'CONFIRMED' ||
      b.status === 'CHECKED_IN' ||
      b.status === 'COMPLETED'
  ).length;

  const completedBookings = bookings.filter(
    (b: BookingResponse) => b.status === 'COMPLETED'
  );
  const totalRevenue = completedBookings.reduce(
    (sum: number, b: BookingResponse) => sum + (Number(b.totalPrice) || 0),
    0
  );

  const thisMonthBookings = completedBookings.filter((b: BookingResponse) => {
    if (!b.checkedOutAt) return false;
    const checkoutDate = new Date(b.checkedOutAt);
    return checkoutDate >= startOfMonth;
  });
  const thisMonthRevenue = thisMonthBookings.reduce(
    (sum: number, b: BookingResponse) => sum + (Number(b.totalPrice) || 0),
    0
  );

  const lastMonthBookings = completedBookings.filter((b: BookingResponse) => {
    if (!b.checkedOutAt) return false;
    const checkoutDate = new Date(b.checkedOutAt);
    return checkoutDate >= startOfLastMonth && checkoutDate <= endOfLastMonth;
  });
  const lastMonthRevenue = lastMonthBookings.reduce(
    (sum: number, b: BookingResponse) => sum + (Number(b.totalPrice) || 0),
    0
  );

  const upcomingCount = bookings.filter(
    (b: BookingResponse) =>
      (b.status === 'CONFIRMED' || b.status === 'CHECKED_IN') &&
      new Date(b.checkInDate) >= new Date()
  ).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pendingCheckIns = bookings.filter(
    (b: BookingResponse) =>
      b.status === 'CONFIRMED' &&
      new Date(b.checkInDate).getTime() <= today.getTime()
  ).length;

  const pendingCheckOuts = bookings.filter(
    (b: BookingResponse) =>
      b.status === 'CHECKED_IN' &&
      new Date(b.checkOutDate).getTime() <= today.getTime()
  ).length;

  return {
    totalHotels,
    totalRooms,
    totalBookings,
    confirmedBookings,
    totalRevenue,
    upcomingBookings: upcomingCount,
    pendingCheckIns,
    pendingCheckOuts,
    thisMonthRevenue,
    lastMonthRevenue,
  };
}
