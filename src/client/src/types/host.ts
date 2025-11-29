export interface HotelImage {
  id: number;
  url: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
}

export interface Hotel {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  starRating: number;
  checkInTime: string;
  checkOutTime: string;
  policies: string;
  amenities: Amenity[];
  images?: HotelImage[];
  rooms?: Room[];
}

export interface HotelDTO {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  starRating: number;
  checkInTime: string;
  checkOutTime: string;
  policies: string;
  amenityIds: number[];
}

export interface RoomImage {
  id: number;
  url: string;
  thumbnailUrl?: string;
}

export interface Room {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  bedConfig: string;
  quantity: number;
  amenities: Amenity[];
  images?: RoomImage[];
}

export interface RoomDTO {
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  bedConfig: string;
  quantity: number;
  amenityIds: number[];
}

export interface RoomAvailability {
  date: string;
  isAvailable: boolean;
  customPrice?: number;
}

export interface Promotion {
  id: number;
  code: string;
  discountPercent: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  maxUsage: number;
  isActive: boolean;
}

export interface PromotionDTO {
  code: string;
  discountPercent: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  maxUsage: number;
  isActive: boolean;
}

export interface Amenity {
  id: number;
  name: string;
  icon?: string;
  category?: string;
}
