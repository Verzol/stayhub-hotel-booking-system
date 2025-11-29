import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHotelDetails } from '../../services/searchService';
import type { Hotel } from '../../types/host';
import {
  toggleWishlist,
  getMyWishlist,
  type Wishlist,
} from '../../services/wishlistService';
import {
  Loader2,
  MapPin,
  Star,
  Wifi,
  Car,
  Utensils,
  Wind,
  Tv,
  ArrowLeft,
  CheckCircle,
  Heart,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HotelDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);

  useEffect(() => {
    const fetchHotel = async () => {
      if (!id) return;
      try {
        const data = await getHotelDetails(Number(id));
        setHotel(data);
      } catch (error) {
        console.error('Failed to load hotel details', error);
        toast.error('Failed to load hotel details');
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await getMyWishlist();
        setWishlist(data.map((item: Wishlist) => item.hotelId));
      } catch {
        // Ignore error if not logged in
      }
    };
    fetchWishlist();
  }, []);

  const handleToggleWishlist = async () => {
    if (!hotel) return;
    try {
      await toggleWishlist(hotel.id);
      setWishlist((prev) =>
        prev.includes(hotel.id)
          ? prev.filter((id) => id !== hotel.id)
          : [...prev, hotel.id]
      );
      toast.success(
        wishlist.includes(hotel.id)
          ? 'Removed from wishlist'
          : 'Added to wishlist'
      );
    } catch {
      toast.error('Please login to save to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Hotel not found</h1>
        <button
          onClick={() => navigate('/search')}
          className="px-6 py-2 bg-brand-primary text-white rounded-lg font-bold"
        >
          Back to Search
        </button>
      </div>
    );
  }

  const amenitiesList = [
    { icon: Wifi, label: 'Free WiFi' },
    { icon: Car, label: 'Parking' },
    { icon: Utensils, label: 'Restaurant' },
    { icon: Wind, label: 'Air Conditioning' },
    { icon: Tv, label: 'Flat-screen TV' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Search
        </button>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">
                {hotel.name}
              </h1>
              <div className="flex items-center gap-2 text-slate-500 mb-4">
                <MapPin className="w-5 h-5 text-brand-accent" />
                {hotel.address}, {hotel.city}, {hotel.country}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 px-3 py-1 bg-brand-accent/10 rounded-full text-brand-accent font-bold">
                  <Star className="w-4 h-4 fill-brand-accent" />
                  {hotel.starRating} Stars
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full text-green-600 font-bold">
                  <CheckCircle className="w-4 h-4" />
                  Verified Stay
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end justify-center">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={handleToggleWishlist}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${
                      hotel && wishlist.includes(hotel.id)
                        ? 'text-red-500 fill-red-500'
                        : 'text-slate-400 group-hover:text-red-500'
                    }`}
                  />
                </button>
              </div>
              <div className="text-right mb-2">
                <span className="text-slate-400 text-sm">Starting from</span>
                <div className="text-3xl font-black text-brand-cta">
                  $100
                  <span className="text-sm font-medium text-slate-400">
                    /night
                  </span>
                </div>
              </div>
              <button className="px-8 py-3 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/20 transition-all hover:scale-105">
                Select Room
              </button>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 aspect-video rounded-3xl overflow-hidden shadow-lg">
            <img
              src={
                hotel.images?.[activeImage]?.url
                  ? hotel.images[activeImage].url.startsWith('http')
                    ? hotel.images[activeImage].url
                    : `http://localhost:8080${hotel.images[activeImage].url}`
                  : '/placeholder-hotel.jpg'
              }
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 h-full">
            {hotel.images?.slice(0, 3).map((img, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                  activeImage === idx
                    ? 'border-brand-accent ring-2 ring-brand-accent/20'
                    : 'border-transparent hover:border-slate-300'
                }`}
                onClick={() => setActiveImage(idx)}
              >
                <img
                  src={
                    img.url.startsWith('http')
                      ? img.url
                      : `http://localhost:8080${img.url}`
                  }
                  alt={`Gallery ${idx}`}
                  className="w-full h-full object-cover aspect-video lg:aspect-auto"
                />
              </div>
            ))}
            {hotel.images && hotel.images.length > 3 && (
              <div className="relative rounded-2xl overflow-hidden cursor-pointer group">
                <img
                  src={
                    hotel.images[3].url.startsWith('http')
                      ? hotel.images[3].url
                      : `http://localhost:8080${hotel.images[3].url}`
                  }
                  alt="More photos"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                  <span className="text-white font-bold text-lg">
                    +{hotel.images.length - 3} Photos
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Description & Amenities */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                About this hotel
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {hotel.description}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenitiesList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl"
                  >
                    <item.icon className="w-5 h-5 text-brand-accent" />
                    <span className="font-medium text-slate-700">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Policies
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 whitespace-pre-line">
                  {hotel.policies || 'No specific policies listed.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Widget (Placeholder) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Book your stay
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Check-in / Check-out
                  </label>
                  <div className="font-medium text-slate-900">Select Dates</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Guests
                  </label>
                  <div className="font-medium text-slate-900">
                    2 Adults, 0 Children
                  </div>
                </div>
                <button className="w-full py-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/20 transition-all">
                  Check Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
