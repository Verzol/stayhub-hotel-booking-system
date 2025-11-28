import api from './api';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../types/auth';

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const register = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const checkEmail = async (
  email: string
): Promise<{ exists: boolean }> => {
  const response = await api.post('/auth/check-email', { email });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const forgotPassword = async (email: string): Promise<string> => {
  const response = await api.post<string>('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<string> => {
  const response = await api.post<string>('/auth/reset-password', {
    email,
    otp,
    newPassword,
  });
  return response.data;
};

export const verifyEmail = async (
  email: string,
  otp: string
): Promise<string> => {
  const response = await api.post<string>('/auth/verify-email', {
    email,
    otp,
  });
  return response.data;
};

export const resendVerificationEmail = async (
  email: string
): Promise<string> => {
  const response = await api.post<string>('/auth/send-verification-email', {
    email,
  });
  return response.data;
};
