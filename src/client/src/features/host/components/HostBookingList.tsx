import { type HostBookingResponse } from '../../../services/bookingService';
import { formatVND } from '../../../utils/currency';
import {
  Calendar,
  Users,
  Phone,
  Mail,
  LogIn,
  LogOut,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

interface HostBookingListProps {
  bookings: HostBookingResponse[];
  onCheckIn: (booking: HostBookingResponse) => void;
  onCheckOut: (booking: HostBookingResponse) => void;
}

export default function HostBookingList({
  bookings,
  onCheckIn,
  onCheckOut,
}: HostBookingListProps) {
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Chờ thanh toán
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Đã xác nhận
          </span>
        );
      case 'CHECKED_IN':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
            <LogIn className="w-3 h-3" />
            Đã nhận phòng
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold flex items-center gap-1">
            <LogOut className="w-3 h-3" />
            Đã trả phòng
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-black text-slate-900">
                  #{booking.id} - {booking.roomName}
                </h3>
                {getStatusBadge(booking.status)}
              </div>

              {booking.guestName && (
                <p className="text-slate-700 font-bold">
                  Khách: {booking.guestName}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Dates */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Thời gian</p>
                <p className="font-bold text-slate-900">
                  {formatDate(booking.checkInDate)}
                </p>
                <p className="text-sm text-slate-600">
                  → {formatDate(booking.checkOutDate)}
                </p>
              </div>
            </div>

            {/* Guests */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Số khách</p>
                <p className="font-bold text-slate-900">
                  {booking.guests} người
                </p>
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs text-slate-500 mb-1">Tổng tiền</p>
              <p className="font-black text-lg text-brand-cta">
                {formatVND(booking.totalPrice)}
              </p>
            </div>
          </div>

          {/* Guest Contact Info */}
          {(booking.guestEmail || booking.guestPhone) && (
            <div className="flex items-center gap-4 mb-4 pt-4 border-t border-slate-100">
              {booking.guestEmail && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span>{booking.guestEmail}</span>
                </div>
              )}
              {booking.guestPhone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span>{booking.guestPhone}</span>
                </div>
              )}
            </div>
          )}

          {/* Timestamps */}
          {(booking.checkedInAt || booking.checkedOutAt) && (
            <div className="mb-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                {booking.checkedInAt && (
                  <div className="flex items-center gap-1">
                    <LogIn className="w-3 h-3" />
                    <span>
                      Check-in:{' '}
                      {new Date(booking.checkedInAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
                {booking.checkedOutAt && (
                  <div className="flex items-center gap-1">
                    <LogOut className="w-3 h-3" />
                    <span>
                      Check-out:{' '}
                      {new Date(booking.checkedOutAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            {booking.status === 'CONFIRMED' && (
              <button
                onClick={() => onCheckIn(booking)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Check-in
              </button>
            )}
            {booking.status === 'CHECKED_IN' && (
              <button
                onClick={() => onCheckOut(booking)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Check-out
              </button>
            )}
            {booking.note && (
              <div className="flex-1 text-sm text-slate-600">
                <span className="font-bold">Ghi chú:</span> {booking.note}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
