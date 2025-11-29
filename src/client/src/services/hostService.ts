import api from './api';
import type {
  Hotel,
  HotelDTO,
  Room,
  RoomDTO,
  RoomAvailability,
  Promotion,
  PromotionDTO,
  Amenity,
} from '../types/host';

// Hotel Management
export const createHotel = async (data: HotelDTO): Promise<Hotel> => {
  const response = await api.post<Hotel>('/host/hotels', data);
  return response.data;
};

export const updateHotel = async (
  id: number,
  data: HotelDTO
): Promise<Hotel> => {
  const response = await api.put<Hotel>(`/host/hotels/${id}`, data);
  return response.data;
};

export const getMyHotels = async (): Promise<Hotel[]> => {
  const response = await api.get<Hotel[]>('/host/hotels');
  return response.data;
};

export const uploadHotelImages = async (
  id: number,
  formData: FormData
): Promise<void> => {
  await api.post(`/host/hotels/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadRoomImages = async (
  roomId: number,
  formData: FormData
): Promise<void> => {
  await api.post(`/host/rooms/${roomId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Room Management
export const createRoom = async (
  hotelId: number,
  data: RoomDTO
): Promise<Room> => {
  const response = await api.post<Room>(`/host/hotels/${hotelId}/rooms`, data);
  return response.data;
};

export const updateRoom = async (id: number, data: RoomDTO): Promise<Room> => {
  const response = await api.put<Room>(`/host/rooms/${id}`, data);
  return response.data;
};

export const getHotelRooms = async (hotelId: number): Promise<Room[]> => {
  const response = await api.get<Room[]>(`/host/hotels/${hotelId}/rooms`);
  return response.data;
};

// Availability Calendar
export const getRoomAvailability = async (
  roomId: number,
  start: string,
  end: string
): Promise<RoomAvailability[]> => {
  const response = await api.get<RoomAvailability[]>(
    `/host/rooms/${roomId}/availability`,
    { params: { start, end } }
  );
  return response.data;
};

export const updateRoomAvailability = async (
  roomId: number,
  date: string,
  isAvailable: boolean,
  customPrice?: number
): Promise<void> => {
  await api.post(`/host/rooms/${roomId}/availability`, {
    date,
    isAvailable,
    customPrice,
  });
};

// Promotions
export const createPromotion = async (
  hotelId: number,
  data: PromotionDTO
): Promise<Promotion> => {
  const response = await api.post<Promotion>(
    `/host/hotels/${hotelId}/promotions`,
    data
  );
  return response.data;
};

export const getHotelPromotions = async (
  hotelId: number
): Promise<Promotion[]> => {
  const response = await api.get<Promotion[]>(
    `/host/hotels/${hotelId}/promotions`
  );
  return response.data;
};

export const updatePromotion = async (
  id: number,
  data: PromotionDTO
): Promise<Promotion> => {
  const response = await api.put<Promotion>(
    `/host/hotels/promotions/${id}`,
    data
  );
  return response.data;
};

export const togglePromotion = async (id: number): Promise<void> => {
  await api.patch(`/host/hotels/promotions/${id}/toggle`);
};

// Amenities
export const getAmenities = async (): Promise<Amenity[]> => {
  const response = await api.get<Amenity[]>('/v1/amenities');
  return response.data;
};
