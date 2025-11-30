import api from './api';

export interface BookingRequest {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  couponCode?: string;
  note?: string;
}

export interface BookingResponse {
  id: number;
  roomId: number;
  roomName?: string;
  hotelId?: number;
  hotelName?: string;
  roomImage?: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalPrice: number;
  status: string;
  lockedUntil?: string;
  couponCode?: string;
  note?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  // New fields for enhanced booking management
  checkedInAt?: string;
  checkedOutAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  refundAmount?: number;
  cancellationPolicy?: string;
  cancellationPolicyDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PriceCalculationResponse {
  originalPrice: number;
  discountAmount: number;
  serviceFee: number;
  finalPrice: number;
  appliedCouponCode?: string;
}

export const calculatePrice = async (data: Partial<BookingRequest>) => {
  const response = await api.post<PriceCalculationResponse>(
    '/bookings/preview',
    data
  );
  return response.data;
};

export const createBooking = async (data: BookingRequest) => {
  const response = await api.post<BookingResponse>('/bookings', data);
  return response.data;
};

export const getBooking = async (id: number) => {
  const response = await api.get<BookingResponse>(`/bookings/${id}`);
  return response.data;
};

export const createPaymentUrl = async (bookingId: number) => {
  const response = await api.get<string>(
    `/payment/create_url?bookingId=${bookingId}`
  );
  return response.data;
};

export const confirmBooking = async (bookingId: number) => {
  const response = await api.post(`/bookings/${bookingId}/confirm`);
  // Endpoint returns ResponseEntity<Void> which may have empty body
  return response.data || {};
};

export const getMyBookings = async () => {
  const response = await api.get<BookingResponse[]>('/bookings/my-bookings');
  return response.data;
};

// Cancellation
export interface CancellationRequest {
  reason?: string;
}

export interface CancellationResponse {
  bookingId: number;
  status: string;
  totalPrice: number;
  refundAmount: number;
  cancellationFee: number;
  cancellationPolicy: string;
  cancellationPolicyDescription: string;
  cancelledAt: string;
  message: string;
}

export const cancelBooking = async (
  bookingId: number,
  data?: CancellationRequest
) => {
  const response = await api.post<CancellationResponse>(
    `/bookings/${bookingId}/cancel`,
    data || {}
  );
  return response.data;
};

// Download Invoice
export const downloadInvoice = async (bookingId: number) => {
  const response = await api.get(`/bookings/${bookingId}/invoice`, {
    responseType: 'blob', // Important for downloading files
  });

  // Create blob URL and trigger download
  const blob = new Blob([response.data], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `invoice_${bookingId}.html`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Host Booking Management
export interface HostBookingResponse {
  id: number;
  userId: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  roomId: number;
  roomName?: string;
  hotelId?: number;
  hotelName?: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalPrice: number;
  status: string;
  note?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  refundAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HostBookingFilters {
  hotelId: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const getHostBookings = async (filters: HostBookingFilters) => {
  const params = new URLSearchParams();
  params.append('hotelId', filters.hotelId.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const response = await api.get<HostBookingResponse[]>(
    `/host/bookings?${params.toString()}`
  );
  return response.data;
};

export const getUpcomingBookings = async (hotelId: number) => {
  const response = await api.get<HostBookingResponse[]>(
    `/host/bookings/${hotelId}/upcoming`
  );
  return response.data;
};

export const getPendingCheckIns = async (hotelId: number) => {
  const response = await api.get<HostBookingResponse[]>(
    `/host/bookings/${hotelId}/pending-checkins`
  );
  return response.data;
};

export const getPendingCheckOuts = async (hotelId: number) => {
  const response = await api.get<HostBookingResponse[]>(
    `/host/bookings/${hotelId}/pending-checkouts`
  );
  return response.data;
};

export const checkInGuest = async (bookingId: number, hotelId: number) => {
  const response = await api.post(
    `/host/bookings/${bookingId}/checkin?hotelId=${hotelId}`
  );
  return response.data;
};

export const checkOutGuest = async (bookingId: number, hotelId: number) => {
  const response = await api.post(
    `/host/bookings/${bookingId}/checkout?hotelId=${hotelId}`
  );
  return response.data;
};

/**
 * Get all bookings for all hotels owned by the host (optimized for dashboard)
 * Single request instead of multiple requests per hotel
 */
export const getAllHostBookings = async (): Promise<HostBookingResponse[]> => {
  const response = await api.get<HostBookingResponse[]>('/host/bookings/all');
  return response.data;
};

// Analytics
export interface AnalyticsResponse {
  revenue: number;
  bookingsCount: number;
  occupancyRate: number;
  cancellationRate: number;
  avgBookingValue: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
  statusDistribution: Record<string, number>;
}

export interface AnalyticsFilters {
  hotelId?: number;
  startDate?: string;
  endDate?: string;
}

export const getAnalytics = async (
  filters?: AnalyticsFilters
): Promise<AnalyticsResponse> => {
  const params = new URLSearchParams();
  if (filters?.hotelId) params.append('hotelId', filters.hotelId.toString());
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const response = await api.get<AnalyticsResponse>(
    `/host/bookings/analytics${params.toString() ? `?${params.toString()}` : ''}`
  );
  return response.data;
};

// Earnings
export interface EarningsResponse {
  totalEarnings: number;
  completedCount: number;
  avgBookingValue: number;
  earningsByHotel: Record<number, number>;
  earningsByMonth: Array<{
    monthKey: string;
    monthName: string;
    earnings: number;
  }>;
  recentTransactions: Array<{
    bookingId: number;
    hotelName: string;
    guestName: string;
    checkoutDate: string;
    amount: number;
  }>;
}

export interface EarningsFilters {
  hotelId?: number;
  startDate?: string;
  endDate?: string;
}

export const getEarnings = async (
  filters?: EarningsFilters
): Promise<EarningsResponse> => {
  const params = new URLSearchParams();
  if (filters?.hotelId) params.append('hotelId', filters.hotelId.toString());
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const response = await api.get<EarningsResponse>(
    `/host/bookings/earnings${params.toString() ? `?${params.toString()}` : ''}`
  );
  return response.data;
};
