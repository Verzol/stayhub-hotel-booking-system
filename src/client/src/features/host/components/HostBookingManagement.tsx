import { useState, useEffect, useMemo } from 'react';
import {
  checkInGuest,
  checkOutGuest,
  type HostBookingResponse,
  type HostBookingFilters,
} from '../../../services/bookingService';
import { useWorkerFilter, useWorkerCleanup } from '../../../hooks/useWorker';
import {
  getCachedAllHostBookings,
  getCachedUpcomingBookings,
  getCachedPendingCheckIns,
  getCachedPendingCheckOuts,
} from '../../../utils/cachedServices';
import { toast } from 'sonner';
import { Loader2, Calendar, Filter, RefreshCw } from 'lucide-react';
import HostBookingList from './HostBookingList';
import CheckInCheckOutModal from './CheckInCheckOutModal';

interface HostBookingManagementProps {
  hotelId: number;
}

type ViewMode = 'all' | 'upcoming' | 'pending-checkins' | 'pending-checkouts';

export default function HostBookingManagement({
  hotelId,
}: HostBookingManagementProps) {
  const [allBookings, setAllBookings] = useState<HostBookingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [filters, setFilters] = useState<HostBookingFilters>({
    hotelId,
  });
  const [selectedBooking, setSelectedBooking] =
    useState<HostBookingResponse | null>(null);
  const [modalType, setModalType] = useState<'checkin' | 'checkout' | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  // Load all bookings once for better performance (can filter client-side)
  useEffect(() => {
    fetchAllBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  useEffect(() => {
    // When filters change in 'all' view mode, update displayed bookings
    // Other view modes use their specific endpoints
    if (viewMode !== 'all') {
      fetchViewModeBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, hotelId]);

  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      // Use cached all bookings - single request for all hotels
      const data = await getCachedAllHostBookings();
      // Filter by hotelId client-side
      const hotelBookings = data.filter((b) => b.hotelId === hotelId);
      setAllBookings(hotelBookings);
    } catch (error) {
      console.error('Failed to fetch all bookings', error);
      toast.error('Failed to load bookings');
      setAllBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchViewModeBookings = async () => {
    setLoading(true);
    try {
      let data: HostBookingResponse[] = [];

      switch (viewMode) {
        case 'upcoming':
          data = await getCachedUpcomingBookings(hotelId);
          break;
        case 'pending-checkins':
          data = await getCachedPendingCheckIns(hotelId);
          break;
        case 'pending-checkouts':
          data = await getCachedPendingCheckOuts(hotelId);
          break;
      }

      setAllBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
      toast.error('Failed to load bookings');
      setAllBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Use Web Worker for filtering when in 'all' view mode and have many bookings
  const shouldUseWorker = viewMode === 'all' && allBookings.length > 50;

  const { filtered: workerFilteredBookings } = useWorkerFilter(allBookings, {
    enabled: shouldUseWorker,
    filters: {
      status: filters.status || undefined,
      checkInDate: filters.startDate ? { min: filters.startDate } : undefined,
    },
    sortBy: 'checkInDate',
    sortOrder: 'desc',
  });

  // Fallback to client-side filtering for smaller datasets or other view modes
  const clientFilteredBookings = useMemo(() => {
    if (viewMode !== 'all' || shouldUseWorker) {
      return allBookings;
    }

    let filtered = [...allBookings];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((b) => b.status === filters.status);
    }

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter((b) => {
        const checkInDate = new Date(b.checkInDate);
        return checkInDate >= startDate;
      });
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter((b) => {
        const checkInDate = new Date(b.checkInDate);
        return checkInDate <= endDate;
      });
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.checkInDate).getTime();
      const dateB = new Date(b.checkInDate).getTime();
      return dateB - dateA; // Descending order
    });
  }, [allBookings, viewMode, filters, shouldUseWorker]);

  // Use worker result for large datasets, client-side for small ones
  const filteredBookings = shouldUseWorker
    ? workerFilteredBookings
    : clientFilteredBookings;

  // Cleanup workers on unmount
  useWorkerCleanup();

  const handleCheckIn = async (booking: HostBookingResponse) => {
    if (!booking.id) return;

    try {
      await checkInGuest(booking.id, hotelId);
      toast.success('Check-in successful!');
      setModalOpen(false);
      // Refresh bookings after check-in
      if (viewMode === 'all') {
        await fetchAllBookings();
      } else {
        await fetchViewModeBookings();
      }
    } catch (error) {
      console.error('Failed to check-in', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to check-in. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleCheckOut = async (booking: HostBookingResponse) => {
    if (!booking.id) return;

    try {
      await checkOutGuest(booking.id, hotelId);
      toast.success('Check-out successful!');
      setModalOpen(false);
      // Refresh bookings after check-out
      if (viewMode === 'all') {
        await fetchAllBookings();
      } else {
        await fetchViewModeBookings();
      }
    } catch (error) {
      console.error('Failed to check-out', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to check-out. Please try again.';
      toast.error(errorMessage);
    }
  };

  const openCheckInModal = (booking: HostBookingResponse) => {
    setSelectedBooking(booking);
    setModalType('checkin');
    setModalOpen(true);
  };

  const openCheckOutModal = (booking: HostBookingResponse) => {
    setSelectedBooking(booking);
    setModalType('checkout');
    setModalOpen(true);
  };

  const handleRefresh = async () => {
    if (viewMode === 'all') {
      await fetchAllBookings();
    } else {
      await fetchViewModeBookings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            Booking Management
          </h2>
          <p className="text-slate-500 mt-1">Manage your hotel bookings</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 font-bold transition-colors border-b-2 ${
            viewMode === 'all'
              ? 'border-brand-accent text-brand-accent'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setViewMode('upcoming')}
          className={`px-4 py-2 font-bold transition-colors border-b-2 ${
            viewMode === 'upcoming'
              ? 'border-brand-accent text-brand-accent'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setViewMode('pending-checkins')}
          className={`px-4 py-2 font-bold transition-colors border-b-2 ${
            viewMode === 'pending-checkins'
              ? 'border-brand-accent text-brand-accent'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Pending Check-in
        </button>
        <button
          onClick={() => setViewMode('pending-checkouts')}
          className={`px-4 py-2 font-bold transition-colors border-b-2 ${
            viewMode === 'pending-checkouts'
              ? 'border-brand-accent text-brand-accent'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Pending Check-out
        </button>
      </div>

      {/* Filters (only for 'all' view) */}
      {viewMode === 'all' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-700">Filter:</span>
            </div>

            <select
              value={filters.status || ''}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value || undefined })
              }
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending Payment</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  startDate: e.target.value || undefined,
                })
              }
              placeholder="From Date"
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none"
            />

            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value || undefined })
              }
              placeholder="To Date"
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none"
            />
          </div>
        </div>
      )}

      {/* Booking List */}
      {loading && allBookings.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">
            {viewMode === 'all'
              ? 'No bookings found'
              : viewMode === 'upcoming'
                ? 'No upcoming bookings'
                : viewMode === 'pending-checkins'
                  ? 'No pending check-ins'
                  : 'No pending check-outs'}
          </p>
        </div>
      ) : (
        <HostBookingList
          bookings={filteredBookings}
          onCheckIn={openCheckInModal}
          onCheckOut={openCheckOutModal}
        />
      )}

      {/* Check-in/Check-out Modal */}
      {modalOpen && selectedBooking && modalType && (
        <CheckInCheckOutModal
          booking={selectedBooking}
          type={modalType}
          onClose={() => {
            setModalOpen(false);
            setSelectedBooking(null);
            setModalType(null);
          }}
          onConfirm={() => {
            if (modalType === 'checkin') {
              handleCheckIn(selectedBooking);
            } else {
              handleCheckOut(selectedBooking);
            }
          }}
        />
      )}
    </div>
  );
}
