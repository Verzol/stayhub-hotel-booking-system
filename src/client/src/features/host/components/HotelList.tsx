import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Edit,
  MapPin,
  Star,
  Building2,
  Image as ImageIcon,
} from 'lucide-react';
import type { Hotel } from '../../../types/host';
import { toast } from 'sonner';
import HotelImage from '../../../components/common/HotelImage';
import { getCachedHotels } from '../../../utils/cachedServices';
import { HotelCardSkeleton } from '../../../components/common/Skeleton';

interface HotelListProps {
  onEdit: (hotel: Hotel) => void;
  onManageRooms: (hotel: Hotel) => void;
  onManagePromotions: (hotel: Hotel) => void;
  onCreate: () => void;
}

export default function HotelList({
  onEdit,
  onManageRooms,
  onManagePromotions,
  onCreate,
}: HotelListProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHotels = useCallback(async () => {
    try {
      // Use cached version for faster load
      const data = await getCachedHotels();
      setHotels(data);
    } catch (error) {
      console.error('Failed to load hotels', error);
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <HotelCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <Building2 className="w-12 h-12 text-brand-accent" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          No hotels found
        </h3>
        <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
          Get started by adding your first hotel property to manage rooms and
          bookings.
        </p>
        <button
          onClick={onCreate}
          className="px-8 py-4 bg-brand-cta hover:bg-brand-cta-hover text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-cta/30 hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          Add Your First Hotel
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {hotels.map((hotel) => (
        <div
          key={hotel.id}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-brand-accent/30 transition-all duration-300 group flex flex-col h-full"
        >
          {/* Image */}
          <div className="relative h-56 bg-slate-100 overflow-hidden">
            {hotel.images && hotel.images.length > 0 ? (
              <HotelImage
                src={hotel.images[0].url}
                alt={hotel.name}
                className="w-full h-full group-hover:scale-110 transition-transform duration-700"
                aspectRatio="auto"
                lazy={true}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                <ImageIcon className="w-12 h-12" />
              </div>
            )}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 shadow-sm flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              {hotel.starRating || 'New'}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-4">
              <h3 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-brand-accent transition-colors line-clamp-1">
                {hotel.name}
              </h3>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <MapPin className="w-4 h-4 text-brand-accent" />
                <span className="line-clamp-1">
                  {hotel.address || 'No address set'}
                </span>
              </div>
            </div>

            <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">
              {hotel.description}
            </p>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-100">
              <button
                onClick={() => onManageRooms(hotel)}
                className="px-4 py-2.5 bg-brand-accent/10 text-brand-accent hover:bg-brand-accent hover:text-white rounded-xl font-bold text-sm transition-all text-center"
              >
                Manage Rooms
              </button>
              <button
                onClick={() => onManagePromotions(hotel)}
                className="px-4 py-2.5 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white rounded-xl font-bold text-sm transition-all text-center"
              >
                Promotions
              </button>
              <button
                onClick={() => onEdit(hotel)}
                className="col-span-2 px-4 py-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Hotel Details
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Add New Card */}
      <button
        onClick={onCreate}
        className="min-h-[400px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-accent hover:bg-brand-accent/5 transition-all flex flex-col items-center justify-center gap-4 group"
      >
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
          <Plus className="w-8 h-8 text-slate-400 group-hover:text-brand-accent transition-colors" />
        </div>
        <span className="font-bold text-slate-600 group-hover:text-brand-accent transition-colors">
          Add Another Hotel
        </span>
      </button>
    </div>
  );
}
