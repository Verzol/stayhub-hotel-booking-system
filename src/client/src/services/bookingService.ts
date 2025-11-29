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
