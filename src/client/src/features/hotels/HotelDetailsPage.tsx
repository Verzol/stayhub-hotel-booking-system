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
  Users,
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
import { formatVND } from '../../utils/currency';
import { useAuth } from '../../context/AuthContext';
import HotelImage from '../../components/common/HotelImage';
import { getReviewsByHotel, type Review } from '../../services/reviewService';
import { MessageCircle } from 'lucide-react';

export default function HotelDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

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
        setWishlist(
          Array.isArray(data) ? data.map((item: Wishlist) => item.hotelId) : []
        );
      } catch {
        // Ignore error if not logged in
      }
    };
    fetchWishlist();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      try {
        setLoadingReviews(true);
        const data = await getReviewsByHotel(Number(id));
        // Ensure data is always an array
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load reviews:', error);
        // Ensure reviews is always an array even on error
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [id]);

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
          Back to search
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

  // Get minimum price from rooms
  const minPrice =
    hotel.rooms && hotel.rooms.length > 0
      ? Math.min(...hotel.rooms.map((r) => r.basePrice))
      : null;

  // Handle Select Room button - scroll to rooms section (no login required to view)
  const handleSelectRoom = () => {
    const roomsSection = document.getElementById('rooms-section');
    if (roomsSection) {
      roomsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle Book button click - require authentication and CUSTOMER role
  const handleBookClick = (roomId: number) => {
    if (!isAuthenticated) {
      toast.info('Please login to book');
      navigate(`/login?returnUrl=/hotels/${hotel?.id}?roomId=${roomId}`);
      return;
    }

    // Block HOST from booking (they can only manage)
    if (user?.role === 'HOST') {
      toast.error(
        'You are logged in as a Host. Please login as a customer to book.'
      );
      return;
    }

    const params = new URLSearchParams();
    params.set('roomId', roomId.toString());
    params.set('hotelId', hotel.id.toString());
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('checkIn'))
      params.set('checkIn', searchParams.get('checkIn')!);
    if (searchParams.get('checkOut'))
      params.set('checkOut', searchParams.get('checkOut')!);
    if (searchParams.get('guests'))
      params.set('guests', searchParams.get('guests')!);

    navigate(`/booking?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to search
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
                  Verified
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end justify-center">
              <div className="flex items-center gap-4 mb-4">
                {isAuthenticated &&
                  hotel.ownerId &&
                  user?.id !== hotel.ownerId && (
                    <button
                      onClick={() => navigate(`/chat/${hotel.ownerId}`)}
                      className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group"
                      title="Chat with host"
                    >
                      <MessageCircle className="w-6 h-6 text-slate-400 group-hover:text-brand-accent transition-colors" />
                    </button>
                  )}
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
                <span className="text-slate-400 text-sm">Price from</span>
                <div className="text-3xl font-black text-brand-cta flex items-baseline justify-end gap-1 flex-wrap">
                  <span className="whitespace-nowrap">
                    {minPrice
                      ? formatVND(minPrice, { symbol: 'VND' })
                      : 'Contact'}
                  </span>
                  <span className="text-sm font-medium text-slate-400 whitespace-nowrap">
                    /night
                  </span>
                </div>
              </div>
              <button
                onClick={handleSelectRoom}
                className="px-8 py-3 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/20 transition-all hover:scale-105"
              >
                Select Room
              </button>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 aspect-video rounded-3xl overflow-hidden shadow-lg">
            <HotelImage
              src={hotel.images?.[activeImage]?.url || null}
              alt={hotel.name}
              className="w-full h-full"
              aspectRatio="16/9"
              lazy={false}
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
                <HotelImage
                  src={img.url}
                  alt={`Gallery ${idx}`}
                  className="w-full h-full"
                  aspectRatio="16/9"
                  lazy={true}
                />
              </div>
            ))}
            {hotel.images && hotel.images.length > 3 && (
              <div className="relative rounded-2xl overflow-hidden cursor-pointer group">
                <HotelImage
                  src={hotel.images[3].url}
                  alt="More photos"
                  className="w-full h-full"
                  aspectRatio="16/9"
                  lazy={true}
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

            {/* Reviews Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Reviews ({reviews.length})
                </h2>
              </div>

              {loadingReviews ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-accent" />
                </div>
              ) : Array.isArray(reviews) && reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => {
                    let photoUrls: string[] = [];
                    if (review.images) {
                      try {
                        photoUrls = JSON.parse(review.images);
                      } catch {
                        photoUrls = [];
                      }
                    }
                    return (
                      <div
                        key={review.id}
                        className="border-b border-slate-200 pb-6 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-accent to-brand-dark flex items-center justify-center text-white font-bold flex-shrink-0">
                            U
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-slate-500">
                                {new Date(review.createdAt).toLocaleDateString(
                                  'en-US',
                                  {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  }
                                )}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-slate-700 mb-3 leading-relaxed">
                                {review.comment}
                              </p>
                            )}
                            {photoUrls.length > 0 && (
                              <div className="grid grid-cols-3 gap-2 mt-3">
                                {photoUrls.map((url, idx) => (
                                  <div
                                    key={idx}
                                    className="aspect-square rounded-lg overflow-hidden"
                                  >
                                    <img
                                      src={
                                        url.startsWith('http')
                                          ? url
                                          : `http://localhost:8080${url}`
                                      }
                                      alt={`Review photo ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">
                    No reviews yet for this hotel
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Booking Widget */}
          <div className="lg:col-span-1" id="rooms-section">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Available Rooms
              </h3>

              {hotel.rooms && hotel.rooms.length > 0 ? (
                <div className="space-y-4">
                  {hotel.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-brand-accent transition-colors"
                    >
                      <h4 className="font-bold text-slate-900 mb-1">
                        {room.name}
                      </h4>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                        {room.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {room.capacity} Guests
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {room.area} m²
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="text-lg font-black text-brand-cta flex items-baseline gap-1 flex-wrap">
                          <span className="whitespace-nowrap">
                            {formatVND(room.basePrice, { symbol: 'VND' })}
                          </span>
                          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                            /night
                          </span>
                        </div>
                        <button
                          onClick={() => handleBookClick(room.id)}
                          className="px-4 py-2 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-lg text-sm shadow-lg shadow-brand-cta/20 transition-all"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No rooms available for this hotel.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
