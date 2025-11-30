/**
 * Web Worker for dashboard stats calculations
 * Handles heavy calculations for dashboard overview statistics
 */

interface StatsCalculationTask {
  hotels: any[];
  bookings: any[];
}

interface StatsResult {
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

self.onmessage = function (
  event: MessageEvent<{
    taskId: string;
    type: 'calculate-stats';
    payload: StatsCalculationTask;
  }>
) {
  const { taskId, type, payload } = event.data;

  try {
    let result: StatsResult;

    switch (type) {
      case 'calculate-stats':
        result = calculateStats(payload);
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

function calculateStats(task: StatsCalculationTask): StatsResult {
  const { hotels, bookings } = task;

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

  // Total hotels and rooms
  const totalHotels = hotels.length;
  const totalRooms = hotels.reduce(
    (sum, hotel) => sum + (hotel.rooms?.length || 0),
    0
  );

  // Booking counts
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(
    (b) =>
      b.status === 'CONFIRMED' ||
      b.status === 'CHECKED_IN' ||
      b.status === 'COMPLETED'
  ).length;

  // Revenue calculations
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const totalRevenue = completedBookings.reduce(
    (sum, b) => sum + (parseFloat(b.totalPrice) || 0),
    0
  );

  // This month revenue
  const thisMonthBookings = completedBookings.filter((b) => {
    if (!b.checkedOutAt) return false;
    const checkoutDate = new Date(b.checkedOutAt);
    return checkoutDate >= startOfMonth;
  });
  const thisMonthRevenue = thisMonthBookings.reduce(
    (sum, b) => sum + (parseFloat(b.totalPrice) || 0),
    0
  );

  // Last month revenue
  const lastMonthBookings = completedBookings.filter((b) => {
    if (!b.checkedOutAt) return false;
    const checkoutDate = new Date(b.checkedOutAt);
    return checkoutDate >= startOfLastMonth && checkoutDate <= endOfLastMonth;
  });
  const lastMonthRevenue = lastMonthBookings.reduce(
    (sum, b) => sum + (parseFloat(b.totalPrice) || 0),
    0
  );

  // Upcoming bookings
  const upcomingCount = bookings.filter(
    (b) =>
      (b.status === 'CONFIRMED' || b.status === 'CHECKED_IN') &&
      new Date(b.checkInDate) >= new Date()
  ).length;

  // Pending check-ins
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pendingCheckIns = bookings.filter(
    (b) =>
      b.status === 'CONFIRMED' &&
      new Date(b.checkInDate).getTime() <= today.getTime()
  ).length;

  // Pending check-outs
  const pendingCheckOuts = bookings.filter(
    (b) =>
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
