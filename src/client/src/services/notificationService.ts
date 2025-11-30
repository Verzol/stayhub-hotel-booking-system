import api from './api';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string; // BOOKING, CHAT, SYSTEM
  relatedUserId?: number; // For CHAT type: senderId
  isRead: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<Notification[]> {
  const response = await api.get<Notification[]>('/v1/notifications');
  return response.data;
}

export async function getUnreadCount(): Promise<number> {
  const response = await api.get<number>('/v1/notifications/unread-count');
  return response.data;
}

export async function markAsRead(notificationId: number): Promise<void> {
  await api.put(`/v1/notifications/${notificationId}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await api.put('/v1/notifications/read-all');
}

export interface CheckUpdateResponse {
  hasUpdate: boolean;
  unreadCount: number;
  lastNotificationTime: string | null;
}

export async function checkUpdate(): Promise<CheckUpdateResponse> {
  const response = await api.get<CheckUpdateResponse>(
    '/v1/notifications/check-update'
  );
  return response.data;
}
