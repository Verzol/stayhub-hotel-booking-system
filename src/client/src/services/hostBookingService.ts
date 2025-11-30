import api from './api';

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

export interface HostBookingsFilter {
  hotelId: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Get all bookings for a hotel
export const getHostBookings = async (filter: HostBookingsFilter) => {
  const params = new URLSearchParams({
    hotelId: filter.hotelId.toString(),
  });

  if (filter.status) {
    params.append('status', filter.status);
  }

  if (filter.startDate) {
    params.append('startDate', filter.startDate);
  }

  if (filter.endDate) {
    params.append('endDate', filter.endDate);
  }

  const response = await api.get<HostBookingResponse[]>(
    `/host/bookings?${params.toString()}`
  );
  return response.data;
};

// Get upcoming bookings
export const getUpcomingBookings = async (hotelId: number) => {
  const response = await api.get<HostBookingResponse[]>(
    `/host/bookings/${hotelId}/upcoming`
  );
  return response.data;
};

// Get pending check-ins
export const getPendingCheckIns = async (hotelId: number) => {
  const response = await api.get<HostBookingResponse[]>(
    `/host/bookings/${hotelId}/pending-checkins`
  );
  return response.data;
};

// Get pending check-outs
export const getPendingCheckOuts = async (hotelId: number) => {
  const response = await api.get<HostBookingResponse[]>(
    `/host/bookings/${hotelId}/pending-checkouts`
  );
  return response.data;
};

// Check-in guest
export const checkInGuest = async (bookingId: number, hotelId: number) => {
  const response = await api.post(
    `/host/bookings/${bookingId}/checkin?hotelId=${hotelId}`
  );
  return response.data;
};

// Check-out guest
export const checkOutGuest = async (bookingId: number, hotelId: number) => {
  const response = await api.post(
    `/host/bookings/${bookingId}/checkout?hotelId=${hotelId}`
  );
  return response.data;
};
