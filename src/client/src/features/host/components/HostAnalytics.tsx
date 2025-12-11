import { useState, useEffect } from 'react';
import { type AnalyticsResponse } from '../../../services/bookingService';
import {
  getCachedHotels,
  getCachedAnalytics,
} from '../../../utils/cachedServices';
import type { Hotel } from '../../../types/host';
import { TrendingUp, DollarSign, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import { formatVND } from '../../../utils/currency';
import { AnalyticsSkeleton } from '../../../components/common/DashboardSkeleton';
import { useWorkerCleanup } from '../../../hooks/useWorker';

export default function HostAnalytics() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>(
    'month'
  );

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHotelId, timeRange]);

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

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      // Use optimized backend endpoint with caching - analytics calculated on server
      const analyticsData = await getCachedAnalytics({
        hotelId: selectedHotelId || undefined,
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      });
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup workers on unmount
  useWorkerCleanup();

  if (loading && !analytics) {
    return <AnalyticsSkeleton />;
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
        <p className="text-slate-500">No analytics data available</p>
      </div>
    );
  }

  const maxRevenue = Math.max(
    ...analytics.revenueByMonth.map((r) => r.revenue),
    1
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Analytics</h2>
          <p className="text-slate-500 mt-1">Track your business performance</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          {hotels.length > 0 && (
            <select
              value={selectedHotelId || ''}
              onChange={(e) =>
                setSelectedHotelId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none"
            >
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </option>
              ))}
              {hotels.length > 1 && <option value="">All Hotels</option>}
            </select>
          )}

          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  timeRange === range
                    ? 'bg-white text-brand-accent shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === 'week'
                  ? 'Week'
                  : range === 'month'
                    ? 'Month'
                    : 'Year'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-1">
            {formatVND(analytics.revenue, { symbol: 'VND' })}
          </h3>
          <p className="text-slate-500 font-medium">Revenue</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-1">
            {analytics.bookingsCount}
          </h3>
          <p className="text-slate-500 font-medium">Total Bookings</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-1">
            {analytics.occupancyRate.toFixed(1)}%
          </h3>
          <p className="text-slate-500 font-medium">Occupancy Rate</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-1">
            {formatVND(analytics.avgBookingValue, { symbol: 'VND' })}
          </h3>
          <p className="text-slate-500 font-medium">Avg Booking Value</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h3 className="text-xl font-black text-slate-900 mb-6">
          Monthly Revenue (Last 6 Months)
        </h3>
        <div className="space-y-4">
          {analytics.revenueByMonth.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-700">
                  {item.month}
                </span>
                <span className="text-sm font-black text-slate-900">
                  {formatVND(item.revenue, { symbol: 'VND' })}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-accent to-brand-dark rounded-full transition-all duration-500"
                  style={{
                    width: `${(item.revenue / maxRevenue) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="text-xl font-black text-slate-900 mb-4">
            Status Distribution
          </h3>
          <div className="space-y-3">
            {[
              {
                status: 'COMPLETED',
                label: 'Completed',
                color: 'bg-green-500',
              },
              {
                status: 'CONFIRMED',
                label: 'Confirmed',
                color: 'bg-blue-500',
              },
              {
                status: 'CHECKED_IN',
                label: 'Checked In',
                color: 'bg-purple-500',
              },
              {
                status: 'PENDING',
                label: 'Pending Payment',
                color: 'bg-yellow-500',
              },
              { status: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500' },
            ].map(({ status, label, color }) => {
              const count = analytics.statusDistribution[status] || 0;
              const percentage =
                analytics.bookingsCount > 0
                  ? (count / analytics.bookingsCount) * 100
                  : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-700">
                      {label}
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="text-xl font-black text-slate-900 mb-4">
            Other Stats
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Cancellation Rate</p>
              <p className="text-2xl font-black text-red-600">
                {analytics.cancellationRate.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Completed Bookings</p>
              <p className="text-2xl font-black text-green-600">
                {analytics.statusDistribution['COMPLETED'] || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Total Bookings</p>
              <p className="text-2xl font-black text-slate-900">
                {analytics.bookingsCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
