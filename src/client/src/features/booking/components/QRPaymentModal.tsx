import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountdown } from '../../../hooks/useCountdown';
import {
  getBooking,
  type BookingResponse,
} from '../../../services/bookingService';
import { formatVND } from '../../../utils/currency';
import { toast } from 'sonner';
import { X, Loader2, Clock, AlertTriangle } from 'lucide-react';

interface QRPaymentModalProps {
  booking: BookingResponse;
  price: number;
  onClose: () => void;
  onConfirmPayment: () => Promise<void>;
  loading: boolean;
}

export default function QRPaymentModal({
  booking,
  price,
  onClose,
  onConfirmPayment,
  loading,
}: QRPaymentModalProps) {
  const navigate = useNavigate();
  const [currentBooking, setCurrentBooking] =
    useState<BookingResponse>(booking);
  const [loadingBooking, setLoadingBooking] = useState(false);

  // Fetch booking details if lockedUntil is missing (backend may not return it immediately)
  useEffect(() => {
    const fetchBookingDetails = async () => {
      // Always fetch latest booking to ensure we have lockedUntil
      if (!loadingBooking && currentBooking.status === 'PENDING') {
        setLoadingBooking(true);
        try {
          const updatedBooking = await getBooking(currentBooking.id);
          console.log('Fetched booking with lockedUntil:', updatedBooking);
          console.log('lockedUntil value:', updatedBooking.lockedUntil);
          console.log('lockedUntil type:', typeof updatedBooking.lockedUntil);
          setCurrentBooking(updatedBooking);
        } catch (error) {
          console.error('Failed to fetch booking details:', error);
        } finally {
          setLoadingBooking(false);
        }
      }
    };

    // Fetch immediately if lockedUntil is missing, otherwise fetch after a short delay
    if (!currentBooking.lockedUntil) {
      fetchBookingDetails();
    } else {
      // Still fetch to get latest status, but after a short delay
      const timer = setTimeout(fetchBookingDetails, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Parse lockedUntil date - handle both string and ISO format
  const parseLockedUntil = (): Date | null => {
    const lockedUntilValue = currentBooking.lockedUntil;
    console.log('Parsing lockedUntil:', lockedUntilValue);

    if (!lockedUntilValue) {
      console.warn('lockedUntil is missing in booking:', currentBooking);
      return null;
    }

    try {
      const date = new Date(lockedUntilValue);
      console.log('Parsed date:', date);
      console.log('Date isValid:', !isNaN(date.getTime()));

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid lockedUntil date:', lockedUntilValue);
        return null;
      }

      // Check if date is in the future
      const now = new Date();
      console.log('Now:', now);
      console.log('LockedUntil:', date);
      console.log('Is in future:', date > now);

      if (date <= now) {
        console.warn('lockedUntil is already in the past');
        return null;
      }

      return date;
    } catch (error) {
      console.error('Error parsing lockedUntil:', error, lockedUntilValue);
      return null;
    }
  };

  const lockedUntil = parseLockedUntil();

  const { formatted, minutes, isExpired } = useCountdown({
    targetDate: lockedUntil,
    onExpire: () => {
      handleExpired();
    },
  });

  // Check booking status periodically (every 30 seconds)
  useEffect(() => {
    if (!currentBooking.id || isExpired) return;

    const checkBookingStatus = async () => {
      try {
        const updatedBooking = await getBooking(currentBooking.id);
        setCurrentBooking(updatedBooking);

        // If booking was confirmed or cancelled, close modal
        if (updatedBooking.status !== 'PENDING') {
          if (updatedBooking.status === 'CONFIRMED') {
            toast.success('Payment confirmed!');
            setTimeout(() => {
              navigate(`/booking/${updatedBooking.id}`);
            }, 1500);
          } else if (updatedBooking.status === 'CANCELLED') {
            toast.error('Booking expired. Please book again.');
            onClose();
          }
        }
      } catch (error) {
        console.error('Failed to check booking status', error);
      }
    };

    const interval = setInterval(checkBookingStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBooking.id, isExpired]);

  const handleExpired = async () => {
    // Refresh booking status to confirm it's expired
    try {
      const updatedBooking = await getBooking(currentBooking.id);
      if (updatedBooking.status === 'CANCELLED') {
        toast.error(
          'Holding time expired. Booking cancelled automatically. Please book again.'
        );
        onClose();
      }
    } catch (error) {
      console.error('Failed to check expired booking', error);
      toast.error('Holding time expired. Please check your booking again.');
      onClose();
    }
  };

  const isWarningTime = minutes < 3; // Warning when less than 3 minutes remaining
  const isCriticalTime = minutes < 1; // Critical when less than 1 minute remaining

  // Only show expired if we have a lockedUntil and it's actually expired
  const showExpired = lockedUntil && isExpired;

  // Only show countdown if we have a valid lockedUntil that's in the future
  const showCountdown = lockedUntil && !isExpired && lockedUntil > new Date();

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">
          Scan to Pay
        </h3>
        <p className="text-slate-500 text-center mb-6">
          Please scan the QR code below to complete payment.
        </p>

        {/* Countdown Timer - Only show if we have a valid lockedUntil in the future */}
        {showCountdown && (
          <div
            className={`mb-6 p-4 rounded-2xl border-2 ${
              isCriticalTime
                ? 'bg-red-50 border-red-200'
                : isWarningTime
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <Clock
                className={`w-5 h-5 ${
                  isCriticalTime
                    ? 'text-red-600'
                    : isWarningTime
                      ? 'text-yellow-600'
                      : 'text-blue-600'
                }`}
              />
              <div className="text-center">
                <div
                  className={`text-2xl font-black ${
                    isCriticalTime
                      ? 'text-red-600'
                      : isWarningTime
                        ? 'text-yellow-600'
                        : 'text-blue-600'
                  }`}
                >
                  {formatted}
                </div>
                <div
                  className={`text-xs font-bold mt-1 ${
                    isCriticalTime
                      ? 'text-red-600'
                      : isWarningTime
                        ? 'text-yellow-600'
                        : 'text-blue-600'
                  }`}
                >
                  {isCriticalTime
                    ? 'Time running out!'
                    : isWarningTime
                      ? 'Time remaining'
                      : 'Holding time'}
                </div>
              </div>
            </div>
            {(isWarningTime || isCriticalTime) && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 justify-center">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {isCriticalTime
                    ? 'Please complete payment now to hold your room!'
                    : 'Please complete payment within this time!'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Info message if lockedUntil is missing (not expired, just loading) */}
        {!lockedUntil &&
          !loadingBooking &&
          currentBooking.status === 'PENDING' && (
            <div className="mb-6 p-4 rounded-2xl bg-blue-50 border-2 border-blue-200">
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Clock className="w-5 h-5" />
                <span className="font-bold text-sm">Loading info...</span>
              </div>
            </div>
          )}

        {/* Expired Message - Only show if actually expired */}
        {showExpired && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-200">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-bold">Holding time expired</span>
            </div>
            <p className="text-sm text-red-600 text-center mt-2">
              Booking will be cancelled automatically. Please book again.
            </p>
          </div>
        )}

        <div className="bg-slate-100 p-4 rounded-2xl mb-6 flex justify-center">
          {/* Placeholder QR Code - In production use a real QR library */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STAYHUB_BOOKING_${currentBooking.id}_AMOUNT_${price}`}
            alt="Payment QR Code"
            className="w-48 h-48 rounded-lg"
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm py-2 border-b border-slate-100">
            <span className="text-slate-500">Amount</span>
            <span className="font-bold text-slate-900">{formatVND(price)}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-slate-100">
            <span className="text-slate-500">Booking ID</span>
            <span className="font-bold text-slate-900">
              #{currentBooking.id}
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmPayment}
            disabled={loading || showExpired || loadingBooking}
            className="flex-1 py-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/20 transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || loadingBooking ? (
              <Loader2 className="animate-spin" />
            ) : showExpired ? (
              'Expired'
            ) : (
              'I have completed the transfer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
