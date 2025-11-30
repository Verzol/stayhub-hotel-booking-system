/**
 * Promotion Service - Public promotions
 */

import api from './api';

export interface PublicPromotion {
  id: number;
  code: string;
  discountPercent: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  maxUsage: number;
  currentUsage: number;
  hotelId: number;
  hotelName: string;
  hotelCity: string;
  hotelAddress: string;
  hotelStarRating: number;
  hotelThumbnailUrl?: string;
}

/**
 * Get all active promotions (public endpoint)
 * GET /api/public/promotions
 */
export async function getActivePromotions(): Promise<PublicPromotion[]> {
  const response = await api.get<PublicPromotion[]>('/public/promotions');
  return response.data;
}
