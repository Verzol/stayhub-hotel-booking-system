import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getBooking,
  cancelBooking,
  downloadInvoice,
  type BookingResponse,
  type CancellationRequest,
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
  X,
  Download,
  LogIn,
  LogOut,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatVND } from '../../utils/currency';
import HotelImage from '../../components/common/HotelImage';

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      case 'CHECKED_IN':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
            <LogIn className="w-3 h-3" />
            ĐÃ NHẬN PHÒNG
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold flex items-center gap-1">
            <LogOut className="w-3 h-3" />
            ĐÃ TRẢ PHÒNG
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

  const handleCancelBooking = async () => {
    if (!booking) return;

    try {
      setCancelling(true);
      const request: CancellationRequest = cancelReason
        ? { reason: cancelReason }
        : {};

      const response = await cancelBooking(booking.id, request);

      toast.success(response.message || 'Đã hủy đặt phòng thành công');

      // Refresh booking details
      const data = await getBooking(Number(id));
      setBooking(data);

      setCancelModalOpen(false);
      setCancelReason('');
    } catch (error: unknown) {
      console.error('Failed to cancel booking', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Không thể hủy đặt phòng. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!booking) return;
    try {
      await downloadInvoice(booking.id);
      toast.success('Đang tải hóa đơn...');
    } catch (error) {
      console.error('Failed to download invoice', error);
      toast.error('Không thể tải hóa đơn. Vui lòng thử lại.');
    }
  };

  const canCancelBooking = (status: string) => {
    return ['PENDING', 'CONFIRMED'].includes(status.toUpperCase());
  };

  const canDownloadInvoice = (status: string) => {
    return ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'].includes(
      status.toUpperCase()
    );
  };

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
                  <HotelImage
                    src={booking.roomImage}
                    alt={booking.roomName || 'Room'}
                    className="w-full"
                    aspectRatio="16/9"
                    lazy={false}
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

              {booking.refundAmount && booking.refundAmount > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">Hoàn tiền</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatVND(booking.refundAmount)}
                    </span>
                  </div>
                </div>
              )}

              {booking.cancellationPolicyDescription && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-900 font-bold mb-1">
                    Chính sách hủy:
                  </p>
                  <p className="text-xs text-blue-700">
                    {booking.cancellationPolicyDescription}
                  </p>
                </div>
              )}

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

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {booking.status === 'COMPLETED' && (
                  <button
                    onClick={() => navigate(`/review/${booking.id}`)}
                    className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Star className="w-5 h-5" />
                    Đánh giá đặt phòng
                  </button>
                )}
                {canCancelBooking(booking.status) && (
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Hủy đặt phòng
                  </button>
                )}
                {canDownloadInvoice(booking.status) && (
                  <button
                    onClick={handleDownloadInvoice}
                    className="w-full px-6 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Tải hóa đơn
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation & Status Info */}
        {(booking.checkedInAt ||
          booking.checkedOutAt ||
          booking.cancelledAt) && (
          <div className="mt-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Thông tin trạng thái
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {booking.checkedInAt && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Đã nhận phòng lúc
                  </p>
                  <p className="font-bold text-slate-900">
                    {new Date(booking.checkedInAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
              {booking.checkedOutAt && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Đã trả phòng lúc
                  </p>
                  <p className="font-bold text-slate-900">
                    {new Date(booking.checkedOutAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
              {booking.cancelledAt && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Đã hủy lúc</p>
                  <p className="font-bold text-slate-900">
                    {new Date(booking.cancelledAt).toLocaleString('vi-VN')}
                  </p>
                  {booking.cancellationReason && (
                    <p className="text-sm text-slate-600 mt-1">
                      Lý do: {booking.cancellationReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center gap-4">
          <button
            onClick={() => navigate('/bookings')}
            className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Danh sách đặt phòng
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

      {/* Cancel Booking Modal */}
      {cancelModalOpen && booking && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setCancelModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-slate-900">
                Hủy đặt phòng
              </h3>
              <button
                onClick={() => setCancelModalOpen(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-slate-600 mb-4">
                Bạn có chắc chắn muốn hủy đặt phòng này không?
              </p>

              {booking.cancellationPolicyDescription && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-900 font-bold mb-1">
                    Chính sách hủy:
                  </p>
                  <p className="text-sm text-blue-700">
                    {booking.cancellationPolicyDescription}
                  </p>
                </div>
              )}

              <label className="block text-sm font-bold text-slate-700 mb-2">
                Lý do hủy (tùy chọn)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy đặt phòng..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelling}
                className="flex-1 px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang hủy...
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Xác nhận hủy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
