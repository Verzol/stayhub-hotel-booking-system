import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  calculatePrice,
  createBooking,
  createPaymentUrl,
  confirmBooking,
  type PriceCalculationResponse,
} from '../../services/bookingService';
import { getHotelDetails } from '../../services/searchService';
import type { Hotel, Room } from '../../types/host';
import { toast } from 'sonner';
import {
  Users,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Star,
  MapPin,
  X,
} from 'lucide-react';
import { formatVND } from '../../utils/currency';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roomId = Number(searchParams.get('roomId'));
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = Number(searchParams.get('guests')) || 1;
  const hotelId = Number(searchParams.get('hotelId')); // Pass hotelId for display

  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [hotel, setHotel] = useState<Hotel | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    note: '',
    couponCode: '',
  });

  const [priceDetails, setPriceDetails] = useState<PriceCalculationResponse>({
    originalPrice: 0,
    discountAmount: 0,
    serviceFee: 0,
    finalPrice: 0,
  });

  const [room, setRoom] = useState<Room | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'QR'>('VNPAY');
  const [showQRModal, setShowQRModal] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null);

  // Helper to validate and update dates
  const handleDateChange = (type: 'checkIn' | 'checkOut', value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(type, value);

    const newCheckIn = type === 'checkIn' ? value : checkIn;
    const newCheckOut = type === 'checkOut' ? value : checkOut;

    if (newCheckIn && newCheckOut) {
      const start = new Date(newCheckIn);
      const end = new Date(newCheckOut);

      if (start >= end) {
        // If check-in is after check-out, or same day, adjust check-out to check-in + 1 day
        const nextDay = new Date(start);
        nextDay.setDate(nextDay.getDate() + 1);
        params.set('checkOut', nextDay.toISOString().split('T')[0]);
        if (type === 'checkOut') {
          toast.error('Ngày trả phòng phải sau ngày nhận phòng');
        }
      }
    }

    navigate(`?${params.toString()}`, { replace: true });
  };
  useEffect(() => {
    const fetchDetails = async () => {
      if (hotelId) {
        try {
          const data = await getHotelDetails(hotelId);
          setHotel(data);
          if (roomId && data.rooms) {
            const selectedRoom = data.rooms.find((r) => r.id === roomId);
            setRoom(selectedRoom || null);
          }
        } catch (error) {
          console.error('Failed to load hotel details', error);
        }
      }
    };
    fetchDetails();
  }, [hotelId, roomId]);

  useEffect(() => {
    const fetchPrice = async () => {
      if (!roomId || !checkIn || !checkOut) return;
      setCalculating(true);
      try {
        const data = await calculatePrice({
          roomId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guests,
          couponCode: formData.couponCode,
        });
        setPriceDetails(data);
      } catch (error) {
        console.error('Failed to calculate price', error);
      } finally {
        setCalculating(false);
      }
    };

    // Debounce price calculation for coupon
    const timeoutId = setTimeout(() => {
      fetchPrice();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [roomId, checkIn, checkOut, guests, formData.couponCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create Booking
      console.log('Creating booking...');
      const booking = await createBooking({
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests,
        guestName: `${formData.firstName} ${formData.lastName}`,
        guestEmail: formData.email,
        guestPhone: formData.phone,
        couponCode: formData.couponCode,
        note: formData.note,
      });
      console.log('Booking created:', booking);

      if (paymentMethod === 'QR') {
        setPendingBookingId(booking.id);
        setShowQRModal(true);
        setLoading(false); // Stop loading for the form, but keep modal open
        return;
      }

      // 2. Get Payment URL
      console.log('Getting payment URL...');
      const paymentUrl = await createPaymentUrl(booking.id);
      console.log('Payment URL:', paymentUrl);

      if (paymentUrl) {
        // 3. Redirect to Payment
        window.location.href = paymentUrl;
      } else {
        toast.error('Không thể tạo URL thanh toán');
        setLoading(false);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể tạo đặt phòng. Vui lòng thử lại.';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!pendingBookingId) {
      toast.error('Không tìm thấy mã đặt phòng');
      return;
    }

    setLoading(true);
    try {
      // Call API to confirm payment and send invoice email
      await confirmBooking(pendingBookingId);
      toast.success(
        'Thanh toán đã được xác nhận! Hóa đơn đã được gửi đến email của bạn. Đang chuyển đến trang chi tiết đặt phòng...'
      );

      // Wait a bit before redirect to show success message
      setTimeout(() => {
        navigate(`/booking/${pendingBookingId}`); // Redirect to booking confirmation page
      }, 1500);
    } catch (error: unknown) {
      console.error('Payment confirmation failed - Full error:', error);

      let errorMessage = 'Không thể xác nhận thanh toán. Vui lòng thử lại.';

      if (error && typeof error === 'object') {
        // Check if it's an Axios error
        if ('response' in error && error.response) {
          const axiosError = error as {
            response: {
              data?: { message?: string; success?: boolean } | string;
              status?: number;
            };
          };

          console.error('Axios error response:', {
            status: axiosError.response.status,
            data: axiosError.response.data,
          });

          // Extract error message from different response formats
          if (axiosError.response.data) {
            if (typeof axiosError.response.data === 'string') {
              errorMessage = axiosError.response.data;
            } else if (
              typeof axiosError.response.data === 'object' &&
              'message' in axiosError.response.data
            ) {
              errorMessage = axiosError.response.data.message || errorMessage;
            }
          }

          if (axiosError.response.status === 401) {
            errorMessage =
              'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          } else if (axiosError.response.status === 404) {
            errorMessage = 'Không tìm thấy đặt phòng.';
          }
        } else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }

      console.error('Final error message:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setShowQRModal(false);
    }
  };

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Yêu cầu đặt phòng không hợp lệ
          </h2>
          <p className="text-slate-500 mb-4">Thiếu ID phòng</p>
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

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-black text-slate-900 mb-8">
          Xác nhận đặt phòng của bạn
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Guest Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Thông tin khách hàng
                </h2>
              </div>

              <form
                id="booking-form"
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Họ
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all"
                    placeholder="Nguyễn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Tên
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all"
                    placeholder="Văn A"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Địa chỉ email
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all"
                    placeholder="nguyenvana@example.com"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Email xác nhận đặt phòng sẽ được gửi đến địa chỉ này.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all"
                    placeholder="0901234567"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Yêu cầu đặc biệt (Tùy chọn)
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all h-32 resize-none"
                    placeholder="Nhận phòng muộn, phòng yên tĩnh, v.v."
                  />
                </div>
              </form>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Phương thức thanh toán
                </h2>
              </div>

              <div
                onClick={() => setPaymentMethod('VNPAY')}
                className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer mb-4 ${paymentMethod === 'VNPAY' ? 'border-brand-accent bg-brand-accent/5' : 'border-slate-200 hover:border-brand-accent/50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-white rounded border border-slate-200 flex items-center justify-center">
                    <span className="font-bold text-xs text-blue-600">
                      VNPay
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    Thanh toán bằng VNPay
                  </span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'VNPAY' ? 'border-brand-accent' : 'border-slate-300'}`}
                >
                  {paymentMethod === 'VNPAY' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-accent" />
                  )}
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('QR')}
                className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer ${paymentMethod === 'QR' ? 'border-brand-accent bg-brand-accent/5' : 'border-slate-200 hover:border-brand-accent/50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-white rounded border border-slate-200 flex items-center justify-center">
                    <span className="font-bold text-xs text-slate-900">QR</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    Chuyển khoản / QR Code
                  </span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'QR' ? 'border-brand-accent' : 'border-slate-300'}`}
                >
                  {paymentMethod === 'QR' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-accent" />
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-slate-500 text-sm">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Thông tin thanh toán của bạn được bảo mật và mã hóa.
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Tóm tắt đặt phòng
              </h3>

              {hotel && (
                <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100">
                  <img
                    src={
                      hotel.images && hotel.images.length > 0
                        ? hotel.images[0].url.startsWith('http')
                          ? hotel.images[0].url
                          : `http://localhost:8080${hotel.images[0].url}`
                        : '/placeholder-hotel.jpg'
                    }
                    alt={hotel.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 line-clamp-2">
                      {hotel.name}
                    </h4>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                      <MapPin className="w-3 h-3" />
                      {hotel.city}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      {hotel.starRating} Sao
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Nhận phòng</span>
                  <input
                    type="date"
                    value={checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) =>
                      handleDateChange('checkIn', e.target.value)
                    }
                    className="font-bold text-slate-900 bg-transparent border-b border-slate-200 focus:border-brand-accent outline-none text-right w-32"
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Trả phòng</span>
                  <input
                    type="date"
                    value={checkOut}
                    min={
                      checkIn
                        ? new Date(new Date(checkIn).getTime() + 86400000)
                            .toISOString()
                            .split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      handleDateChange('checkOut', e.target.value)
                    }
                    className="font-bold text-slate-900 bg-transparent border-b border-slate-200 focus:border-brand-accent outline-none text-right w-32"
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Khách</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={room?.capacity || 10}
                      value={guests}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (room && val > room.capacity) {
                          toast.error(
                            `Sức chứa tối đa của phòng này là ${room.capacity} khách`
                          );
                          return;
                        }
                        const params = new URLSearchParams(searchParams);
                        params.set('guests', e.target.value);
                        navigate(`?${params.toString()}`, { replace: true });
                      }}
                      className="font-bold text-slate-900 bg-transparent border-b border-slate-200 focus:border-brand-accent outline-none text-right w-16"
                    />
                    <span className="font-bold text-slate-900">Khách</span>
                  </div>
                </div>
                {room && guests > room.capacity && (
                  <p className="text-xs text-red-500 text-right">
                    Vượt quá sức chứa ({room.capacity})
                  </p>
                )}
              </div>

              {/* Coupon Input */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        couponCode: e.target.value.toUpperCase(),
                      })
                    }
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-accent outline-none"
                    placeholder="Nhập mã"
                  />
                </div>
                {priceDetails.appliedCouponCode && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    Áp dụng mã giảm giá thành công!
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-100 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Giá gốc</span>
                  <span>{formatVND(priceDetails.originalPrice)}</span>
                </div>
                {priceDetails.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Giảm giá</span>
                    <span>-{formatVND(priceDetails.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Phí dịch vụ</span>
                  <span>{formatVND(priceDetails.serviceFee)}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-slate-900 pt-4 border-t border-slate-100">
                  <span>Tổng cộng</span>
                  <span>{formatVND(priceDetails.finalPrice)}</span>
                </div>
              </div>

              <button
                form="booking-form"
                disabled={loading || calculating || !checkIn || !checkOut}
                className="w-full py-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'QR'
                      ? 'Tiếp tục thanh toán'
                      : 'Thanh toán ngay'}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>

            <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Quét để thanh toán
            </h3>
            <p className="text-slate-500 text-center mb-6">
              Vui lòng quét mã QR bên dưới để hoàn tất thanh toán.
            </p>

            <div className="bg-slate-100 p-4 rounded-2xl mb-6 flex justify-center">
              {/* Placeholder QR Code - In production use a real QR library */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STAYHUB_BOOKING_${pendingBookingId}_AMOUNT_${priceDetails.finalPrice}`}
                alt="Payment QR Code"
                className="w-48 h-48 rounded-lg"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                <span className="text-slate-500">Số tiền</span>
                <span className="font-bold text-slate-900">
                  {formatVND(priceDetails.finalPrice)}
                </span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                <span className="text-slate-500">Mã đặt phòng</span>
                <span className="font-bold text-slate-900">
                  #{pendingBookingId}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="flex-1 py-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/20 transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'Tôi đã hoàn tất chuyển khoản'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
