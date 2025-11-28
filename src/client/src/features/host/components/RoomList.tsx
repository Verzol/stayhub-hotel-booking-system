import { useEffect, useState } from 'react';
import { Plus, Edit, Calendar, Bed, Bath, Users, ArrowLeft } from 'lucide-react';
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

export default function RoomList({ hotel, onEdit, onAvailability, onCreate, onBack }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, [hotel.id]);

  const loadRooms = async () => {
    try {
      const data = await getHotelRooms(hotel.id);
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading rooms...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Rooms</h2>
            <p className="text-slate-500 font-medium">Manage rooms for {hotel.name}</p>
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

      {rooms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bed className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No rooms found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
            Add rooms to your hotel to start accepting bookings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{room.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-1">{room.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-brand-dark">${room.basePrice}</div>
                  <div className="text-xs text-slate-400 font-medium">/night</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{room.capacity} Guests</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                  <Bed className="w-4 h-4" />
                  <span className="font-medium">{room.bedrooms} Beds</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                  <Bath className="w-4 h-4" />
                  <span className="font-medium">{room.bathrooms} Baths</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => onAvailability(room)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl font-bold text-sm transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Availability
                </button>
                <button
                  onClick={() => onEdit(room)}
                  className="p-2 text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 rounded-xl transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
