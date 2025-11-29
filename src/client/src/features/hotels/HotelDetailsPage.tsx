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

export default function HotelDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
        toast.error('Không thể tải thông tin khách sạn');
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
          ? 'Đã xóa khỏi danh sách yêu thích'
          : 'Đã thêm vào danh sách yêu thích'
      );
    } catch {
      toast.error('Vui lòng đăng nhập để lưu vào danh sách yêu thích');
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
        <h1 className="text-2xl font-bold text-slate-900">
          Không tìm thấy khách sạn
        </h1>
        <button
          onClick={() => navigate('/search')}
          className="px-6 py-2 bg-brand-primary text-white rounded-lg font-bold"
        >
          Quay lại tìm kiếm
        </button>
      </div>
    );
  }

  const amenitiesList = [
    { icon: Wifi, label: 'WiFi miễn phí' },
    { icon: Car, label: 'Bãi đỗ xe' },
    { icon: Utensils, label: 'Nhà hàng' },
    { icon: Wind, label: 'Điều hòa' },
    { icon: Tv, label: 'TV màn hình phẳng' },
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

  // Handle Book button click - require authentication
  const handleBookClick = (roomId: number) => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để đặt phòng');
      navigate(`/login?returnUrl=/hotels/${hotel?.id}?roomId=${roomId}`);
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
          Quay lại tìm kiếm
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
                  {hotel.starRating} Sao
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full text-green-600 font-bold">
                  <CheckCircle className="w-4 h-4" />
                  Đã xác minh
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
                <span className="text-slate-400 text-sm">Giá từ</span>
                <div className="text-3xl font-black text-brand-cta">
                  {minPrice ? formatVND(minPrice) : 'Liên hệ'}
                  <span className="text-sm font-medium text-slate-400">
                    /đêm
                  </span>
                </div>
              </div>
              <button
                onClick={handleSelectRoom}
                className="px-8 py-3 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/20 transition-all hover:scale-105"
              >
                Chọn Phòng
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
                  alt="Thêm hình ảnh"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                  <span className="text-white font-bold text-lg">
                    +{hotel.images.length - 3} Ảnh
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
                Về khách sạn này
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {hotel.description}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Tiện nghi
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
                Chính sách
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 whitespace-pre-line">
                  {hotel.policies ||
                    'Chưa có chính sách cụ thể nào được liệt kê.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Widget */}
          <div className="lg:col-span-1" id="rooms-section">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Phòng có sẵn
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
                          {room.capacity} Khách
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {room.area} m²
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="text-lg font-black text-brand-cta">
                          {formatVND(room.basePrice)}
                          <span className="text-xs font-medium text-slate-400">
                            /đêm
                          </span>
                        </div>
                        <button
                          onClick={() => handleBookClick(room.id)}
                          className="px-4 py-2 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-lg text-sm shadow-lg shadow-brand-cta/20 transition-all"
                        >
                          Đặt phòng
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Không có phòng nào có sẵn cho khách sạn này.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
