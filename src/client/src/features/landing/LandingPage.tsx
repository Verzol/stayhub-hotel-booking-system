import {
  ShieldCheck,
  Star,
  Headphones,
  MapPin,
  Calendar,
  Users,
  Search,
  Hotel,
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
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [activeDestination, setActiveDestination] = useState(0);

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

  const featuredProperties = [
    {
      name: 'Sunrise Beach Resort',
      location: 'Da Nang',
      price: 120,
      rating: 4.9,
      reviews: 324,
      img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800',
      badge: 'Popular',
    },
    {
      name: 'Mountain View Villa',
      location: 'Da Lat',
      price: 89,
      rating: 4.8,
      reviews: 156,
      img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800',
      badge: 'New',
    },
    {
      name: 'Riverside Boutique Hotel',
      location: 'Hoi An',
      price: 75,
      rating: 4.7,
      reviews: 289,
      img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800',
      badge: 'Deal',
    },
    {
      name: 'Ocean Pearl Resort',
      location: 'Nha Trang',
      price: 150,
      rating: 4.9,
      reviews: 412,
      img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
      badge: 'Top Rated',
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
    { number: '50K+', label: 'Happy Guests', icon: Users },
    { number: '10K+', label: 'Properties', icon: Hotel },
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
                Find Your Perfect
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-bg">
                  {' '}
                  Stay
                </span>
              </h1>
              <p className="text-white/70 text-lg md:text-xl mb-8 max-w-lg">
                Discover amazing hotels, resorts, and homestays at the best
                prices. Book with confidence and enjoy your perfect getaway.
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
                <button className="px-8 py-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/30 transition-all hover:scale-105 flex items-center gap-2">
                  Explore Hotels
                  <ArrowRight className="w-5 h-5" />
                </button>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Tab Header */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-6">
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg font-bold text-sm transition-colors">
              <Hotel className="w-4 h-4" />
              Hotels
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold text-sm transition-colors">
              <Hotel className="w-4 h-4" />
              Resorts
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold text-sm transition-colors">
              <Hotel className="w-4 h-4" />
              Homestays
            </button>
          </div>

          {/* Search Form */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Destination */}
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                  Destination
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-accent transition-colors" />
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Check In */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                  Check-in
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-accent transition-colors" />
                  <input
                    type="date"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Check Out */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                  Check-out
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-accent transition-colors" />
                  <input
                    type="date"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                  Guests
                </label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-accent transition-colors" />
                  <select className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer">
                    <option>1 Guest</option>
                    <option>2 Guests</option>
                    <option>3 Guests</option>
                    <option>4+ Guests</option>
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <div className="md:col-span-2 flex items-end">
                <button className="w-full py-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95">
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            Why Choose StayHub?
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            We're committed to making your travel experience seamless and
            enjoyable
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
              title: 'Best Price',
              desc: 'We guarantee the lowest prices available',
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
              desc: 'Our team is always here to help you',
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
                Trending Destinations
              </h2>
              <p className="text-slate-500">
                Explore popular places loved by travelers
              </p>
            </div>
            <button className="hidden md:flex items-center gap-2 px-5 py-2.5 text-brand-accent hover:bg-brand-accent/10 rounded-xl font-bold transition-colors">
              View All
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((city, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveDestination(idx)}
                className={`group cursor-pointer rounded-2xl overflow-hidden relative aspect-[3/4] shadow-lg transition-all duration-500 ${
                  activeDestination === idx ? 'lg:col-span-2 lg:row-span-2' : ''
                }`}
              >
                <img
                  src={city.img}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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

                  <button className="mt-4 w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl border border-white/20 transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 flex items-center justify-center gap-2">
                    Explore
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Favorite Button */}
                <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-colors">
                  <Heart className="w-5 h-5 text-white" />
                </button>
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
              Featured Properties
            </h2>
            <p className="text-slate-500">
              Hand-picked accommodations just for you
            </p>
          </div>
          <button className="hidden md:flex items-center gap-2 px-5 py-2.5 text-brand-accent hover:bg-brand-accent/10 rounded-xl font-bold transition-colors">
            View All
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProperties.map((property, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={property.img}
                  alt={property.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Badge */}
                <div
                  className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${
                    property.badge === 'Popular'
                      ? 'bg-brand-accent text-white'
                      : property.badge === 'New'
                        ? 'bg-green-500 text-white'
                        : property.badge === 'Deal'
                          ? 'bg-orange-500 text-white'
                          : 'bg-purple-600 text-white'
                  }`}
                >
                  {property.badge}
                </div>
                {/* Favorite */}
                <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors">
                  <Heart className="w-4 h-4 text-slate-400 hover:text-red-500 transition-colors" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-1 text-slate-500 text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  {property.location}
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-brand-accent transition-colors">
                  {property.name}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-slate-900">
                      {property.rating}
                    </span>
                  </div>
                  <span className="text-slate-400 text-sm">
                    ({property.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 text-sm">From</span>
                    <div className="text-2xl font-black text-brand-dark">
                      ${property.price}
                      <span className="text-sm font-medium text-slate-400">
                        /night
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-lg transition-colors text-sm">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">
              What Our Guests Say
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Read reviews from travelers who booked with StayHub
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
            Ready to Book Your Next Adventure?
          </h2>
          <p className="text-brand-bg text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of happy travelers and discover amazing
            accommodations at unbeatable prices.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
              Start Exploring
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-all">
              Download App
            </button>
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
                  <Hotel className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white">StayHub</span>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Your trusted partner for finding the perfect accommodation
                worldwide.
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
                links: ['Help Center', 'Contact Us', 'FAQ', 'Safety'],
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
