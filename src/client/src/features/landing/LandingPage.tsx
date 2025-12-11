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
      name: 'Đà Nẵng',
      img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&h=1066&auto=format&fit=crop&ixlib=rb-4.1.0',
      properties: 1200,
      rating: 4.8,
    },
    {
      name: 'TP. Hồ Chí Minh',
      img: 'https://images.unsplash.com/photo-1536086845112-89de23aa4772?q=80&w=800&h=1066&auto=format&fit=crop&ixlib=rb-4.1.0',
      properties: 2500,
      rating: 4.7,
    },
    {
      name: 'Hà Nội',
      img: 'https://images.unsplash.com/photo-1592028219310-0cb15923525a?q=80&w=800&h=1066&auto=format&fit=crop&ixlib=rb-4.1.0',
      properties: 1800,
      rating: 4.9,
    },
    {
      name: 'Phú Quốc',
      img: 'https://images.unsplash.com/photo-1698809807960-758cf416e96e?q=80&w=800&h=1066&auto=format&fit=crop&ixlib=rb-4.1.0',
      properties: 650,
      rating: 4.8,
    },
  ];

  const testimonials = [
    {
      name: 'Nguyễn Thị Lan',
      avatar: 'L',
      role: 'Travel Blogger',
      text: 'StayHub helped me find the perfect hotel easily! The booking process was very smooth and I got a great price too.',
      rating: 5,
    },
    {
      name: 'Trần Văn Minh',
      avatar: 'M',
      role: 'Business Traveler',
      text: 'I use StayHub for all my business trips. Excellent customer service and unbeatable prices.',
      rating: 5,
    },
    {
      name: 'Lê Thị Mai',
      avatar: 'M',
      role: 'Family Vacationer',
      text: 'Found the perfect family resort via StayHub. The kids loved it and we got 30% off! Highly recommended.',
      rating: 5,
    },
  ];

  const stats = [
    { number: '50K+', label: 'Happy Customers', icon: Users },
    { number: '10K+', label: 'Hotels', icon: HotelIcon },
    { number: '100+', label: 'Destinations', icon: Globe },
    { number: '4.9', label: 'Average Rating', icon: Star },
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
                #1 Hotel Booking Platform in Vietnam
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Find the Perfect
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-bg">
                  {' '}
                  Hotel
                </span>
              </h1>
              <p className="text-white/70 text-lg md:text-xl mb-8 max-w-lg">
                Discover amazing hotels, resorts, and homestays at the best
                prices. Book with confidence and enjoy your perfect vacation.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">Free Cancellation</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">
                    Best Price Guarantee
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">24/7 Support</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/search"
                  className="px-8 py-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/30 transition-all hover:scale-105 flex items-center gap-2"
                >
                  Explore Hotels
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl border border-white/20 transition-all flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Watch Video
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
            Why Choose StayHub?
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            We are committed to providing you with a smooth and enjoyable travel
            experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: 'Secure Booking',
              desc: 'Your payment and data are always protected',
              color: 'blue',
            },
            {
              icon: Award,
              title: 'Best Prices',
              desc: 'We guarantee the best prices available',
              color: 'green',
            },
            {
              icon: Clock,
              title: 'Instant Confirmation',
              desc: 'Get booking confirmation in seconds',
              color: 'purple',
            },
            {
              icon: Headphones,
              title: '24/7 Support',
              desc: 'Our team is always ready to support you',
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
                Popular Destinations in Vietnam
              </h2>
              <p className="text-slate-500">
                Discover places loved by travelers in Vietnam
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((city, idx) => (
              <div
                key={idx}
                onClick={() =>
                  navigate(`/search?query=${encodeURIComponent(city.name)}`)
                }
                className="group cursor-pointer rounded-2xl overflow-hidden relative aspect-[3/4] shadow-lg transition-shadow duration-300 hover:shadow-xl"
              >
                <HotelImage
                  src={city.img}
                  alt={city.name}
                  className="w-full h-full"
                  aspectRatio="3/4"
                  lazy={idx > 0}
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
                    {city.properties.toLocaleString()}+ properties
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `/search?query=${encodeURIComponent(city.name)}`
                      );
                    }}
                    className="mt-4 w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    Explore
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
              Featured Hotels
            </h2>
            <p className="text-slate-500">Handpicked hotels just for you</p>
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
                      <span className="text-slate-400 text-sm">From</span>
                      <div className="text-xl font-black text-brand-dark flex items-baseline gap-1 flex-wrap">
                        <span className="whitespace-nowrap">
                          {property.rooms && property.rooms.length > 0
                            ? formatVND(
                                Math.min(
                                  ...property.rooms.map((r) => r.basePrice)
                                ),
                                { symbol: 'VND' }
                              )
                            : 'Contact'}
                        </span>
                        <span className="text-sm font-medium text-slate-400 whitespace-nowrap">
                          /night
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
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl">
            <p className="text-slate-500">
              No featured hotels available at the moment.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="mt-4 text-brand-accent font-bold hover:underline"
            >
              View All Hotels
            </button>
          </div>
        )}
      </div>

      {/* Testimonials */}
      <div className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">
              What Customers Say About Us
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Read reviews from travelers who booked via StayHub
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
            Ready for your next trip?
          </h2>
          <p className="text-brand-bg text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of travelers and discover amazing hotels at
            affordable prices.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/search')}
              className="px-8 py-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Start Exploring
            </button>
            <Link
              to="/search"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-all"
            >
              View All Hotels
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
                Your trusted partner in finding the perfect stay in Vietnam.
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
                title: 'Company',
                links: ['About Us', 'Careers', 'Press', 'Blog'],
              },
              {
                title: 'Support',
                links: ['Help Center', 'Contact', 'FAQs', 'Safety'],
              },
              {
                title: 'Legal',
                links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
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
              © 2025 StayHub. All rights reserved.
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
