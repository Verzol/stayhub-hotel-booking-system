import api from './api';

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  role: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  emailVerified?: boolean;
}

export interface UpdateProfileRequest {
  fullName: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmationPassword: string;
}

export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<UserProfile> => {
  const response = await api.put('/users/me', data);
  return response.data;
};

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<void> => {
  await api.patch('/users/change-password', data);
};

export const sendVerificationEmail = async (email: string): Promise<void> => {
  await api.post('/auth/send-verification-email', { email });
};

export const verifyEmail = async (token: string): Promise<void> => {
  await api.post('/auth/verify-email', { token });
};
