import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// Define the standard API response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: number;
}

// Get API base URL from environment variable or use default
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check if the response follows our ApiResponse structure
    const data = response.data as ApiResponse | unknown;

    if (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      typeof (data as ApiResponse).success === 'boolean'
    ) {
      const apiResponse = data as ApiResponse;

      if (apiResponse.success) {
        // Unwrap the data so the calling service gets the actual payload
        response.data = apiResponse.data;
        return response;
      } else {
        // Business logic error (success = false)
        const msg = apiResponse.message || 'Something went wrong';
        toast.error(msg);
        return Promise.reject(new Error(msg));
      }
    }
    return response;
  },
  (error) => {
    const errorMessage =
      error.response?.data?.message || 'An unexpected error occurred';

    if (error.response) {
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Don't show toast for 401 - let the calling code handle it
          // This allows login page to show custom error message
          break;
        case 403:
          toast.error('Access denied.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          // If the error response follows our ApiResponse structure
          if (
            error.response.data &&
            typeof error.response.data === 'object' &&
            'success' in error.response.data
          ) {
            toast.error(error.response.data.message || errorMessage);
          } else {
            toast.error(errorMessage);
          }
      }

      // Create a more user-friendly error message for 401
      if (error.response.status === 401) {
        const friendlyMessage =
          error.response.data?.message ||
          'Invalid email or password. Please try again.';
        return Promise.reject(new Error(friendlyMessage));
      }
    } else {
      // Network error
      toast.error('Connection lost. Please check your internet.');
    }

    return Promise.reject(error);
  }
);

export default api;
