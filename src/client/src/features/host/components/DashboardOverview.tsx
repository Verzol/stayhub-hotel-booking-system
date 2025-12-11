import { useState, useEffect } from 'react';
import { getCachedDashboardSummary } from '../../../utils/cachedServices';
import { useWorkerCleanup } from '../../../hooks/useWorker';
import {
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  LogIn,
  LogOut,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatVND } from '../../../utils/currency';
import { DashboardOverviewSkeleton } from '../../../components/common/DashboardSkeleton';
import { useNavigate } from 'react-router-dom';
import type { DashboardSummaryResponse } from '../../../services/dashboardService';

export default function DashboardOverview() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Single optimized request - backend uses aggregated queries (much faster!)
      // Stats calculated with COUNT/SUM queries (no data loading)
      // Only loads 5 recent bookings (LIMIT 5)
      const data = await getCachedDashboardSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup workers on unmount
  useWorkerCleanup();

  if (loading) {
    return <DashboardOverviewSkeleton />;
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-slate-500">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const revenueChange = summary.revenueChangePercent || 0;
  const isRevenueUp = revenueChange > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Header - Modern & Clean */}
      <div className="bg-gradient-to-br from-brand-accent via-brand-accent to-brand-dark rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-3xl font-black">Welcome back!</h1>
          </div>
          <p className="text-white/90 text-lg font-medium">
            Overview of your business performance
          </p>
        </div>
      </div>

      {/* Stats Grid - Clean & Modern */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hotels */}
        <StatCard
          icon={Building2}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          value={summary.totalHotels}
          label="Total Hotels"
          subtitle={`${summary.totalRooms} rooms`}
        />

        {/* Total Bookings */}
        <StatCard
          icon={Calendar}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          value={summary.totalBookings}
          label="Total Bookings"
          subtitle={`${summary.confirmedBookings} confirmed`}
        />

        {/* Total Revenue */}
        <StatCard
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          value={formatVND(summary.totalRevenue, { symbol: 'VND' })}
          label="Total Revenue"
          subtitle={
            <div className="flex items-center gap-1 mt-1">
              {isRevenueUp ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span
                className={`text-xs font-bold ${
                  isRevenueUp ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isRevenueUp ? '+' : ''}
                {revenueChange.toFixed(1)}% vs last month
              </span>
            </div>
          }
        />

        {/* Upcoming Bookings */}
        <StatCard
          icon={Calendar}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          value={summary.upcomingBookings}
          label="Upcoming Bookings"
          subtitle="Need preparation"
        />
      </div>

      {/* Action Cards - Simplified */}
      {(summary.pendingCheckIns > 0 || summary.pendingCheckOuts > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.pendingCheckIns > 0 && (
            <ActionCard
              icon={LogIn}
              iconBg="bg-blue-500"
              count={summary.pendingCheckIns}
              label="Pending Check-ins"
              description="Action required today"
              onClick={() => navigate('/host?view=BOOKINGS')}
            />
          )}

          {summary.pendingCheckOuts > 0 && (
            <ActionCard
              icon={LogOut}
              iconBg="bg-green-500"
              count={summary.pendingCheckOuts}
              label="Pending Check-outs"
              description="Action required today"
              onClick={() => navigate('/host?view=BOOKINGS')}
            />
          )}
        </div>
      )}

      {/* Recent Bookings - Clean Design */}
      {summary.recentBookings && summary.recentBookings.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900">
              Recent Bookings
            </h2>
            <button
              onClick={() => navigate('/host?view=BOOKINGS')}
              className="flex items-center gap-2 text-sm font-bold text-brand-accent hover:text-brand-dark transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {summary.recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 hover:shadow-md transition-all group cursor-pointer"
                onClick={() => navigate(`/booking/${booking.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/booking/${booking.id}`);
                  }
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-black text-slate-900">#{booking.id}</p>
                    <span className="px-2 py-1 bg-white rounded-lg text-xs font-bold text-slate-600">
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 font-medium">
                    {booking.hotelName} • {booking.roomName}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {booking.guestName} •{' '}
                    {new Date(booking.checkInDate).toLocaleDateString('en-US')}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-black text-lg text-slate-900">
                      {formatVND(booking.totalPrice, { symbol: 'VND' })}
                    </p>
                    <p className="text-xs text-slate-400">
                      Click to view details
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-accent group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {summary.totalHotels === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            No hotels yet
          </h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Start by adding your first hotel to manage rooms and bookings
          </p>
          <button
            onClick={() => navigate('/host?view=HOTEL_FORM')}
            className="px-6 py-3 bg-brand-cta hover:bg-brand-cta-hover text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-cta/30 hover:scale-105"
          >
            Add First Hotel
          </button>
        </div>
      )}
    </div>
  );
}

// Stat Card Component - Reusable
interface StatCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  value: string | number;
  label: string;
  subtitle: string | React.ReactNode;
}

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  value,
  label,
  subtitle,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      <h3 className="text-3xl font-black text-slate-900 mb-1">{value}</h3>
      <p className="text-slate-500 font-medium text-sm">{label}</p>
      {typeof subtitle === 'string' ? (
        <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
      ) : (
        <div className="mt-2">{subtitle}</div>
      )}
    </div>
  );
}

// Action Card Component - Reusable
interface ActionCardProps {
  icon: React.ElementType;
  iconBg: string;
  count: number;
  label: string;
  description: string;
  onClick: () => void;
}

function ActionCard({
  icon: Icon,
  iconBg,
  count,
  label,
  description,
  onClick,
}: ActionCardProps) {
  // Map iconBg to gradient classes
  const gradientClass = iconBg.includes('blue')
    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
    : iconBg.includes('green')
      ? 'bg-gradient-to-r from-green-500 to-green-600'
      : 'bg-gradient-to-r from-purple-500 to-purple-600';

  return (
    <button
      onClick={onClick}
      className={`${gradientClass} rounded-2xl p-6 text-white text-left hover:scale-[1.02] transition-all shadow-lg`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-3xl font-black mb-1">{count}</h3>
      <p className="text-white/90 font-medium">{label}</p>
      <p className="text-xs text-white/70 mt-2">{description}</p>
    </button>
  );
}
