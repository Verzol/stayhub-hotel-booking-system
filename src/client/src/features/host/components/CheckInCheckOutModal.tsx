import { type HostBookingResponse } from '../../../services/bookingService';
import { X, LogIn, LogOut, Calendar, Users, AlertCircle } from 'lucide-react';

interface CheckInCheckOutModalProps {
  booking: HostBookingResponse;
  type: 'checkin' | 'checkout';
  onClose: () => void;
  onConfirm: () => void;
}

export default function CheckInCheckOutModal({
  booking,
  type,
  onClose,
  onConfirm,
}: CheckInCheckOutModalProps) {
  const isCheckIn = type === 'checkin';

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isCheckIn ? (
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <LogIn className="w-6 h-6 text-blue-600" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <LogOut className="w-6 h-6 text-green-600" />
              </div>
            )}
            <h3 className="text-2xl font-black text-slate-900">
              {isCheckIn ? 'Check-in Khách' : 'Check-out Khách'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {/* Booking Info */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Mã đặt phòng</p>
              <p className="font-black text-lg text-slate-900">#{booking.id}</p>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div className="text-sm">
                <p className="font-bold text-slate-900">
                  {new Date(booking.checkInDate).toLocaleDateString('vi-VN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
                <p className="text-slate-500">→</p>
                <p className="font-bold text-slate-900">
                  {new Date(booking.checkOutDate).toLocaleDateString('vi-VN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-bold text-slate-900">
                {booking.guests} {booking.guests === 1 ? 'khách' : 'khách'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Phòng</p>
              <p className="font-bold text-slate-900">{booking.roomName}</p>
            </div>
          </div>

          {/* Guest Info */}
          {booking.guestName && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Khách hàng</p>
              <p className="font-bold text-slate-900">{booking.guestName}</p>
              {booking.guestPhone && (
                <p className="text-sm text-slate-600 mt-1">
                  {booking.guestPhone}
                </p>
              )}
            </div>
          )}

          {/* Warning/Info */}
          <div
            className={`p-4 rounded-xl border ${
              isCheckIn
                ? 'bg-blue-50 border-blue-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  isCheckIn ? 'text-blue-600' : 'text-green-600'
                }`}
              />
              <div>
                <p
                  className={`text-sm font-bold mb-1 ${
                    isCheckIn ? 'text-blue-900' : 'text-green-900'
                  }`}
                >
                  {isCheckIn ? 'Xác nhận check-in' : 'Xác nhận check-out'}
                </p>
                <p
                  className={`text-sm ${
                    isCheckIn ? 'text-blue-700' : 'text-green-700'
                  }`}
                >
                  {isCheckIn
                    ? 'Khách sẽ được đánh dấu là đã nhận phòng. Trạng thái đặt phòng sẽ chuyển sang "Đã nhận phòng".'
                    : 'Khách sẽ được đánh dấu là đã trả phòng. Trạng thái đặt phòng sẽ chuyển sang "Hoàn thành".'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 font-bold rounded-xl transition-colors text-white ${
              isCheckIn
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isCheckIn ? 'Xác nhận check-in' : 'Xác nhận check-out'}
          </button>
        </div>
      </div>
    </div>
  );
}
