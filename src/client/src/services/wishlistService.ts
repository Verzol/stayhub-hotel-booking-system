import api from './api';

export interface Wishlist {
  id: number;
  userId: number;
  hotelId: number;
  createdAt: string;
}

export const getMyWishlist = async () => {
  const response = await api.get<Wishlist[]>('/wishlist');
  return response.data;
};

export const toggleWishlist = async (hotelId: number) => {
  const response = await api.post<string>(`/wishlist/${hotelId}`);
  return response.data;
};
