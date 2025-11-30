import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Save,
  ArrowLeft,
  MapPin,
  Building2,
  Star,
  Upload,
  X,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import type { Hotel, HotelDTO, Amenity } from '../../../types/host';
import {
  createHotel,
  updateHotel,
  getAmenities,
  uploadHotelImages,
} from '../../../services/hostService';
import { toast } from 'sonner';
import HotelImage from '../../../components/common/HotelImage';

interface HotelFormProps {
  hotel?: Hotel;
  onSuccess: () => void;
  onCancel: () => void;
}

function LocationMarker({
  position,
  setPosition,
}: {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function HotelForm({
  hotel,
  onSuccess,
  onCancel,
}: HotelFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HotelDTO>({
    defaultValues: hotel
      ? {
          name: hotel.name,
          description: hotel.description,
          address: hotel.address,
          city: hotel.city,
          country: hotel.country,
          amenityIds: hotel.amenities.map((a) => a.id),
          latitude: hotel.latitude,
          longitude: hotel.longitude,
        }
      : {
          amenityIds: [],
        },
  });

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(
    hotel?.amenities.map((a) => a.id) || []
  );
  const [location, setLocation] = useState<[number, number] | null>(
    hotel?.latitude && hotel?.longitude
      ? [hotel.latitude, hotel.longitude]
      : null
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    const loadAmenities = async () => {
      try {
        const data = await getAmenities();
        setAmenities(data);
      } catch (error) {
        console.error('Failed to load amenities', error);
        toast.error('Failed to load amenities');
      }
    };
    loadAmenities();
  }, []);

  const handleAmenityToggle = (amenityId: number) => {
    setSelectedAmenities((prev) => {
      const newSelection = prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId];
      setValue('amenityIds', newSelection);
      return newSelection;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...files]);
    }
  };

  const onSubmit = async (data: HotelDTO) => {
    try {
      if (location) {
        data.latitude = location[0];
        data.longitude = location[1];
      }

      let savedHotel;
      if (hotel) {
        savedHotel = await updateHotel(hotel.id, data);
        toast.success('Hotel updated successfully');
      } else {
        savedHotel = await createHotel(data);
        toast.success('Hotel created successfully');
      }

      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => {
          formData.append('files', file);
        });
        await uploadHotelImages(savedHotel.id, formData);
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save hotel', error);
      toast.error('Failed to save hotel');
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
            {hotel ? 'Edit Hotel' : 'Add New Hotel'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-10">
        {/* Basic Info */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Basic Information</h3>
              <p className="text-sm text-slate-500 font-medium">
                Hotel details and description
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Hotel Name
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                placeholder="e.g. Grand Plaza Hotel"
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
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all resize-none"
                placeholder="Describe your property..."
              />
              {errors.description && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.description.message}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Location</h3>
              <p className="text-sm text-slate-500 font-medium">
                Address and map position
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Address
              </label>
              <input
                {...register('address', { required: 'Address is required' })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                placeholder="Street address"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                City
              </label>
              <input
                {...register('city', { required: 'City is required' })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Country
              </label>
              <input
                {...register('country', { required: 'Country is required' })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                placeholder="Country"
              />
            </div>

            <div className="md:col-span-2 h-64 rounded-xl overflow-hidden border border-slate-200 relative z-0">
              <MapContainer
                center={location || [10.762622, 106.660172]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={location} setPosition={setLocation} />
              </MapContainer>
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
              <h3 className="text-lg font-bold">Amenities</h3>
              <p className="text-sm text-slate-500 font-medium">
                Hotel features and services
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
                Showcase your property
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
              id="hotel-images"
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
          {hotel?.images && hotel.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {hotel.images.map((img, idx) => (
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
            {isSubmitting ? 'Saving...' : 'Save Hotel'}
          </button>
        </div>
      </form>
    </div>
  );
}
