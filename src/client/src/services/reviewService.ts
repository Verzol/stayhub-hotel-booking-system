import api from './api';

export interface Review {
  id: number;
  bookingId: number;
  userId: number;
  hotelId: number;
  rating: number;
  comment?: string;
  images?: string; // JSON string of image URLs
  createdAt: string;
}

export interface CreateReviewRequest {
  bookingId: number;
  rating: number;
  comment?: string;
  photoUrls?: string[];
}

export async function uploadPhotos(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post<string[]>(
    '/v1/reviews/upload-photos',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

export async function createReview(
  request: CreateReviewRequest
): Promise<Review> {
  const response = await api.post<Review>('/v1/reviews', request);
  return response.data;
}

export async function getReviewsByHotel(hotelId: number): Promise<Review[]> {
  const response = await api.get<Review[]>(`/v1/reviews/hotel/${hotelId}`);
  return response.data;
}

export async function getReviewByBooking(bookingId: number): Promise<Review> {
  const response = await api.get<Review>(`/v1/reviews/booking/${bookingId}`);
  return response.data;
}
