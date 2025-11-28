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
  amenityIds: number[];
  images?: string[];
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
  amenityIds: number[];
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
