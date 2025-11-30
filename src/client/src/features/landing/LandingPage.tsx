import {
  ShieldCheck,
  Star,
  Headphones,
  MapPin,
  Hotel as HotelIcon,
  ArrowRight,
  Heart,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  CreditCard,
  Globe,
  CheckCircle,
  ChevronRight,
  Play,
  Quote,
  Users,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import SearchBar from '../search/components/SearchBar';
import { searchHotels } from '../../services/searchService';
import type { Hotel } from '../../types/host';
import {
  toggleWishlist,
  getMyWishlist,
  type Wishlist,
} from '../../services/wishlistService';
import { toast } from 'sonner';
import HotelImage from '../../components/common/HotelImage';
import { HotelCardSkeleton } from '../../components/common/Skeleton';
import { useNavigate, Link } from 'react-router-dom';
import { formatVND } from '../../utils/currency';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeDestination, setActiveDestination] = useState(0);
  const [featuredProperties, setFeaturedProperties] = useState<Hotel[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Fetch top 4 hotels (using default sort or specific logic if available)
        const data = await searchHotels({ size: 4 });
        console.log('Featured properties response:', data);

        // Handle both direct Page response and wrapped response
        if (data && typeof data === 'object') {
          if (Array.isArray(data)) {
            // If data is directly an array
            setFeaturedProperties(data);
          } else if ('content' in data && Array.isArray(data.content)) {
            // If data has content property (Page object)
            setFeaturedProperties(data.content);
          } else {
            console.warn('Unexpected data structure:', data);
            setFeaturedProperties([]);
          }
        } else {
          setFeaturedProperties([]);
        }
      } catch (error) {
        console.error('Failed to fetch featured properties', error);
        setFeaturedProperties([]);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  const [wishlist, setWishlist] = useState<number[]>([]);

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

  const handleToggleWishlist = async (e: React.MouseEvent, hotelId: number) => {
    e.stopPropagation(); // Prevent navigation
    try {
      await toggleWishlist(hotelId);
      setWishlist((prev) =>
        prev.includes(hotelId)
          ? prev.filter((id) => id !== hotelId)
          : [...prev, hotelId]
      );
      toast.success(
        wishlist.includes(hotelId)
          ? 'Removed from wishlist'
          : 'Added to wishlist'
      );
    } catch {
      toast.error('Please login to save to wishlist');
    }
  };

  const destinations = [
    {
      name: 'Da Nang',
      img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800',
      properties: 1200,
      rating: 4.8,
    },
    {
      name: 'Ho Chi Minh City',
      img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800',
      properties: 2500,
      rating: 4.7,
    },
    {
      name: 'Hanoi',
      img: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800',
      properties: 1800,
      rating: 4.9,
    },
    {
      name: 'Phu Quoc',
      img: 'https://images.unsplash.com/photo-1540202404-a6f746353673?q=80&w=800',
      properties: 650,
      rating: 4.8,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      avatar: 'S',
      role: 'Travel Blogger',
      text: 'StayHub made finding the perfect hotel so easy! The booking process was seamless and I got an amazing deal.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      avatar: 'M',
      role: 'Business Traveler',
      text: 'I use StayHub for all my business trips. The customer service is exceptional and the prices are unbeatable.',
      rating: 5,
    },
    {
      name: 'Emily Davis',
      avatar: 'E',
      role: 'Family Vacation',
      text: 'Found the perfect family resort through StayHub. The kids loved it and we got 30% off! Highly recommend.',
      rating: 5,
    },
  ];

  const stats = [
    { number: '50K+', label: 'Khách hàng hài lòng', icon: Users },
    { number: '10K+', label: 'Khách sạn', icon: HotelIcon },
    { number: '100+', label: 'Điểm đến', icon: Globe },
    { number: '4.9', label: 'Đánh giá trung bình', icon: Star },
  ];

  return (
    <>
      {/* Hero Section */}
      <div className="relative min-h-[600px] bg-slate-900 overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop")',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50"></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-brand-dark/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent/20 backdrop-blur-sm rounded-full text-brand-accent text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                #1 Nền tảng đặt phòng khách sạn tại Việt Nam
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Tìm khách sạn
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-bg">
                  {' '}
                  Hoàn Hảo
                </span>
              </h1>
              <p className="text-white/70 text-lg md:text-xl mb-8 max-w-lg">
                Khám phá những khách sạn, resort và homestay tuyệt vời với giá
                tốt nhất. Đặt phòng an tâm và tận hưởng kỳ nghỉ hoàn hảo của
                bạn.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">Hủy miễn phí</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">
                    Cam kết giá tốt nhất
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">Hỗ trợ 24/7</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/search"
                  className="px-8 py-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/30 transition-all hover:scale-105 flex items-center gap-2"
                >
                  Khám phá khách sạn
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl border border-white/20 transition-all flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Xem video
                </button>
              </div>
            </div>

            {/* Right - Stats Card */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="text-center p-4 bg-white/5 rounded-2xl"
                    >
                      <stat.icon className="w-8 h-8 text-brand-accent mx-auto mb-3" />
                      <div className="text-3xl font-black text-white mb-1">
                        {stat.number}
                      </div>
                      <div className="text-white/60 text-sm font-medium">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Widget */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 pb-12 md:pb-0">
        <SearchBar />
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            Tại sao bạn nên chọn StayHub?
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến trải nghiệm du lịch mượt mà và thú vị cho
            bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: 'Đặt phòng an toàn',
              desc: 'Thanh toán và dữ liệu của bạn luôn được bảo vệ',
              color: 'blue',
            },
            {
              icon: Award,
              title: 'Giá tốt nhất',
              desc: 'Chúng tôi cam kết giá tốt nhất hiện có',
              color: 'green',
            },
            {
              icon: Clock,
              title: 'Xác nhận tức thì',
              desc: 'Nhận xác nhận đặt phòng trong vài giây',
              color: 'purple',
            },
            {
              icon: Headphones,
              title: 'Hỗ trợ 24/7',
              desc: 'Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn',
              color: 'orange',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="group p-6 bg-white rounded-2xl border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 transition-all duration-300"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                  feature.color === 'blue'
                    ? 'bg-brand-accent/20 text-brand-accent'
                    : feature.color === 'green'
                      ? 'bg-green-100 text-green-600'
                      : feature.color === 'purple'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-orange-100 text-orange-600'
                }`}
              >
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Destinations */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                Điểm đến phổ biến tại Việt Nam
              </h2>
              <p className="text-slate-500">
                Khám phá những địa điểm được du khách yêu thích tại Việt Nam
              </p>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 text-brand-accent hover:bg-brand-accent/10 rounded-xl font-bold transition-colors"
            >
              Xem tất cả
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((city, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveDestination(idx)}
                onClick={() =>
                  navigate(`/search?query=${encodeURIComponent(city.name)}`)
                }
                className={`group cursor-pointer rounded-2xl overflow-hidden relative aspect-[3/4] shadow-lg transition-all duration-500 ${
                  activeDestination === idx ? 'lg:col-span-2 lg:row-span-2' : ''
                }`}
              >
                <HotelImage
                  src={city.img}
                  alt={city.name}
                  className="w-full h-full group-hover:scale-110 transition-transform duration-700"
                  aspectRatio="3/4"
                  lazy={idx > 0} // Load first image immediately
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-sm font-bold">
                        {city.rating}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1">
                    {city.name}
                  </h3>
                  <p className="text-white/80 font-medium">
                    {city.properties.toLocaleString()}+ khách sạn
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `/search?query=${encodeURIComponent(city.name)}`
                      );
                    }}
                    className="mt-4 w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl border border-white/20 transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 flex items-center justify-center gap-2"
                  >
                    Khám phá
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Properties */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              Khách sạn nổi bật
            </h2>
            <p className="text-slate-500">
              Những khách sạn được lựa chọn kỹ dành cho bạn
            </p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 text-brand-accent hover:bg-brand-accent/10 rounded-xl font-bold transition-colors"
          >
            View All
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <HotelCardSkeleton key={i} />
            ))}
          </div>
        ) : featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((property, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 cursor-pointer"
                onClick={() => navigate(`/hotels/${property.id}`)}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <HotelImage
                    src={property.images?.[0]?.url || null}
                    alt={property.name}
                    className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                    aspectRatio="4/3"
                    lazy={idx > 3} // Only lazy load images below the fold
                  />
                  {/* Badge (Optional - can be added to Hotel entity later) */}
                  {/* Badge (Optional - can be added to Hotel entity later) */}
                  // ... inside return ...
                  {/* Favorite */}
                  <button
                    onClick={(e) => handleToggleWishlist(e, property.id)}
                    className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        wishlist.includes(property.id)
                          ? 'text-red-500 fill-red-500'
                          : 'text-slate-400 hover:text-red-500'
                      }`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-1 text-slate-500 text-sm mb-2">
                    <MapPin className="w-4 h-4" />
                    {property.city}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-brand-accent transition-colors line-clamp-1">
                    {property.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-bold text-slate-900">
                        {property.starRating}
                      </span>
                    </div>
                    {/* Reviews count not yet in Hotel entity */}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 text-sm">Từ</span>
                      <div className="text-2xl font-black text-brand-dark">
                        {property.rooms && property.rooms.length > 0
                          ? formatVND(
                              Math.min(
                                ...property.rooms.map((r) => r.basePrice)
                              )
                            )
                          : 'Liên hệ'}{' '}
                        <span className="text-sm font-medium text-slate-400">
                          /đêm
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/hotels/${property.id}`);
                      }}
                      className="px-4 py-2 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-lg transition-colors text-sm"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl">
            <p className="text-slate-500">
              Hiện tại chưa có khách sạn nổi bật.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="mt-4 text-brand-accent font-bold hover:underline"
            >
              Xem tất cả khách sạn
            </button>
          </div>
        )}
      </div>

      {/* Testimonials */}
      <div className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">
              Khách hàng nói gì về chúng tôi
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Đọc đánh giá từ những du khách đã đặt phòng qua StayHub
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
              >
                <Quote className="w-10 h-10 text-brand-accent/30 mb-4" />
                <p className="text-white/80 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-accent to-brand-dark rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-white font-bold">
                      {testimonial.name}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-brand-dark to-brand-accent py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Bạn đã sẵn sàng cho chuyến du lịch tiếp theo?
          </h2>
          <p className="text-brand-bg text-lg mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn du khách và khám phá những khách sạn tuyệt
            vời với giá cả phải chăng.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/search')}
              className="px-8 py-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Bắt đầu khám phá
            </button>
            <Link
              to="/search"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-all"
            >
              Xem tất cả khách sạn
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-slate-700">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-brand-accent p-2 rounded-lg">
                  <HotelIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white">StayHub</span>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Đối tác tin cậy của bạn trong việc tìm chỗ nghỉ hoàn hảo tại
                Việt Nam.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-600 cursor-pointer transition-colors">
                  <Globe className="w-5 h-5 text-slate-300" />
                </div>
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-600 cursor-pointer transition-colors">
                  <TrendingUp className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: 'Công ty',
                links: ['Về chúng tôi', 'Tuyển dụng', 'Báo chí', 'Blog'],
              },
              {
                title: 'Hỗ trợ',
                links: [
                  'Trung tâm trợ giúp',
                  'Liên hệ',
                  'Câu hỏi thường gặp',
                  'An toàn',
                ],
              },
              {
                title: 'Pháp lý',
                links: [
                  'Chính sách bảo mật',
                  'Điều khoản dịch vụ',
                  'Chính sách Cookie',
                ],
              },
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="text-white font-bold mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href="#"
                        className="text-slate-400 hover:text-white transition-colors text-sm"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © 2025 StayHub. Bảo lưu mọi quyền.
            </p>
            <div className="flex items-center gap-6">
              <CreditCard className="h-8 text-slate-500" />
              <div className="text-slate-500 font-bold text-sm">
                Visa | Mastercard | PayPal
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
