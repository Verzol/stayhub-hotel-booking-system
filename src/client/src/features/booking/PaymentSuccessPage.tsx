import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Calendar } from 'lucide-react';
import {
  getBooking,
  type BookingResponse,
} from '../../services/bookingService';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<BookingResponse | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (bookingId) {
        try {
          const data = await getBooking(Number(bookingId));
          setBooking(data);
        } catch (error) {
          console.error('Failed to load booking', error);
        }
      }
    };
    fetchBooking();
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-slate-500 mb-8">
          Thank you for your booking. A confirmation email has been sent to your
          inbox.
        </p>

        {booking && (
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
              <span className="text-slate-500 text-sm">Booking ID</span>
              <span className="font-mono font-bold text-slate-900">
                #{booking.id}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-brand-accent" />
                <div>
                  <p className="text-xs text-slate-500">Check-in</p>
                  <p className="font-bold text-slate-900">
                    {booking.checkInDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-brand-accent" />
                <div>
                  <p className="text-xs text-slate-500">Check-out</p>
                  <p className="font-bold text-slate-900">
                    {booking.checkOutDate}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-900">Total Paid</span>
              <span className="text-xl font-black text-brand-cta">
                ${booking.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
