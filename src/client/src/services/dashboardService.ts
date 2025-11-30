/**
 * Dashboard Service - Optimized for fast dashboard loading
 */

import api from './api';

export interface DashboardSummaryResponse {
  totalHotels: number;
  totalRooms: number;
  totalBookings: number;
  confirmedBookings: number;
  upcomingBookings: number;
  pendingCheckIns: number;
  pendingCheckOuts: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueChangePercent: number;
  recentBookings: RecentBooking[];
}

export interface RecentBooking {
  id: number;
  roomName: string;
  hotelName: string;
  guestName: string;
  checkInDate: string;
  totalPrice: number;
  status: string;
}

/**
 * Get dashboard summary - all stats in one optimized request
 * GET /api/host/dashboard/summary
 */
export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  const response = await api.get<DashboardSummaryResponse>(
    '/host/dashboard/summary'
  );
  return response.data;
}

/**
 * Get recent bookings separately (for lazy/progressive loading)
 * GET /api/host/dashboard/recent-bookings
 * Can be called after initial dashboard load
 */
export async function getRecentBookings(): Promise<RecentBooking[]> {
  const response = await api.get<RecentBooking[]>(
    '/host/dashboard/recent-bookings'
  );
  return response.data;
}
