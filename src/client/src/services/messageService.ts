import api from './api';

export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  receiverId: number;
  receiverName: string;
  receiverAvatar?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface SendMessageRequest {
  receiverId: number;
  content: string;
}

export async function sendMessage(
  request: SendMessageRequest
): Promise<Message> {
  const response = await api.post<Message>('/v1/messages', request);
  return response.data;
}

export async function getConversation(otherUserId: number): Promise<Message[]> {
  const response = await api.get<Message[]>(
    `/v1/messages/conversation/${otherUserId}`
  );
  return response.data;
}

export async function markAsRead(messageId: number): Promise<void> {
  await api.put(`/v1/messages/${messageId}/read`);
}

export async function markConversationAsRead(
  otherUserId: number
): Promise<void> {
  await api.put(`/v1/messages/conversation/${otherUserId}/read`);
}

export async function getUnreadCount(): Promise<number> {
  const response = await api.get<number>('/v1/messages/unread-count');
  return response.data;
}

export async function getConversationPartners(): Promise<number[]> {
  const response = await api.get<number[]>('/v1/messages/conversations');
  return response.data;
}

export interface CheckConversationUpdateResponse {
  hasUpdate: boolean;
  unreadCount: number;
  lastMessageId: number | null;
}

export async function checkConversationUpdate(
  otherUserId: number,
  lastMessageId?: number
): Promise<CheckConversationUpdateResponse> {
  const params = lastMessageId ? `?lastMessageId=${lastMessageId}` : '';
  const response = await api.get<CheckConversationUpdateResponse>(
    `/v1/messages/conversation/${otherUserId}/check-update${params}`
  );
  return response.data;
}
