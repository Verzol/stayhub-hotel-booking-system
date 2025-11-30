import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getConversationPartners,
  getConversation,
  getUnreadCount,
  type Message,
} from '../../services/messageService';
import { MessageCircle, Loader2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ConversationPartner {
  userId: number;
  userName: string;
  userAvatar?: string;
  lastMessage?: Message;
  unreadCount: number;
}

export default function ChatListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchTotalUnread = async () => {
    try {
      const count = await getUnreadCount();
      setTotalUnread(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const partnerIds = await getConversationPartners();

      const conversationsData = await Promise.all(
        partnerIds.map(async (partnerId) => {
          const messages = await getConversation(partnerId);
          const lastMessage =
            messages.length > 0 ? messages[messages.length - 1] : undefined;

          const unreadCount = messages.filter(
            (msg) => !msg.isRead && msg.receiverId === user?.id
          ).length;

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
  }, [user?.id]);

  useEffect(() => {
    fetchConversations();
    fetchTotalUnread();
    // No automatic polling - only refresh when user navigates to this page
  }, [fetchConversations]);

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

  const filteredConversations = conversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-bg via-white to-brand-bg/50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 shadow-sm px-4 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                Tin nhắn
              </h1>
              {totalUnread > 0 && (
                <p className="text-xs text-slate-500">
                  {totalUnread} tin nhắn chưa đọc
                </p>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 border-0 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white text-slate-900 placeholder:text-slate-500 text-sm transition-all"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto bg-white">
          {filteredConversations.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.userId}
                  onClick={() => navigate(`/chat/${conversation.userId}`)}
                  className="w-full p-4 hover:bg-slate-50 transition-colors text-left flex items-center gap-3 group relative"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-accent to-brand-dark flex items-center justify-center text-white font-semibold text-lg overflow-hidden ring-2 ring-white shadow-sm">
                      {conversation.userAvatar ? (
                        <img
                          src={conversation.userAvatar}
                          alt={conversation.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        conversation.userName?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    {/* Online status dot - you can add this later if needed */}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-slate-900 text-base truncate">
                        {conversation.userName}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      {conversation.lastMessage ? (
                        <p className="text-sm text-slate-600 truncate flex-1">
                          {conversation.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400 italic">
                          Chưa có tin nhắn
                        </p>
                      )}
                      {conversation.unreadCount > 0 && (
                        <div className="min-w-[20px] h-5 bg-brand-accent text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 flex-shrink-0">
                          {conversation.unreadCount > 99
                            ? '99+'
                            : conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-4">
                <MessageCircle className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium mb-1 text-lg">
                  {searchQuery
                    ? 'Không tìm thấy cuộc trò chuyện nào'
                    : 'Chưa có tin nhắn nào'}
                </p>
                {!searchQuery && (
                  <p className="text-sm text-slate-400 max-w-sm mx-auto">
                    Bắt đầu trò chuyện với chủ khách sạn từ trang chi tiết khách
                    sạn
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
