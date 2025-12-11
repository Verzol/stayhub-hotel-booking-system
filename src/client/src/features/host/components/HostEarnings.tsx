import { useState, useEffect } from 'react';
import { type EarningsResponse } from '../../../services/bookingService';
import {
  getCachedHotels,
  getCachedEarnings,
} from '../../../utils/cachedServices';
import type { Hotel } from '../../../types/host';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatVND } from '../../../utils/currency';
import { EarningsSkeleton } from '../../../components/common/DashboardSkeleton';
import { useWorkerCleanup } from '../../../hooks/useWorker';

export default function HostEarnings() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [earnings, setEarnings] = useState<EarningsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    if (hotels.length > 0) {
      fetchEarnings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotels, dateRange, selectedHotelId]);

  const fetchHotels = async () => {
    try {
      const hotelsData = await getCachedHotels();
      setHotels(hotelsData);
      if (hotelsData.length > 0 && hotelsData[0].id) {
        setSelectedHotelId(hotelsData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch hotels', error);
      toast.error('Failed to load hotels');
    }
  };

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      // Use optimized backend endpoint with caching - earnings calculated on server
      const earningsData = await getCachedEarnings({
        hotelId: selectedHotelId || undefined,
        startDate: dateRange.start,
        endDate: dateRange.end,
      });
      setEarnings(earningsData);
    } catch (error) {
      console.error('Failed to fetch earnings', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup workers on unmount
  useWorkerCleanup();

  if (loading && !earnings) {
    return <EarningsSkeleton />;
  }

  if (!earnings) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
        <p className="text-slate-500">No earnings data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Earnings</h2>
          <p className="text-slate-500 mt-1">View your revenue details</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-700">Filter:</span>
          </div>

          {hotels.length > 1 && (
            <select
              value={selectedHotelId || ''}
              onChange={(e) =>
                setSelectedHotelId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none"
            >
              <option value="">All Hotels</option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </option>
              ))}
            </select>
          )}

          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
            className="px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none"
          />

          <span className="text-slate-400">to</span>

          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
            className="px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-black mb-1">
            {formatVND(earnings.totalEarnings, { symbol: 'VND' })}
          </h3>
          <p className="text-green-50 font-medium">Total Earnings</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-black mb-1">
            {earnings.completedCount}
          </h3>
          <p className="text-blue-50 font-medium">Completed Bookings</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-black mb-1">
            {earnings.completedCount > 0
              ? formatVND(earnings.avgBookingValue, { symbol: 'VND' })
              : formatVND(0, { symbol: 'VND' })}
          </h3>
          <p className="text-purple-50 font-medium">Avg Booking Value</p>
        </div>
      </div>

      {/* Earnings by Hotel */}
      {hotels.length > 1 &&
        !selectedHotelId &&
        Object.keys(earnings.earningsByHotel).length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-4">
              Earnings by Hotel
            </h3>
            <div className="space-y-3">
              {Object.entries(earnings.earningsByHotel)
                .sort((a, b) => b[1] - a[1])
                .map(([hotelId, revenue]) => {
                  const hotel = hotels.find((h) => h.id === Number(hotelId));
                  return (
                    <div
                      key={hotelId}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {hotel?.name || `Hotel #${hotelId}`}
                        </p>
                      </div>
                      <p className="font-black text-lg text-slate-900">
                        {formatVND(revenue, { symbol: 'VND' })}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

      {/* Earnings by Month */}
      {earnings.earningsByMonth.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="text-xl font-black text-slate-900 mb-4">
            Monthly Earnings
          </h3>
          <div className="space-y-3">
            {earnings.earningsByMonth.map((monthData) => (
              <div
                key={monthData.monthKey}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
              >
                <div>
                  <p className="font-bold text-slate-900 capitalize">
                    {monthData.monthName}
                  </p>
                </div>
                <p className="font-black text-lg text-slate-900">
                  {formatVND(monthData.earnings, { symbol: 'VND' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-slate-900">
            Recent Transactions
          </h3>
          <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-bold text-slate-700">
                  Booking ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-slate-700">
                  Hotel
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-slate-700">
                  Guest
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-slate-700">
                  Check-out
                </th>
                <th className="text-right py-3 px-4 text-sm font-bold text-slate-700">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {earnings.recentTransactions.length > 0 ? (
                earnings.recentTransactions.map((transaction) => (
                  <tr
                    key={transaction.bookingId}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">
                        #{transaction.bookingId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-700">
                        {transaction.hotelName || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-700">
                        {transaction.guestName || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-700">
                        {transaction.checkoutDate
                          ? new Date(
                              transaction.checkoutDate
                            ).toLocaleDateString('en-US')
                          : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-black text-slate-900">
                        {formatVND(transaction.amount, { symbol: 'VND' })}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No transactions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
