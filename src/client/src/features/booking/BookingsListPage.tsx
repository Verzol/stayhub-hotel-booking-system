import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMyBookings,
  cancelBooking,
  downloadInvoice,
  type BookingResponse,
  type CancellationRequest,
} from '../../services/bookingService';
import { useWorkerFilter, useWorkerCleanup } from '../../hooks/useWorker';
import {
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  ArrowRight,
  Search,
  Calendar as CalendarIcon,
  X,
  Download,
  LogIn,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import OptimizedImage from '../../components/common/OptimizedImage';
import { formatVND } from '../../utils/currency';

type BookingStatus =
  | 'ALL'
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED';

export default function BookingsListPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingResponse | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();
      setBookings(data || []);
    } catch (error) {
      console.error('Failed to load bookings', error);
      toast.error('Không thể tải danh sách đặt phòng của bạn');
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusLabel = (status: BookingStatus): string => {
    switch (status) {
      case 'ALL':
        return 'Tất cả';
      case 'PENDING':
        return 'Chờ thanh toán';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'CHECKED_IN':
        return 'Đã nhận phòng';
      case 'COMPLETED':
        return 'Đã trả phòng';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleCancelBooking = (
    booking: BookingResponse,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;

    try {
      setCancelling(true);
      const request: CancellationRequest = cancelReason
        ? { reason: cancelReason }
        : {};

      const response = await cancelBooking(selectedBooking.id, request);

      toast.success(response.message || 'Đã hủy đặt phòng thành công');

      // Refresh bookings list
      await fetchBookings();

      setCancelModalOpen(false);
      setSelectedBooking(null);
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

  const handleDownloadInvoice = async (
    bookingId: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await downloadInvoice(bookingId);
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

  // Use Web Worker for filtering and searching (for large datasets)
  const { filtered: filteredBookings, loading: filtering } = useWorkerFilter(
    bookings,
    {
      enabled: bookings.length > 50, // Only use worker for large datasets
      searchTerm: searchQuery,
      filters: {
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      },
      sortBy: 'checkInDate',
      sortOrder: 'desc',
    }
  );

  // Fallback to client-side filtering for smaller datasets
  const clientFilteredBookings = useMemo(() => {
    if (bookings.length <= 50) {
      return bookings
        .filter((booking) => {
          const matchesStatus =
            statusFilter === 'ALL' || booking.status === statusFilter;
          const matchesSearch =
            searchQuery === '' ||
            booking.hotelName
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            booking.roomName
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            booking.id.toString().includes(searchQuery);
          return matchesStatus && matchesSearch;
        })
        .sort((a, b) => {
          const dateA = new Date(a.checkInDate).getTime();
          const dateB = new Date(b.checkInDate).getTime();
          return dateB - dateA; // Descending order
        });
    }
    return [];
  }, [bookings, statusFilter, searchQuery]);

  // Use worker result for large datasets, client-side for small ones
  const finalFilteredBookings =
    bookings.length > 50 ? filteredBookings : clientFilteredBookings;

  // Cleanup workers on unmount
  useWorkerCleanup();

  const statusCounts = {
    ALL: bookings.length,
    PENDING: bookings.filter((b) => b.status === 'PENDING').length,
    CONFIRMED: bookings.filter((b) => b.status === 'CONFIRMED').length,
    CHECKED_IN: bookings.filter((b) => b.status === 'CHECKED_IN').length,
    COMPLETED: bookings.filter((b) => b.status === 'COMPLETED').length,
    CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  const isFiltering = filtering && bookings.length > 50;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Đặt phòng của tôi
          </h1>
          <p className="text-slate-500">
            Xem và quản lý tất cả đặt phòng của bạn
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên khách sạn, phòng hoặc mã đặt phòng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {(
                [
                  'ALL',
                  'PENDING',
                  'CONFIRMED',
                  'CHECKED_IN',
                  'COMPLETED',
                  'CANCELLED',
                ] as BookingStatus[]
              ).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                    statusFilter === status
                      ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {getStatusLabel(status)}
                  {statusCounts[status] > 0 && (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        statusFilter === status
                          ? 'bg-white/20 text-white'
                          : 'bg-white text-slate-600'
                      }`}
                    >
                      {statusCounts[status]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filtering indicator */}
        {isFiltering && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-blue-700 text-sm font-medium">
              Đang lọc kết quả...
            </span>
          </div>
        )}

        {/* Bookings List */}
        {finalFilteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
            <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Không tìm thấy đặt phòng
            </h2>
            <p className="text-slate-500 mb-6">
              {bookings.length === 0
                ? 'Bạn chưa có đặt phòng nào. Hãy bắt đầu khám phá khách sạn!'
                : 'Không có đặt phòng nào khớp với tiêu chí tìm kiếm của bạn.'}
            </p>
            {bookings.length === 0 && (
              <button
                onClick={() => navigate('/search')}
                className="px-6 py-3 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl transition-colors inline-flex items-center gap-2"
              >
                Khám phá khách sạn
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {finalFilteredBookings.map((booking) => {
              const nights = calculateNights(
                booking.checkInDate,
                booking.checkOutDate
              );
              return (
                <div
                  key={booking.id}
                  onClick={() => navigate(`/booking/${booking.id}`)}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-brand-accent/30 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image */}
                    {booking.roomImage && (
                      <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0">
                        <OptimizedImage
                          src={booking.roomImage}
                          alt={booking.roomName || 'Room'}
                          className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                          lazy={true}
                          useThumbnail={true}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-slate-900 mb-1">
                            {booking.hotelName ||
                              booking.roomName ||
                              `Đặt phòng #${booking.id}`}
                          </h3>
                          {booking.roomName && booking.hotelName && (
                            <p className="text-slate-500 text-sm">
                              {booking.roomName}
                            </p>
                          )}
                          {booking.hotelId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/hotels/${booking.hotelId}`);
                              }}
                              className="text-sm text-brand-accent hover:underline mt-1"
                            >
                              Xem chi tiết khách sạn
                            </button>
                          )}
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                            <CalendarIcon className="w-5 h-5 text-brand-accent" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">
                              Nhận phòng
                            </p>
                            <p className="font-bold text-slate-900">
                              {new Date(booking.checkInDate).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                            <CalendarIcon className="w-5 h-5 text-brand-accent" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">
                              Trả phòng
                            </p>
                            <p className="font-bold text-slate-900">
                              {new Date(
                                booking.checkOutDate
                              ).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-brand-accent" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">
                              Khách & Đêm
                            </p>
                            <p className="font-bold text-slate-900">
                              {booking.guests}{' '}
                              {booking.guests === 1 ? 'Khách' : 'Khách'} •{' '}
                              {nights} {nights === 1 ? 'Đêm' : 'Đêm'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex-1">
                          {booking.couponCode && (
                            <p className="text-xs text-slate-500 mb-1">
                              Mã giảm giá đã áp dụng:{' '}
                              <span className="font-bold">
                                {booking.couponCode}
                              </span>
                            </p>
                          )}
                          {booking.refundAmount && booking.refundAmount > 0 && (
                            <p className="text-xs text-green-600 mb-1">
                              Hoàn tiền: {formatVND(booking.refundAmount)}
                            </p>
                          )}
                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-3">
                            {canCancelBooking(booking.status) && (
                              <button
                                onClick={(e) => handleCancelBooking(booking, e)}
                                className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                              >
                                <X className="w-4 h-4" />
                                Hủy đặt phòng
                              </button>
                            )}
                            {canDownloadInvoice(booking.status) && (
                              <button
                                onClick={(e) =>
                                  handleDownloadInvoice(booking.id, e)
                                }
                                className="px-4 py-2 text-sm font-bold text-brand-accent hover:bg-brand-accent/10 rounded-xl transition-colors flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Tải hóa đơn
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 mb-1">
                            Tổng tiền
                          </p>
                          <p className="text-2xl font-black text-brand-cta">
                            {formatVND(booking.totalPrice)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex items-center">
                      <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-brand-accent group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Booking Modal */}
      {cancelModalOpen && selectedBooking && (
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

              {selectedBooking.cancellationPolicyDescription && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-900 font-bold mb-1">
                    Chính sách hủy:
                  </p>
                  <p className="text-sm text-blue-700">
                    {selectedBooking.cancellationPolicyDescription}
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
                onClick={handleConfirmCancel}
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
