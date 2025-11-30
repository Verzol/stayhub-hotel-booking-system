import { useState, useEffect } from 'react';
import { getCachedHotels } from '../../../utils/cachedServices';
import type { Hotel } from '../../../types/host';
import HostBookingManagement from './HostBookingManagement';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function HostBookingManagementWrapper() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      // Use cached version for faster load
      const data = await getCachedHotels();
      setHotels(data);
      if (data.length > 0) {
        setSelectedHotelId(data[0].id || null);
      }
    } catch (error) {
      console.error('Failed to load hotels', error);
      toast.error('Không thể tải danh sách khách sạn');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500 font-bold">
          Bạn chưa có khách sạn nào. Hãy tạo khách sạn trước để quản lý đặt
          phòng.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hotel Selector */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200">
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Chọn khách sạn
        </label>
        <select
          value={selectedHotelId || ''}
          onChange={(e) => setSelectedHotelId(Number(e.target.value))}
          className="w-full md:w-auto px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none"
        >
          {hotels.map((hotel) => (
            <option key={hotel.id} value={hotel.id}>
              {hotel.name}
            </option>
          ))}
        </select>
      </div>

      {/* Booking Management */}
      {selectedHotelId && <HostBookingManagement hotelId={selectedHotelId} />}
    </div>
  );
}
