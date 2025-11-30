import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type Notification,
} from '../../services/notificationService';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

interface NotificationBellProps {
  showScrolledStyle?: boolean;
}

export default function NotificationBell({
  showScrolledStyle = false,
}: NotificationBellProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (): Promise<Notification[]> => {
    if (!user?.id) return [];
    try {
      const data = await getNotifications();
      setNotifications(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }, [user?.id]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [user?.id]);

  // Initial load - only fetch unread count
  useEffect(() => {
    if (user?.id) {
      // Async setState in effect is acceptable for initial data loading
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUnreadCount();
    }
  }, [user?.id, fetchUnreadCount]);

  // Fetch notifications when dropdown opens (via click handler, not effect)
  const handleToggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Fetch notifications when opening
    if (newIsOpen && user?.id) {
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Không thể đánh dấu tất cả là đã đọc');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggleDropdown}
        className={`relative p-2 rounded-full transition-colors ${
          showScrolledStyle ? 'hover:bg-brand-dark/5' : 'hover:bg-white/10'
        }`}
        aria-label="Notifications"
      >
        <Bell
          className={`w-6 h-6 ${showScrolledStyle ? 'text-brand-dark' : 'text-white'}`}
        />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-brand-dark/10 z-50 max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-brand-dark/10 flex items-center justify-between">
            <h3 className="font-bold text-brand-dark">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-brand-accent hover:underline"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-brand-dark/60">
                Chưa có thông báo nào
              </div>
            ) : (
              <div className="divide-y divide-brand-dark/5">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-brand-dark/5 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => {
                      // Mark as read if not read
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id);
                      }

                      // Navigate to chat if it's a CHAT notification with relatedUserId
                      if (
                        notification.type === 'CHAT' &&
                        notification.relatedUserId
                      ) {
                        setIsOpen(false);
                        navigate(`/chat/${notification.relatedUserId}`);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold text-sm ${
                            !notification.isRead
                              ? 'text-brand-dark'
                              : 'text-brand-dark/70'
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-brand-dark/60 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-brand-dark/40 mt-2">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-brand-accent rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
