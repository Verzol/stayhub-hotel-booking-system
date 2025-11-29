import api from './api';
import type { Hotel } from '../types/host';

export interface SearchParams {
  query?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  stars?: number[];
  amenities?: number[];
  sort?: string;
  page?: number;
  size?: number;
}

export interface SearchResponse {
  content: Hotel[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const searchHotels = async (params: SearchParams) => {
  const response = await api.get<SearchResponse>('/public/hotels/search', {
    params: {
      ...params,
      stars: params.stars?.join(','),
      amenities: params.amenities?.join(','),
      sortBy: params.sort,
    },
  });
  return response.data;
};

export const getHotelDetails = async (id: number) => {
  const response = await api.get<Hotel>(`/public/hotels/${id}`);
  return response.data;
};

/**
 * Get location suggestions for autocomplete
 */
export const getLocationSuggestions = async (
  query: string = '',
  limit: number = 10
): Promise<string[]> => {
  const response = await api.get<string[]>('/public/hotels/suggestions', {
    params: { query, limit },
  });
  return response.data;
};
