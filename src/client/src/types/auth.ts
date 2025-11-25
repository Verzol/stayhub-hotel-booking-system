export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'ADMIN' | 'HOST';
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
}

export interface AuthResponse {
  token: string;
  fullName: string;
  role: 'CUSTOMER' | 'ADMIN' | 'HOST';
  id: number;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'ADMIN' | 'HOST';
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface LoginRequest {
  email: string;
  password: string;
}
