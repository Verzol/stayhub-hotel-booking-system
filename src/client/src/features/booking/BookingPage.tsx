import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  calculatePrice,
  createBooking,
  createPaymentUrl,
  confirmBooking,
  type PriceCalculationResponse,
  type BookingResponse,
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
} from 'lucide-react';
import { formatVND } from '../../utils/currency';
import HotelImage from '../../components/common/HotelImage';
import QRPaymentModal from './components/QRPaymentModal';

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
  const [pendingBooking, setPendingBooking] = useState<BookingResponse | null>(
    null
  );
  const [couponError, setCouponError] = useState<string | null>(null);

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
          toast.error('Check-out date must be after check-in date');
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

  // Calculate base price (without coupon) when dates/guests change
  useEffect(() => {
    const fetchPrice = async () => {
      if (!roomId || !checkIn || !checkOut) return;
      setCalculating(true);
      try {
        // Only calculate base price, don't apply coupon here
        const data = await calculatePrice({
          roomId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guests,
          couponCode: '', // No coupon for base price calculation
        });
        setPriceDetails(data);
        // Clear coupon error when base price is recalculated
        setCouponError(null);
      } catch (error) {
        console.error('Failed to calculate price', error);
      } finally {
        setCalculating(false);
      }
    };

    fetchPrice();
  }, [roomId, checkIn, checkOut, guests]);

  // Function to validate and apply coupon code
  const handleApplyCoupon = async () => {
    if (!formData.couponCode || !formData.couponCode.trim()) {
      setCouponError(null);
      return;
    }

    if (!roomId || !checkIn || !checkOut) return;

    setCalculating(true);
    setCouponError(null);

    try {
      const data = await calculatePrice({
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests,
        couponCode: formData.couponCode.trim(),
      });

      // Success - update price details
      setPriceDetails(data);
      if (data.appliedCouponCode) {
        setCouponError(null);
      }
    } catch (error) {
      console.error('Failed to apply coupon', error);
      // Show error message below input (don't delete the code)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Invalid coupon code. Please check again.';

      setCouponError(errorMessage);
      // Revert to base price (without coupon)
      try {
        const basePriceData = await calculatePrice({
          roomId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guests,
          couponCode: '',
        });
        setPriceDetails(basePriceData);
      } catch (recalcError) {
        console.error('Failed to recalculate base price', recalcError);
      }
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create Booking
      console.log('Creating booking...');
      // Only use coupon code if it was successfully applied
      const couponCodeToUse = priceDetails.appliedCouponCode || '';

      const booking = await createBooking({
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests,
        guestName: `${formData.firstName} ${formData.lastName}`,
        guestEmail: formData.email,
        guestPhone: formData.phone,
        couponCode: couponCodeToUse,
        note: formData.note,
      });
      console.log('Booking created:', booking);
      console.log('Booking lockedUntil:', booking.lockedUntil);

      if (paymentMethod === 'QR') {
        setPendingBookingId(booking.id);
        setPendingBooking(booking); // Store full booking object for countdown
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
        toast.error('Could not generate payment URL');
        setLoading(false);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Could not create booking. Please try again.';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!pendingBookingId) {
      toast.error('Booking ID not found');
      return;
    }

    setLoading(true);
    try {
      // Call API to confirm payment and send invoice email
      await confirmBooking(pendingBookingId);
      toast.success(
        'Payment confirmed! Invoice has been sent to your email. Redirecting to booking details...'
      );

      // Wait a bit before redirect to show success message
      setTimeout(() => {
        navigate(`/booking/${pendingBookingId}`); // Redirect to booking confirmation page
      }, 1500);
    } catch (error: unknown) {
      console.error('Payment confirmation failed - Full error:', error);

      let errorMessage = 'Could not confirm payment. Please try again.';

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
            errorMessage = 'Session expired. Please login again.';
          } else if (axiosError.response.status === 404) {
            errorMessage = 'Booking not found.';
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
            Invalid Booking Request
          </h2>
          <p className="text-slate-500 mb-4">Missing Room ID</p>
          <button
            onClick={() => navigate('/')}
            className="text-brand-accent font-bold hover:underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-black text-slate-900 mb-8">
          Confirm your booking
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
                  Guest Information
                </h2>
              </div>

              <form
                id="booking-form"
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    First Name
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
                    Last Name
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
                    Email Address
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
                    Booking confirmation will be sent to this email.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Phone Number
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
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all h-32 resize-none"
                    placeholder="Late check-in, quiet room, etc."
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
                  Payment Method
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
                    Pay with VNPay
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
                    Bank Transfer / QR Code
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
                Your payment information is secure and encrypted.
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Booking Summary
              </h3>

              {hotel && (
                <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <HotelImage
                      src={hotel.images?.[0]?.url || null}
                      alt={hotel.name}
                      className="w-full h-full"
                      aspectRatio="1/1"
                      lazy={false}
                    />
                  </div>
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
                      {hotel.starRating} Stars
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Check In</span>
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
                  <span className="text-slate-500">Check Out</span>
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
                  <span className="text-slate-500">Guests</span>
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
                            `Maximum capacity for this room is ${room.capacity} guests`
                          );
                          return;
                        }
                        const params = new URLSearchParams(searchParams);
                        params.set('guests', e.target.value);
                        navigate(`?${params.toString()}`, { replace: true });
                      }}
                      className="font-bold text-slate-900 bg-transparent border-b border-slate-200 focus:border-brand-accent outline-none text-right w-16"
                    />
                    <span className="font-bold text-slate-900">Guest(s)</span>
                  </div>
                </div>
                {room && guests > room.capacity && (
                  <p className="text-xs text-red-500 text-right">
                    Exceeds capacity ({room.capacity})
                  </p>
                )}
              </div>

              {/* Coupon Input */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        couponCode: e.target.value.toUpperCase(),
                      });
                      // Clear error when user starts typing again
                      if (couponError) {
                        setCouponError(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyCoupon();
                      }
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none transition-colors ${
                      couponError
                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : priceDetails.appliedCouponCode
                          ? 'border-green-300 focus:border-green-500'
                          : 'border-slate-200 focus:border-brand-accent'
                    }`}
                    placeholder="Enter code"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={calculating || !formData.couponCode.trim()}
                    className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
                {priceDetails.appliedCouponCode && !couponError && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    ✓ Coupon applied successfully!
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {couponError}
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-100 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Original Price</span>
                  <span>{formatVND(priceDetails.originalPrice)}</span>
                </div>
                {priceDetails.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-{formatVND(priceDetails.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Service Fee</span>
                  <span>{formatVND(priceDetails.serviceFee)}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-slate-900 pt-4 border-t border-slate-100">
                  <span>Total</span>
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
                    Processing...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'QR' ? 'Continue to Payment' : 'Pay Now'}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && pendingBooking && (
        <QRPaymentModal
          booking={pendingBooking}
          price={priceDetails.finalPrice}
          onClose={() => setShowQRModal(false)}
          onConfirmPayment={handleConfirmPayment}
          loading={loading}
        />
      )}
    </div>
  );
}
