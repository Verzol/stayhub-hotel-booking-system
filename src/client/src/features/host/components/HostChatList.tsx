import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getConversationPartners,
  getConversation,
  type Message,
} from '../../../services/messageService';
import { MessageCircle, Loader2 } from 'lucide-react';

interface ConversationPartner {
  userId: number;
  userName: string;
  userAvatar?: string;
  lastMessage?: Message;
  unreadCount: number;
}

export default function HostChatList() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      // Get list of user IDs that have conversations with the host
      const partnerIds = await getConversationPartners();

      // For each partner, get the last message and user info
      const conversationsData = await Promise.all(
        partnerIds.map(async (partnerId) => {
          // Get conversation to get last message and user info
          const messages = await getConversation(partnerId);
          const lastMessage =
            messages.length > 0 ? messages[messages.length - 1] : undefined;

          // Count unread messages in this conversation
          const unreadCount = messages.filter(
            (msg) => !msg.isRead && msg.senderId === partnerId
          ).length;

          // Get user info from last message or first message
          const userMessage = lastMessage || messages[0];
          const userName = userMessage
            ? userMessage.senderId === partnerId
              ? userMessage.senderName
              : userMessage.receiverName
            : `User ${partnerId}`;
          const userAvatar = userMessage
            ? userMessage.senderId === partnerId
              ? userMessage.senderAvatar
              : userMessage.receiverAvatar
            : undefined;

          return {
            userId: partnerId,
            userName,
            userAvatar,
            lastMessage,
            unreadCount,
          };
        })
      );

      // Sort by last message time (most recent first)
      conversationsData.sort((a, b) => {
        if (!a.lastMessage && !b.lastMessage) return 0;
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return (
          new Date(b.lastMessage.createdAt).getTime() -
          new Date(a.lastMessage.createdAt).getTime()
        );
      });

      setConversations(conversationsData);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-brand-dark mb-2">Tin nhắn</h2>
        <p className="text-brand-dark/60">Quản lý tin nhắn với khách hàng</p>
      </div>

      {/* Conversations List */}
      {conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.userId}
              onClick={() => navigate(`/chat/${conversation.userId}`)}
              className="w-full p-4 bg-white rounded-2xl border border-brand-dark/10 hover:border-brand-accent hover:shadow-lg transition-all text-left flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-accent to-brand-dark flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                {conversation.userAvatar ? (
                  <img
                    src={conversation.userAvatar}
                    alt={conversation.userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  conversation.userName?.charAt(0) || 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-brand-dark truncate">
                    {conversation.userName}
                  </h3>
                  {conversation.lastMessage && (
                    <span className="text-xs text-brand-dark/50 flex-shrink-0 ml-2">
                      {formatTime(conversation.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                {conversation.lastMessage && (
                  <p className="text-sm text-brand-dark/60 truncate">
                    {conversation.lastMessage.content}
                  </p>
                )}
              </div>
              {conversation.unreadCount > 0 && (
                <div className="w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {conversation.unreadCount > 9
                    ? '9+'
                    : conversation.unreadCount}
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-brand-dark/10">
          <MessageCircle className="w-16 h-16 text-brand-dark/20 mx-auto mb-4" />
          <p className="text-brand-dark/60 font-medium mb-2">
            Chưa có tin nhắn nào
          </p>
          <p className="text-sm text-brand-dark/40">
            Khách hàng sẽ có thể nhắn tin với bạn từ trang chi tiết khách sạn
          </p>
        </div>
      )}
    </div>
  );
}
