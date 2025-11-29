import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getBooking,
  type BookingResponse,
} from '../../services/bookingService';
import {
  Calendar,
  Users,
  CreditCard,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatVND } from '../../utils/currency';

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getBooking(Number(id));
        setBooking(data);
      } catch (error: unknown) {
        console.error('Failed to load booking', error);
        toast.error('Không thể tải chi tiết đặt phòng');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            ĐÃ XÁC NHẬN
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            CHỜ THANH TOÁN
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            ĐÃ HỦY
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

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Không tìm thấy đặt phòng
          </h2>
          <p className="text-slate-500 mb-4">
            Đặt phòng bạn đang tìm không tồn tại.
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-brand-accent font-bold hover:underline"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Quay lại</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">
                Chi tiết đặt phòng
              </h1>
              <p className="text-slate-500">Mã đặt phòng: #{booking.id}</p>
            </div>
            {getStatusBadge(booking.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room & Hotel Info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Chi tiết chỗ nghỉ
              </h2>

              {booking.roomImage && (
                <div className="mb-4 rounded-2xl overflow-hidden">
                  <img
                    src={
                      booking.roomImage.startsWith('http')
                        ? booking.roomImage
                        : `http://localhost:8080${booking.roomImage}`
                    }
                    alt={booking.roomName || 'Room'}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                {booking.hotelName && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Khách sạn</p>
                    <p className="font-bold text-lg text-slate-900">
                      {booking.hotelName}
                    </p>
                    {booking.hotelId && (
                      <button
                        onClick={() => navigate(`/hotels/${booking.hotelId}`)}
                        className="text-sm text-brand-accent hover:underline mt-1"
                      >
                        Xem chi tiết khách sạn
                      </button>
                    )}
                  </div>
                )}

                {booking.roomName && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Phòng</p>
                    <p className="font-bold text-slate-900">
                      {booking.roomName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Dates & Guests */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Chi tiết lưu trú
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Nhận phòng</p>
                    <p className="font-bold text-slate-900">
                      {new Date(booking.checkInDate).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Trả phòng</p>
                    <p className="font-bold text-slate-900">
                      {new Date(booking.checkOutDate).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-brand-accent" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Khách</p>
                  <p className="font-bold text-slate-900">
                    {booking.guests} {booking.guests === 1 ? 'Khách' : 'Khách'}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-slate-500 mb-1">Thời gian</p>
                  <p className="font-bold text-slate-900">
                    {nights} {nights === 1 ? 'Đêm' : 'Đêm'}
                  </p>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            {(booking.guestName ||
              booking.guestEmail ||
              booking.guestPhone) && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Thông tin khách hàng
                </h2>

                <div className="space-y-3">
                  {booking.guestName && (
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Họ và tên</p>
                        <p className="font-bold text-slate-900">
                          {booking.guestName}
                        </p>
                      </div>
                    </div>
                  )}

                  {booking.guestEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="font-bold text-slate-900">
                          {booking.guestEmail}
                        </p>
                      </div>
                    </div>
                  )}

                  {booking.guestPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Số điện thoại</p>
                        <p className="font-bold text-slate-900">
                          {booking.guestPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {booking.note && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Yêu cầu đặc biệt
                </h2>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {booking.note}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Tóm tắt giá
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Giá mỗi đêm</span>
                  <span>
                    {booking.totalPrice && nights > 0
                      ? formatVND(Math.round(booking.totalPrice / nights))
                      : formatVND(booking.totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Đêm</span>
                  <span>{nights}</span>
                </div>
                {booking.couponCode && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá ({booking.couponCode})</span>
                    <span>-</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-lg text-slate-900">
                  Tổng cộng
                </span>
                <span className="text-2xl font-black text-brand-cta">
                  {formatVND(booking.totalPrice)}
                </span>
              </div>

              {booking.status === 'PENDING' && booking.lockedUntil && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Đặt phòng của bạn được giữ đến{' '}
                    {new Date(booking.lockedUntil).toLocaleString('vi-VN')}. Vui
                    lòng hoàn tất thanh toán để xác nhận.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Về trang chủ
          </button>
          {booking.hotelId && (
            <button
              onClick={() => navigate(`/hotels/${booking.hotelId}`)}
              className="px-8 py-3 bg-brand-accent text-white font-bold rounded-xl hover:bg-brand-accent/90 transition-colors"
            >
              Xem khách sạn
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
