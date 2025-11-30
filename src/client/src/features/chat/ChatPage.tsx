import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getConversation,
  sendMessage,
  markConversationAsRead,
  checkConversationUpdate,
  type Message,
} from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Send,
  Loader2,
  Check,
  CheckCheck,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAvatarUrl } from '../../utils/userUtils';

export default function ChatPage() {
  const { otherUserId } = useParams<{ otherUserId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<number | null>(null);
  const otherUserIdNum = otherUserId ? parseInt(otherUserId, 10) : null;

  const fetchConversation = useCallback(async () => {
    if (!otherUserIdNum || !user?.id) return;
    try {
      const data = await getConversation(otherUserIdNum);
      setMessages(data);
      // Store last message ID for polling
      if (data.length > 0) {
        lastMessageIdRef.current = data[data.length - 1].id;
        await markConversationAsRead(otherUserIdNum);
      } else {
        lastMessageIdRef.current = null;
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      // Don't show toast on every poll, only on initial load
      if (loading) {
        toast.error('Không thể tải cuộc trò chuyện');
      }
    } finally {
      setLoading(false);
    }
  }, [otherUserIdNum, user?.id, loading]);

  // Initial load
  useEffect(() => {
    if (otherUserIdNum && user?.id) {
      fetchConversation();
    }
  }, [otherUserIdNum, user?.id, fetchConversation]);

  // Real-time: polling when tab is active + check when tab becomes visible
  useEffect(() => {
    if (!otherUserIdNum || !user?.id) return;

    let pollingInterval: NodeJS.Timeout | null = null;

    const checkForUpdates = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const update = await checkConversationUpdate(
          otherUserIdNum,
          lastMessageIdRef.current || undefined
        );
        if (update.hasUpdate) {
          await fetchConversation();
        }
      } catch (error) {
        console.error('Failed to check conversation update:', error);
      }
    };

    const startPolling = () => {
      if (pollingInterval) return;
      pollingInterval = setInterval(checkForUpdates, 3000); // Check every 3 seconds when tab is active
    };

    const stopPolling = () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
    };

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates(); // Check immediately
        startPolling(); // Start polling
      } else {
        stopPolling(); // Stop when hidden to save resources
      }
    };

    // Start polling if tab is already visible
    if (document.visibilityState === 'visible') {
      startPolling();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [otherUserIdNum, user?.id, fetchConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !otherUserIdNum || sending) return;

    const textToSend = messageText.trim();
    setMessageText('');

    try {
      setSending(true);
      const newMessage = await sendMessage({
        receiverId: otherUserIdNum,
        content: textToSend,
      });

      // Optimistically add message to UI
      setMessages((prev) => {
        // Check if message already exists
        if (prev.some((m) => m.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });

      // Update last message ID
      lastMessageIdRef.current = newMessage.id;

      // After sending, reload conversation to get latest messages (in case receiver also sent)
      setTimeout(() => {
        fetchConversation();
      }, 1000); // Reload after 1 second
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Không thể gửi tin nhắn');
      setMessageText(textToSend); // Restore message text
    } finally {
      setSending(false);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!otherUserIdNum) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-dark/60 mb-4">Không tìm thấy người dùng</p>
          <button
            onClick={() => navigate(-1)}
            className="text-brand-accent hover:underline"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Get other user info from messages
  const otherUser = messages[0]
    ? messages[0].senderId === otherUserIdNum
      ? {
          id: otherUserIdNum,
          name: messages[0].senderName,
          avatar: messages[0].senderAvatar,
        }
      : {
          id: otherUserIdNum,
          name: messages[0].receiverName,
          avatar: messages[0].receiverAvatar,
        }
    : null;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200/80 shadow-sm px-4 py-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            {otherUser && (
              <>
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-accent to-brand-dark flex items-center justify-center text-white font-semibold shadow-md overflow-hidden ring-2 ring-white">
                  {otherUser.avatar ? (
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    otherUser.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-lg font-bold text-slate-900">
                    {otherUser.name}
                  </h1>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Đang hoạt động
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-4 py-6 space-y-3 scroll-smooth"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 transparent',
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-brand-accent" />
            </div>
          ) : messages.length > 0 ? (
            messages.map((message, index) => {
              const isOwn = message.senderId === user?.id;
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showAvatar =
                !prevMessage || prevMessage.senderId !== message.senderId;
              const timeGroup = prevMessage
                ? new Date(message.createdAt).getTime() -
                    new Date(prevMessage.createdAt).getTime() >
                  300000 // 5 minutes
                : true;

              return (
                <div key={message.id}>
                  {timeGroup && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''} items-end ${
                      showAvatar ? 'mt-2' : 'mt-0.5'
                    }`}
                  >
                    {showAvatar ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent to-brand-dark flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 overflow-hidden ring-2 ring-white shadow-sm">
                        {isOwn ? (
                          user?.avatarUrl ? (
                            <img
                              src={getAvatarUrl(user)}
                              alt={user?.fullName || 'You'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user?.fullName?.charAt(0).toUpperCase() || 'Y'
                          )
                        ) : message.senderAvatar ? (
                          <img
                            src={message.senderAvatar}
                            alt={message.senderName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          message.senderName?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                    ) : (
                      <div className="w-8 flex-shrink-0" />
                    )}
                    <div
                      className={`flex-1 ${isOwn ? 'flex flex-col items-end' : ''} max-w-[70%]`}
                    >
                      {!isOwn && showAvatar && (
                        <span className="text-xs text-slate-600 mb-1 px-2 font-medium">
                          {message.senderName}
                        </span>
                      )}
                      <div
                        className={`inline-block rounded-2xl px-4 py-2.5 ${
                          isOwn
                            ? 'bg-brand-accent text-white rounded-br-md'
                            : 'bg-white text-slate-900 rounded-bl-md shadow-sm border border-slate-200'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 mt-0.5 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}
                      >
                        <span className="text-[10px] text-slate-500">
                          {new Date(message.createdAt).toLocaleTimeString(
                            'vi-VN',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </span>
                        {isOwn && (
                          <span className="flex items-center">
                            {message.isRead ? (
                              <CheckCheck className="w-3 h-3 text-blue-500" />
                            ) : (
                              <Check className="w-3 h-3 text-slate-400" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="font-medium">Chưa có tin nhắn nào</p>
                <p className="text-sm text-slate-400 mt-1">
                  Hãy bắt đầu cuộc trò chuyện!
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-white border-t border-slate-200 px-4 py-3 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-2.5 flex items-end">
              <textarea
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Nhập tin nhắn..."
                rows={1}
                className="flex-1 resize-none bg-transparent border-0 focus:outline-none text-slate-900 placeholder:text-slate-500 text-sm min-h-[20px] max-h-[100px]"
              />
            </div>
            <button
              type="submit"
              disabled={!messageText.trim() || sending}
              className="w-10 h-10 bg-brand-accent text-white rounded-full hover:bg-brand-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
