import api from './api';
import type { Hotel } from '../types/host';
import { apiCache, generateCacheKey } from '../utils/apiCache';

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

/**
 * Optimized Hotel DTO for search results (from backend)
 * Only includes essential fields to reduce response size
 */
export interface HotelSearchDTO {
  id: number;
  name: string;
  description: string;
  city: string;
  country: string;
  address: string;
  starRating: number;
  latitude: number;
  longitude: number;
  thumbnailUrl: string | null;
  minPrice: number | null;
  roomCount: number;
}

/**
 * Convert HotelSearchDTO to Hotel format for frontend compatibility
 */
function mapSearchDTOToHotel(dto: HotelSearchDTO): Hotel {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    city: dto.city,
    country: dto.country,
    address: dto.address,
    latitude: dto.latitude,
    longitude: dto.longitude,
    starRating: dto.starRating,
    checkInTime: '', // Not in search DTO
    checkOutTime: '', // Not in search DTO
    policies: '', // Not in search DTO
    amenities: [], // Not in search DTO
    images: dto.thumbnailUrl
      ? [
          {
            id: 0,
            url: dto.thumbnailUrl,
            thumbnailUrl: dto.thumbnailUrl,
            isPrimary: true,
          },
        ]
      : [],
    rooms: dto.minPrice
      ? [
          {
            id: 0,
            name: '',
            description: '',
            basePrice: dto.minPrice,
            capacity: 0,
            area: 0,
            bedrooms: 0,
            bathrooms: 0,
            bedConfig: '',
            quantity: 0,
            amenities: [],
          },
        ]
      : [],
  };
}

export interface SearchResponse {
  content: Hotel[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

/**
 * Search hotels with caching (3 minutes - search results change frequently)
 */
export const searchHotels = async (
  params: SearchParams
): Promise<SearchResponse> => {
  // Generate cache key from search parameters
  const cacheKey = generateCacheKey('search:hotels', {
    query: params.query || '',
    checkIn: params.checkIn || '',
    checkOut: params.checkOut || '',
    guests: params.guests || '',
    minPrice: params.minPrice || '',
    maxPrice: params.maxPrice || '',
    stars: params.stars?.join(',') || '',
    amenities: params.amenities?.join(',') || '',
    sort: params.sort || '',
    page: params.page || 0,
    size: params.size || 10,
  });

  // Check cache first
  const cached = apiCache.get<SearchResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch fresh data - backend now returns HotelSearchDTO[]
  const response = await api.get<{
    content: HotelSearchDTO[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }>('/public/hotels/search', {
    params: {
      ...params,
      stars: params.stars?.join(','),
      amenities: params.amenities?.join(','),
      sortBy: params.sort,
    },
  });

  // Map DTOs to Hotel format for frontend compatibility
  const mappedData: SearchResponse = {
    content: response.data.content.map(mapSearchDTOToHotel),
    totalPages: response.data.totalPages,
    totalElements: response.data.totalElements,
    size: response.data.size,
    number: response.data.number,
  };

  // Cache the result (3 minutes - shorter than hotels cache because search is more dynamic)
  apiCache.set(cacheKey, mappedData, 3 * 60 * 1000);

  return mappedData;
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
