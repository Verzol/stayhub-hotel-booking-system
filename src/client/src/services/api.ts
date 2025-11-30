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
    // Handle empty response (like ResponseEntity<Void>)
    if (
      !response.data ||
      (typeof response.data === 'object' &&
        Object.keys(response.data).length === 0)
    ) {
      return response;
    }

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
        // Don't show toast here - let the calling code handle it to avoid duplicate notifications
        const msg = apiResponse.message || 'Đã xảy ra lỗi';
        return Promise.reject(new Error(msg));
      }
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      let errorMessage = 'Đã xảy ra lỗi không mong muốn';

      // Extract error message from response
      if (error.response.data) {
        // Handle ApiResponse structure
        if (
          typeof error.response.data === 'object' &&
          'success' in error.response.data &&
          !error.response.data.success &&
          'message' in error.response.data
        ) {
          errorMessage = error.response.data.message || errorMessage;
        } else if (
          typeof error.response.data === 'object' &&
          'message' in error.response.data
        ) {
          errorMessage = error.response.data.message || errorMessage;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      }

      // Handle specific status codes
      // Only show toast for system errors (500, network) - let components handle business errors
      switch (status) {
        case 400:
          // Don't show toast for 400 - let the calling code handle it
          break;
        case 401:
          // Don't show toast for 401 - let the calling code handle it
          break;
        case 403:
          // Don't show toast for 403 - let the calling code handle it
          break;
        case 500:
          toast.error('Lỗi máy chủ. Vui lòng thử lại sau.');
          break;
        default:
          // Only show toast for unexpected errors (not business logic errors)
          // Components should handle 4xx errors with appropriate messages
          break;
      }

      // Return error with message for handling in calling code
      const friendlyMessage = errorMessage || 'Đã xảy ra lỗi';
      return Promise.reject(new Error(friendlyMessage));
    } else {
      // Network error
      const networkError =
        'Mất kết nối. Vui lòng kiểm tra kết nối internet của bạn.';
      toast.error(networkError);
      return Promise.reject(new Error(networkError));
    }
  }
);

export default api;
