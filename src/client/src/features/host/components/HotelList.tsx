import { useEffect, useState } from 'react';
import { Plus, MapPin, Star, Edit, MoreHorizontal, Building2 } from 'lucide-react';
import type { Hotel } from '../../../types/host';
import { getMyHotels } from '../../../services/hostService';
import { toast } from 'sonner';

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

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const data = await getMyHotels();
      setHotels(data);
    } catch (error) {
      console.error('Failed to load hotels', error);
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading hotels...</div>;
  }

  if (hotels.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No hotels found</h3>
        <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
          Create your first hotel to start hosting guests.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-8 py-4 bg-brand-cta hover:bg-brand-cta-hover text-white rounded-xl transition-all shadow-lg shadow-brand-cta/30 font-bold hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Your First Hotel
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {hotels.map((hotel) => (
        <div
          key={hotel.id}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
        >
          {/* Image Placeholder or First Image */}
          <div className="relative aspect-[4/3] bg-slate-200 overflow-hidden">
            {hotel.images && hotel.images.length > 0 ? (
              <img
                src={hotel.images[0]}
                alt={hotel.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Building2 className="w-12 h-12" />
              </div>
            )}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/40 transition-colors text-white">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-brand-accent transition-colors">
                {hotel.name}
              </h3>
              <div className="flex items-center gap-1 text-sm bg-yellow-50 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-slate-900">{hotel.starRating}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-4 font-medium">
              <MapPin className="w-4 h-4 text-brand-accent" />
              <span className="line-clamp-1">
                {hotel.city}, {hotel.country}
              </span>
            </div>

            <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
              {hotel.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-2">
              <button
                onClick={() => onManageRooms(hotel)}
                className="flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-bold transition-colors"
              >
                Rooms
              </button>
              <button
                onClick={() => onManagePromotions(hotel)}
                className="flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-bold transition-colors"
              >
                Promos
              </button>
              <button
                onClick={() => onEdit(hotel)}
                className="p-2 text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Add New Card */}
      <button
        onClick={onCreate}
        className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 hover:border-brand-accent hover:bg-brand-accent/5 transition-all group min-h-[300px]"
      >
        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Plus className="w-8 h-8 text-brand-accent" />
        </div>
        <span className="font-bold text-lg text-slate-900">Add New Hotel</span>
      </button>
    </div>
  );
}
