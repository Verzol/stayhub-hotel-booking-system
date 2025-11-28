import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, ArrowLeft } from 'lucide-react';
import type { Room, RoomDTO, Amenity, Hotel } from '../../../types/host';
import { createRoom, updateRoom, getAmenities } from '../../../services/hostService';
import { toast } from 'sonner';

interface RoomFormProps {
  hotel: Hotel;
  room?: Room;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RoomForm({ hotel, room, onSuccess, onCancel }: RoomFormProps) {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<RoomDTO>({
    defaultValues: room ? {
      name: room.name,
      description: room.description,
      basePrice: room.basePrice,
      capacity: room.capacity,
      area: room.area,
      bedrooms: room.bedrooms,
      bathrooms: room.bathrooms,
      bedConfig: room.bedConfig,
      quantity: room.quantity,
      amenityIds: room.amenityIds || [],
    } : {
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      quantity: 1,
      amenityIds: [],
    }
  });

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(room?.amenityIds || []);

  useEffect(() => {
    loadAmenities();
  }, []);

  const loadAmenities = async () => {
    try {
      const data = await getAmenities();
      setAmenities(data);
    } catch (error) {
      console.error('Failed to load amenities', error);
    }
  };

  const handleAmenityToggle = (id: number) => {
    const newAmenities = selectedAmenities.includes(id)
      ? selectedAmenities.filter(a => a !== id)
      : [...selectedAmenities, id];
    
    setSelectedAmenities(newAmenities);
    // Explicitly update form value to ensure it's tracked
    setValue('amenityIds', newAmenities, { shouldDirty: true });
  };

  const onSubmit = async (data: RoomDTO) => {
    try {
      // Ensure amenityIds are included from state if not in data
      const payload = { ...data, amenityIds: selectedAmenities };
      
      if (room) {
        await updateRoom(room.id, payload);
        toast.success('Room updated successfully');
      } else {
        await createRoom(hotel.id, payload);
        toast.success('Room created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save room', error);
      toast.error('Failed to save room');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <h2 className="text-xl font-bold text-slate-900">
            {room ? 'Edit Room' : 'Add New Room'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Room Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Room Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                placeholder="e.g. Deluxe Ocean View"
              />
              {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                placeholder="Describe the room..."
              />
              {errors.description && <span className="text-red-500 text-xs mt-1">{errors.description.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Base Price ($)</label>
              <input
                type="number"
                step="0.01"
                {...register('basePrice', { required: 'Price is required', valueAsNumber: true })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Quantity</label>
              <input
                type="number"
                {...register('quantity', { required: 'Quantity is required', valueAsNumber: true, min: 1 })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Specifications</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Capacity (Guests)</label>
              <input
                type="number"
                {...register('capacity', { valueAsNumber: true, min: 1 })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Area (m²)</label>
              <input
                type="number"
                step="0.1"
                {...register('area', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bedrooms</label>
              <input
                type="number"
                {...register('bedrooms', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bathrooms</label>
              <input
                type="number"
                {...register('bathrooms', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">Bed Configuration</label>
              <input
                {...register('bedConfig')}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                placeholder="e.g. 1 King Bed, 2 Twin Beds"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Room Amenities</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {amenities.map(amenity => (
              <label key={amenity.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity.id)}
                  onChange={() => handleAmenityToggle(amenity.id)}
                  className="w-5 h-5 text-brand-accent rounded focus:ring-brand-accent"
                />
                <span className="text-sm font-medium text-slate-700">{amenity.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? 'Saving...' : 'Save Room'}
          </button>
        </div>
      </form>
    </div>
  );
}
