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

// Admin Operations
export interface UserListResponse {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'HOST';
  enabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
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

export const uploadAvatar = async (file: File): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const sendVerificationEmail = async (email: string): Promise<void> => {
  await api.post('/auth/send-verification-email', { email });
};

export const verifyEmail = async (token: string): Promise<void> => {
  await api.post('/auth/verify-email', { token });
};

export const getAllUsers = async (): Promise<UserListResponse[]> => {
  const response = await api.get<UserListResponse[]>('/admin/users');
  return response.data || [];
};

export const toggleUserStatus = async (userId: number): Promise<void> => {
  await api.patch(`/admin/users/${userId}/toggle-status`);
};

export const changeUserRole = async (
  userId: number,
  role: 'CUSTOMER' | 'ADMIN' | 'HOST'
): Promise<void> => {
  await api.patch(`/admin/users/${userId}/change-role`, { role });
};

export const deleteUser = async (userId: number): Promise<void> => {
  await api.delete(`/admin/users/${userId}`);
};

export const getUserById = async (userId: number): Promise<UserProfile> => {
  const response = await api.get<{ success: boolean; data: UserProfile }>(
    `/admin/users/${userId}`
  );
  return response.data.data;
};
