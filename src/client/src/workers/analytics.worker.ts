/**
 * Web Worker for analytics calculations
 * Handles heavy calculations for analytics and earnings
 */

interface AnalyticsTask {
  bookings: any[];
  type: 'analytics' | 'earnings' | 'revenue';
  filters?: {
    startDate?: string;
    endDate?: string;
    hotelId?: number;
  };
}

interface AnalyticsResult {
  revenue: number;
  bookingsCount: number;
  averageBookingValue: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  bookingsByStatus: Record<string, number>;
}

interface EarningsResult {
  totalEarnings: number;
  completedCount: number;
  averageBookingValue: number;
  earningsByHotel: Record<string, number>;
  earningsByMonth: Array<{ month: string; earnings: number }>;
}

self.onmessage = function (
  event: MessageEvent<{
    taskId: string;
    type: 'analytics' | 'earnings' | 'revenue';
    payload: AnalyticsTask;
  }>
) {
  const { taskId, type, payload } = event.data;

  try {
    let result: AnalyticsResult | EarningsResult | number;

    switch (type) {
      case 'analytics':
        result = calculateAnalytics(payload);
        break;
      case 'earnings':
        result = calculateEarnings(payload);
        break;
      case 'revenue':
        result = calculateRevenue(payload);
        break;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }

    self.postMessage({ taskId, result });
  } catch (error) {
    self.postMessage({
      taskId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

function calculateAnalytics(task: AnalyticsTask): AnalyticsResult {
  const { bookings, filters } = task;

  // Filter bookings if filters provided
  let filteredBookings = [...bookings];
  if (filters) {
    if (filters.startDate || filters.endDate) {
      filteredBookings = filteredBookings.filter((booking) => {
        const bookingDate = new Date(booking.checkInDate || booking.createdAt);
        if (filters.startDate && bookingDate < new Date(filters.startDate)) {
          return false;
        }
        if (filters.endDate && bookingDate > new Date(filters.endDate)) {
          return false;
        }
        return true;
      });
    }

    if (filters.hotelId) {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.hotelId === filters.hotelId
      );
    }
  }

  // Calculate revenue (only from completed bookings)
  const completedBookings = filteredBookings.filter(
    (b) => b.status === 'COMPLETED'
  );
  const revenue = completedBookings.reduce(
    (sum, booking) => sum + (parseFloat(booking.totalPrice) || 0),
    0
  );

  // Count bookings
  const bookingsCount = filteredBookings.length;

  // Average booking value
  const averageBookingValue =
    completedBookings.length > 0 ? revenue / completedBookings.length : 0;

  // Revenue by month
  const revenueByMonthMap = new Map<string, number>();
  completedBookings.forEach((booking) => {
    const date = new Date(booking.checkInDate || booking.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = revenueByMonthMap.get(monthKey) || 0;
    revenueByMonthMap.set(
      monthKey,
      current + (parseFloat(booking.totalPrice) || 0)
    );
  });

  const revenueByMonth = Array.from(revenueByMonthMap.entries()).map(
    ([month, revenue]) => ({
      month,
      revenue,
    })
  );

  // Bookings by status
  const bookingsByStatus: Record<string, number> = {};
  filteredBookings.forEach((booking) => {
    const status = booking.status || 'UNKNOWN';
    bookingsByStatus[status] = (bookingsByStatus[status] || 0) + 1;
  });

  return {
    revenue,
    bookingsCount,
    averageBookingValue,
    revenueByMonth,
    bookingsByStatus,
  };
}

function calculateEarnings(task: AnalyticsTask): EarningsResult {
  const { bookings, filters } = task;

  // Filter bookings
  let filteredBookings = [...bookings];
  if (filters) {
    if (filters.startDate || filters.endDate) {
      filteredBookings = filteredBookings.filter((booking) => {
        const bookingDate = new Date(booking.checkOutDate || booking.createdAt);
        if (filters.startDate && bookingDate < new Date(filters.startDate)) {
          return false;
        }
        if (filters.endDate && bookingDate > new Date(filters.endDate)) {
          return false;
        }
        return true;
      });
    }
  }

  // Only completed bookings count for earnings
  const completedBookings = filteredBookings.filter(
    (b) => b.status === 'COMPLETED'
  );

  // Total earnings
  const totalEarnings = completedBookings.reduce(
    (sum, booking) => sum + (parseFloat(booking.totalPrice) || 0),
    0
  );

  // Average booking value
  const averageBookingValue =
    completedBookings.length > 0 ? totalEarnings / completedBookings.length : 0;

  // Earnings by hotel
  const earningsByHotel: Record<string, number> = {};
  completedBookings.forEach((booking) => {
    const hotelName = booking.hotelName || `Hotel ${booking.hotelId}`;
    earningsByHotel[hotelName] =
      (earningsByHotel[hotelName] || 0) + (parseFloat(booking.totalPrice) || 0);
  });

  // Earnings by month
  const earningsByMonthMap = new Map<string, number>();
  completedBookings.forEach((booking) => {
    const date = new Date(booking.checkOutDate || booking.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = earningsByMonthMap.get(monthKey) || 0;
    earningsByMonthMap.set(
      monthKey,
      current + (parseFloat(booking.totalPrice) || 0)
    );
  });

  const earningsByMonth = Array.from(earningsByMonthMap.entries()).map(
    ([monthKey, earnings]) => ({
      month: monthKey,
      earnings,
    })
  );

  return {
    totalEarnings,
    completedCount: completedBookings.length,
    averageBookingValue,
    earningsByHotel,
    earningsByMonth,
  };
}

function calculateRevenue(task: AnalyticsTask): number {
  const { bookings, filters } = task;

  let filteredBookings = [...bookings];
  if (filters) {
    if (filters.startDate || filters.endDate) {
      filteredBookings = filteredBookings.filter((booking) => {
        const bookingDate = new Date(booking.checkInDate || booking.createdAt);
        if (filters.startDate && bookingDate < new Date(filters.startDate)) {
          return false;
        }
        if (filters.endDate && bookingDate > new Date(filters.endDate)) {
          return false;
        }
        return true;
      });
    }
  }

  const completedBookings = filteredBookings.filter(
    (b) => b.status === 'COMPLETED'
  );

  return completedBookings.reduce(
    (sum, booking) => sum + (parseFloat(booking.totalPrice) || 0),
    0
  );
}
