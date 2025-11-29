import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Edit,
  Calendar,
  Bed,
  Bath,
  Users,
  ArrowLeft,
  Square,
} from 'lucide-react';
import type { Room, Hotel } from '../../../types/host';
import { getHotelRooms } from '../../../services/hostService';
import { toast } from 'sonner';

interface RoomListProps {
  hotel: Hotel;
  onEdit: (room: Room) => void;
  onAvailability: (room: Room) => void;
  onCreate: () => void;
  onBack: () => void;
}

export default function RoomList({
  hotel,
  onEdit,
  onAvailability,
  onCreate,
  onBack,
}: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHotelRooms(hotel.id);
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [hotel.id]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Rooms</h2>
            <p className="text-slate-500 font-medium">
              Manage rooms for {hotel.name}
            </p>
          </div>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-cta hover:bg-brand-cta-hover text-white rounded-xl transition-all shadow-lg shadow-brand-cta/30 font-bold text-sm hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Room
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-64 bg-slate-50 rounded-2xl animate-pulse border border-slate-100"
            />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Bed className="w-12 h-12 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            No rooms found
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
            Add rooms to your hotel to start accepting bookings.
          </p>
          <button
            onClick={onCreate}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Add First Room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-brand-accent/30 transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative aspect-video bg-slate-100 overflow-hidden">
                {room.images && room.images.length > 0 ? (
                  <img
                    src={
                      room.images[0].url.startsWith('http')
                        ? room.images[0].url
                        : `http://localhost:8080${room.images[0].url}`
                    }
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Bed className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-bold text-slate-900 shadow-sm">
                  ${room.basePrice}
                  <span className="text-slate-500 font-normal text-xs ml-1">
                    /night
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-xl text-slate-900 group-hover:text-brand-accent transition-colors">
                    {room.name}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mt-1">
                    {room.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">
                      {room.capacity} Guests
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    <Bed className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">
                      {room.bedrooms} Beds
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    <Bath className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">
                      {room.bathrooms} Baths
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    <Square className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">
                      {room.area}m²
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => onAvailability(room)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl font-bold text-sm transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Availability
                  </button>
                  <button
                    onClick={() => onEdit(room)}
                    className="px-4 py-3 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
