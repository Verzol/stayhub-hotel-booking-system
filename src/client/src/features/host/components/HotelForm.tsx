import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Save, ArrowLeft, Search } from 'lucide-react';
import type { Hotel, HotelDTO, Amenity } from '../../../types/host';
import { createHotel, updateHotel, getAmenities } from '../../../services/hostService';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface HotelFormProps {
  hotel?: Hotel;
  onSuccess: () => void;
  onCancel: () => void;
}

// Map Component to handle clicks
function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function HotelForm({ hotel, onSuccess, onCancel }: HotelFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<HotelDTO>({
    defaultValues: hotel ? {
      name: hotel.name,
      description: hotel.description,
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      starRating: hotel.starRating,
      checkInTime: hotel.checkInTime,
      checkOutTime: hotel.checkOutTime,
      policies: hotel.policies,
      amenityIds: hotel.amenityIds || [],
    } : {
      starRating: 3,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      amenityIds: [],
      latitude: 16.0544, // Default to Da Nang
      longitude: 108.2022
    }
  });

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(hotel?.amenityIds || []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(
    hotel ? [hotel.latitude, hotel.longitude] : [16.0544, 108.2022]
  );

  // Watch address fields for search
  const address = watch('address');
  const city = watch('city');

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
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleMapClick = (pos: [number, number]) => {
    setMapPosition(pos);
    setValue('latitude', pos[0]);
    setValue('longitude', pos[1]);
  };

  const handleSearchLocation = async () => {
    if (!address && !city) {
      toast.error('Please enter an address or city to search');
      return;
    }
    
    const query = `${address || ''}, ${city || ''}`;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapPosition([lat, lon]);
        setValue('latitude', lat);
        setValue('longitude', lon);
        toast.success('Location found!');
      } else {
        toast.error('Location not found');
      }
    } catch (error) {
      console.error('Search failed', error);
      toast.error('Failed to search location');
    }
  };

  const onSubmit = async (data: HotelDTO) => {
    try {
      const payload = { ...data, amenityIds: selectedAmenities };

      if (hotel) {
        await updateHotel(hotel.id, payload);
        toast.success('Hotel updated successfully');
      } else {
        await createHotel(payload);
        toast.success('Hotel created successfully');
      }

      // Handle Image Upload (Mock)
      if (imageFiles.length > 0) {
        toast.info('Image upload not fully implemented without storage service');
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save hotel', error);
      toast.error('Failed to save hotel');
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
            {hotel ? 'Edit Hotel' : 'Create New Hotel'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Hotel Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                placeholder="e.g. Sunrise Beach Resort"
              />
              {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                placeholder="Describe your property..."
              />
              {errors.description && <span className="text-red-500 text-xs mt-1">{errors.description.message}</span>}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Location</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
              <div className="flex gap-2">
                <input
                  {...register('address', { required: 'Address is required' })}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                  placeholder="Street address"
                />
                <button
                  type="button"
                  onClick={handleSearchLocation}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Search on Map
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
              <input
                {...register('city', { required: 'City is required' })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
              <input
                {...register('country', { required: 'Country is required' })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Map */}
          <div className="h-[400px] rounded-2xl overflow-hidden border border-slate-200 relative z-0">
            <MapContainer 
              center={mapPosition || [16.0544, 108.2022]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={mapPosition} setPosition={handleMapClick} />
            </MapContainer>
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow-lg text-xs font-medium z-[1000]">
              Click on map to set exact location
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Latitude</label>
              <input
                type="number"
                step="any"
                {...register('latitude', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Longitude</label>
              <input
                type="number"
                step="any"
                {...register('longitude', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Details & Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Star Rating</label>
              <select
                {...register('starRating', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              >
                {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Stars</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Check-in Time</label>
              <input
                type="time"
                {...register('checkInTime')}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Check-out Time</label>
              <input
                type="time"
                {...register('checkOutTime')}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-bold text-slate-700 mb-2">Policies</label>
              <textarea
                {...register('policies')}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                placeholder="Cancellation policy, house rules, etc."
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Amenities</h3>
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

        {/* Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Gallery</h3>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-brand-accent hover:bg-brand-accent/5 transition-all">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="hotel-images"
            />
            <label htmlFor="hotel-images" className="cursor-pointer flex flex-col items-center">
              <Upload className="w-10 h-10 text-slate-400 mb-4" />
              <span className="text-lg font-bold text-slate-900 mb-1">Click to upload images</span>
              <span className="text-sm text-slate-500">SVG, PNG, JPG or GIF (max. 800x400px)</span>
            </label>
          </div>
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {imageFiles.map((file, idx) => (
                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                  <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageFiles(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
            {isSubmitting ? 'Saving...' : 'Save Hotel'}
          </button>
        </div>
      </form>
    </div>
  );
}
