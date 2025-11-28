import { useState } from 'react';
import {
  Building2,
  Plus,
  Home,
  Calendar,
  CreditCard,
  MessageSquare,
  BarChart3,
  Settings,
  Bell,
  HelpCircle,
  Menu,
  X,
  TrendingUp,
  Eye,
  Star,
  DollarSign,
  MapPin,
  Bed,
  Bath,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  FileText,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// Mock data for listings
const mockListings = [
  {
    id: 1,
    title: 'Luxury Beach Villa',
    location: 'Da Nang, Vietnam',
    price: 250,
    rating: 4.8,
    reviews: 124,
    bedrooms: 3,
    bathrooms: 2,
    status: 'active',
    views: 1240,
    bookings: 12,
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400',
  },
  {
    id: 2,
    title: 'Modern City Apartment',
    location: 'Ho Chi Minh City, Vietnam',
    price: 85,
    rating: 4.5,
    reviews: 89,
    bedrooms: 2,
    bathrooms: 1,
    status: 'active',
    views: 856,
    bookings: 8,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
  },
  {
    id: 3,
    title: 'Mountain Retreat Cabin',
    location: 'Da Lat, Vietnam',
    price: 120,
    rating: 4.9,
    reviews: 67,
    bedrooms: 2,
    bathrooms: 1,
    status: 'pending',
    views: 432,
    bookings: 5,
    image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=400',
  },
];

export default function HostDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: Building2, label: 'My Listings', active: false },
    { icon: Calendar, label: 'Bookings', active: false },
    { icon: CreditCard, label: 'Earnings', active: false },
    { icon: MessageSquare, label: 'Messages', active: false, badge: 3 },
    { icon: Star, label: 'Reviews', active: false },
    { icon: BarChart3, label: 'Analytics', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  const stats = {
    totalListings: mockListings.length,
    activeListings: mockListings.filter((l) => l.status === 'active').length,
    totalViews: mockListings.reduce((sum, l) => sum + l.views, 0),
    totalBookings: mockListings.reduce((sum, l) => sum + l.bookings, 0),
    totalEarnings: 12500,
    averageRating: 4.7,
  };

  const filteredListings = mockListings.filter((listing) => {
    const matchesSearch = listing.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || listing.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-24'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full z-40 shadow-2xl overflow-hidden`}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-brand-dark/50 pointer-events-none"></div>

        {/* Logo */}
        <div className="relative p-6 border-b border-slate-800/50 flex items-center justify-between z-10">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-accent to-brand-dark rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-xl tracking-tight">StayHub</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Host Badge */}
        {sidebarOpen && (
          <div className="relative px-6 py-4 border-b border-slate-800/50 z-10 bg-slate-800/30">
            <div className="flex items-center gap-2 text-brand-accent">
              <Star className="w-4 h-4 fill-brand-accent" />
              <span className="text-sm font-bold tracking-wide uppercase">
                Host Dashboard
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="relative flex-1 p-4 space-y-2 z-10 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                item.active
                  ? 'bg-gradient-to-r from-brand-accent to-brand-dark text-white shadow-lg shadow-brand-accent/25 font-bold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'
              }`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  item.active
                    ? 'text-white'
                    : 'text-slate-500 group-hover:text-white'
                }`}
              />
              {sidebarOpen && (
                <span className="flex-1 text-left">{item.label}</span>
              )}
              {sidebarOpen && item.badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="relative p-4 border-t border-slate-800/50 space-y-4 z-10 bg-slate-900/50 backdrop-blur-sm">
          <div
            className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-white/10">
              <span className="text-white font-bold">
                {user?.fullName?.charAt(0) || 'H'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate text-white">
                  {user?.fullName}
                </p>
                <p className="text-xs text-slate-400 truncate">Property Host</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 ${
          sidebarOpen ? 'ml-72' : 'ml-24'
        } transition-all duration-300 min-h-screen flex flex-col`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Host Dashboard
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Manage your properties and bookings
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2.5 text-slate-500 hover:text-brand-accent hover:bg-brand-accent/5 rounded-xl transition-all relative group">
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2.5 text-slate-500 hover:text-brand-accent hover:bg-brand-accent/5 rounded-xl transition-all">
                <HelpCircle className="w-6 h-6" />
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-cta hover:bg-brand-cta-hover text-white rounded-xl transition-all shadow-lg shadow-brand-cta/30 font-bold text-sm hover:scale-105 active:scale-95">
                <Plus className="w-5 h-5" />
                Add New Listing
              </button>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,182,212,0.1)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500 transition-colors duration-300">
                  <Building2 className="w-7 h-7 text-cyan-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="flex items-center px-2.5 py-1 rounded-full bg-green-50 text-xs font-bold text-green-600">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +2
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">
                {stats.totalListings}
              </h3>
              <p className="text-slate-500 font-medium">Total Listings</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-green-500 transition-colors duration-300">
                  <Eye className="w-7 h-7 text-green-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="flex items-center px-2.5 py-1 rounded-full bg-green-50 text-xs font-bold text-green-600">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +18%
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">
                {stats.totalViews.toLocaleString()}
              </h3>
              <p className="text-slate-500 font-medium">Total Views</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(139,92,246,0.1)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:bg-purple-500 transition-colors duration-300">
                  <Calendar className="w-7 h-7 text-purple-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="flex items-center px-2.5 py-1 rounded-full bg-green-50 text-xs font-bold text-green-600">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +5
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">
                {stats.totalBookings}
              </h3>
              <p className="text-slate-500 font-medium">Total Bookings</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(249,115,22,0.1)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300">
                  <DollarSign className="w-7 h-7 text-orange-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="flex items-center px-2.5 py-1 rounded-full bg-green-50 text-xs font-bold text-green-600">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +24%
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">
                ${stats.totalEarnings.toLocaleString()}
              </h3>
              <p className="text-slate-500 font-medium">Total Earnings</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-slate-100 hover:border-brand-accent/30 hover:shadow-lg transition-all group text-left">
              <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500 transition-colors duration-300">
                <Plus className="w-7 h-7 text-cyan-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <p className="font-bold text-lg text-slate-900 group-hover:text-brand-accent transition-colors">
                  Create Listing
                </p>
                <p className="text-sm text-slate-500 font-medium">
                  Add a new property
                </p>
              </div>
            </button>

            <button className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-slate-100 hover:border-brand-accent/30 hover:shadow-lg transition-all group text-left">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
                <Calendar className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <p className="font-bold text-lg text-slate-900 group-hover:text-brand-accent transition-colors">
                  Manage Calendar
                </p>
                <p className="text-sm text-slate-500 font-medium">
                  Set availability
                </p>
              </div>
            </button>

            <button className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-slate-100 hover:border-brand-accent/30 hover:shadow-lg transition-all group text-left">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-green-600 transition-colors duration-300">
                <FileText className="w-7 h-7 text-green-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <p className="font-bold text-lg text-slate-900 group-hover:text-brand-accent transition-colors">
                  View Reports
                </p>
                <p className="text-sm text-slate-500 font-medium">
                  Performance insights
                </p>
              </div>
            </button>
          </div>

          {/* My Listings Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Section Header */}
            <div className="p-8 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    My Listings
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    Manage your property listings
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2.5 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors font-bold text-sm">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <div className="relative flex-1 group">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-accent transition-colors" />
                  <input
                    type="text"
                    placeholder="Search listings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent outline-none transition-all bg-slate-50 focus:bg-white font-medium"
                  />
                </div>
                <div className="relative group">
                  <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-accent transition-colors" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-11 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent outline-none transition-all bg-slate-50 focus:bg-white appearance-none cursor-pointer font-medium"
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="p-8">
              {filteredListings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    No listings found
                  </h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
                    Create your first listing to start hosting guests and
                    earning money.
                  </p>
                  <button className="inline-flex items-center gap-2 px-8 py-4 bg-brand-cta hover:bg-brand-cta-hover text-white rounded-xl transition-all shadow-lg shadow-brand-cta/30 font-bold hover:scale-105 active:scale-95">
                    <Plus className="w-5 h-5" />
                    Create Your First Listing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-4 left-4">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                              listing.status === 'active'
                                ? 'bg-green-500 text-white'
                                : 'bg-yellow-500 text-white'
                            }`}
                          >
                            {listing.status === 'active' ? 'Active' : 'Pending'}
                          </span>
                        </div>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/40 transition-colors text-white">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-brand-accent transition-colors">
                            {listing.title}
                          </h3>
                          <div className="flex items-center gap-1 text-sm bg-yellow-50 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-slate-900">
                              {listing.rating}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-4 font-medium">
                          <MapPin className="w-4 h-4 text-brand-accent" />
                          <span className="line-clamp-1">
                            {listing.location}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-5">
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                            <Bed className="w-4 h-4" />
                            <span className="font-medium">
                              {listing.bedrooms} beds
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                            <Bath className="w-4 h-4" />
                            <span className="font-medium">
                              {listing.bathrooms} baths
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div>
                            <span className="text-2xl font-black text-slate-900">
                              ${listing.price}
                            </span>
                            <span className="text-slate-400 text-sm font-medium">
                              /night
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2.5 text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 rounded-xl transition-colors">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100 text-sm">
                          <div className="flex items-center gap-2 text-slate-500 font-medium">
                            <Eye className="w-4 h-4 text-brand-accent" />
                            <span>{listing.views} views</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 font-medium">
                            <Calendar className="w-4 h-4 text-brand-accent" />
                            <span>{listing.bookings} bookings</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
