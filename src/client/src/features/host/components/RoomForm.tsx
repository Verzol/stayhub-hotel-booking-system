import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Save,
  ArrowLeft,
  Bed,
  Bath,
  Users,
  Square,
  Info,
  Star,
  Upload,
  X,
} from 'lucide-react';
import type { Room, RoomDTO, Amenity, Hotel } from '../../../types/host';
import {
  createRoom,
  updateRoom,
  getAmenities,
  uploadRoomImages,
} from '../../../services/hostService';
import { toast } from 'sonner';
import HotelImage from '../../../components/common/HotelImage';

interface RoomFormProps {
  hotel: Hotel;
  room?: Room;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RoomForm({
  hotel,
  room,
  onSuccess,
  onCancel,
}: RoomFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RoomDTO>({
    defaultValues: room
      ? {
          name: room.name,
          description: room.description,
          basePrice: room.basePrice,
          capacity: room.capacity,
          area: room.area,
          bedrooms: room.bedrooms,
          bathrooms: room.bathrooms,
          bedConfig: room.bedConfig,
          quantity: room.quantity,
          amenityIds: room.amenities?.map((a) => a.id) || [],
        }
      : {
          capacity: 2,
          bedrooms: 1,
          bathrooms: 1,
          quantity: 1,
          amenityIds: [],
        },
  });

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(
    room?.amenities?.map((a) => a.id) || []
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    const loadAmenities = async () => {
      try {
        const data = await getAmenities();
        setAmenities(data);
      } catch (error) {
        console.error('Failed to load amenities', error);
      }
    };
    loadAmenities();
  }, []);

  const handleAmenityToggle = (id: number) => {
    setSelectedAmenities((prev) => {
      const newAmenities = prev.includes(id)
        ? prev.filter((a) => a !== id)
        : [...prev, id];

      // Explicitly update form value to ensure it's tracked
      setValue('amenityIds', newAmenities, { shouldDirty: true });
      return newAmenities;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...files]);
    }
  };

  const onSubmit = async (data: RoomDTO) => {
    try {
      // Ensure amenityIds are included from state if not in data
      const payload = { ...data, amenityIds: selectedAmenities };

      let savedRoom;
      if (room) {
        savedRoom = await updateRoom(room.id, payload);
        toast.success('Room updated successfully');
      } else {
        savedRoom = await createRoom(hotel.id, payload);
        toast.success('Room created successfully');
      }

      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => {
          formData.append('files', file);
        });
        await uploadRoomImages(savedRoom.id, formData);
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save room', error);
      toast.error('Failed to save room');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <h2 className="text-xl font-bold text-slate-900">
            {room ? 'Edit Room' : 'Add New Room'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-10">
        {/* Basic Info */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Room Details</h3>
              <p className="text-sm text-slate-500 font-medium">
                Basic information about the room
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Room Name
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                placeholder="e.g. Deluxe Ocean View"
              />
              {errors.name && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description', {
                  required: 'Description is required',
                })}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all resize-none"
                placeholder="Describe the room..."
              />
              {errors.description && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.description.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Base Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('basePrice', {
                  required: 'Price is required',
                  valueAsNumber: true,
                })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                {...register('quantity', {
                  required: 'Quantity is required',
                  valueAsNumber: true,
                  min: 1,
                })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Specs */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Specifications</h3>
              <p className="text-sm text-slate-500 font-medium">
                Capacity and layout
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                Capacity
              </label>
              <input
                type="number"
                {...register('capacity', { valueAsNumber: true, min: 1 })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Square className="w-4 h-4 text-slate-400" />
                Area (m²)
              </label>
              <input
                type="number"
                step="0.1"
                {...register('area', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Bed className="w-4 h-4 text-slate-400" />
                Bedrooms
              </label>
              <input
                type="number"
                {...register('bedrooms', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Bath className="w-4 h-4 text-slate-400" />
                Bathrooms
              </label>
              <input
                type="number"
                {...register('bathrooms', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Bed Configuration
              </label>
              <input
                {...register('bedConfig')}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                placeholder="e.g. 1 King Bed, 2 Twin Beds"
              />
            </div>
          </div>
        </section>

        {/* Amenities */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Room Amenities</h3>
              <p className="text-sm text-slate-500 font-medium">
                Special features for this room
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {amenities.map((amenity) => (
              <label
                key={amenity.id}
                className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-brand-accent transition-all group"
              >
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity.id)}
                  onChange={() => handleAmenityToggle(amenity.id)}
                  className="w-5 h-5 text-brand-accent rounded focus:ring-brand-accent transition-all"
                />
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                  {amenity.name}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Images */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Gallery</h3>
              <p className="text-sm text-slate-500 font-medium">
                Showcase your room
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-brand-accent hover:bg-brand-accent/5 transition-all group cursor-pointer relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="room-images"
            />
            <div className="flex flex-col items-center pointer-events-none">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-brand-accent transition-colors" />
              </div>
              <span className="text-lg font-bold text-slate-900 mb-1">
                Click to upload images
              </span>
              <span className="text-sm text-slate-500">
                SVG, PNG, JPG or GIF (max. 800x400px)
              </span>
            </div>
          </div>

          {/* Existing Images */}
          {room?.images && room.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {room.images.map((img, idx) => (
                <div
                  key={`existing-${idx}`}
                  className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 group shadow-sm hover:shadow-md transition-all"
                >
                  <HotelImage
                    src={img.url}
                    alt={`Existing ${idx}`}
                    className="w-full h-full"
                    aspectRatio="16/9"
                    lazy={true}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              ))}
            </div>
          )}

          {/* New Images */}
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {imageFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 group shadow-sm hover:shadow-md transition-all"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <button
                    type="button"
                    onClick={() =>
                      setImageFiles((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-full text-slate-600 hover:text-red-500 hover:bg-white transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100 sticky bottom-0 bg-white/80 backdrop-blur p-4 -mx-8 -mb-8 mt-8">
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
