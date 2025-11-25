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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full z-40`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">StayHub</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
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
          <div className="px-4 py-3 border-b border-slate-700">
            <div className="flex items-center gap-2 text-cyan-300">
              <Star className="w-4 h-4 fill-cyan-300" />
              <span className="text-sm font-medium">Host Dashboard</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                item.active
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="font-medium flex-1 text-left">
                  {item.label}
                </span>
              )}
              {sidebarOpen && item.badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-700 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">
                {user?.fullName?.charAt(0) || 'H'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-400 truncate">Property Host</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}
      >
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Host Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                Manage your properties and bookings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium shadow-sm">
                <Plus className="w-4 h-4" />
                Add New Listing
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-cyan-500" />
                </div>
                <span className="flex items-center text-sm text-green-600 font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +2
                </span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">
                {stats.totalListings}
              </h3>
              <p className="text-slate-500 text-sm mt-1">Total Listings</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <span className="flex items-center text-sm text-green-600 font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +18%
                </span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">
                {stats.totalViews.toLocaleString()}
              </h3>
              <p className="text-slate-500 text-sm mt-1">Total Views</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <span className="flex items-center text-sm text-green-600 font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +5
                </span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">
                {stats.totalBookings}
              </h3>
              <p className="text-slate-500 text-sm mt-1">Total Bookings</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
                <span className="flex items-center text-sm text-green-600 font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +24%
                </span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">
                ${stats.totalEarnings.toLocaleString()}
              </h3>
              <p className="text-slate-500 text-sm mt-1">Total Earnings</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-cyan-200 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center group-hover:bg-cyan-500 transition-colors">
                <Plus className="w-6 h-6 text-cyan-500 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">Create Listing</p>
                <p className="text-sm text-slate-500">Add a new property</p>
              </div>
            </button>

            <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-cyan-200 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                <Calendar className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">Manage Calendar</p>
                <p className="text-sm text-slate-500">Set availability</p>
              </div>
            </button>

            <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-cyan-200 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
                <FileText className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">View Reports</p>
                <p className="text-sm text-slate-500">Performance insights</p>
              </div>
            </button>
          </div>

          {/* My Listings Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            {/* Section Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    My Listings
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Manage your property listings
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search listings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all bg-slate-50"
                  />
                </div>
                <div className="relative">
                  <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all bg-slate-50 appearance-none cursor-pointer"
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="p-6">
              {filteredListings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No listings found
                  </h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-6">
                    Create your first listing to start hosting guests and
                    earning money.
                  </p>
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium">
                    <Plus className="w-5 h-5" />
                    Create Your First Listing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              listing.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {listing.status === 'active' ? 'Active' : 'Pending'}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-slate-900 line-clamp-1">
                            {listing.title}
                          </h3>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">
                              {listing.rating}
                            </span>
                            <span className="text-slate-400">
                              ({listing.reviews})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>{listing.location}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span>{listing.bedrooms} beds</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            <span>{listing.bathrooms} baths</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div>
                            <span className="text-2xl font-bold text-slate-900">
                              ${listing.price}
                            </span>
                            <span className="text-slate-500 text-sm">
                              /night
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-sm">
                          <div className="flex items-center gap-1 text-slate-500">
                            <Eye className="w-4 h-4" />
                            <span>{listing.views} views</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-4 h-4" />
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
