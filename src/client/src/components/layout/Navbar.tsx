import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/userUtils';
import { formatVND } from '../../utils/currency';
import {
  Globe,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Hotel,
  Percent,
  Menu,
  X,
  Settings,
  LayoutDashboard,
  Heart,
  Shield,
  CreditCard,
  Calendar,
  ArrowRight,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isBookingsMenuOpen, setIsBookingsMenuOpen] = useState(false);
  const [recentBookings, setRecentBookings] = useState<
    Array<{
      id: number;
      hotelName?: string;
      roomName?: string;
      roomImage?: string;
      checkInDate: string;
      checkOutDate: string;
      status: string;
      totalPrice?: number;
    }>
  >([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const isHomePage = location.pathname === '/';
  const showScrolledStyle = isScrolled || !isHomePage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
    if (isBookingsMenuOpen) setIsBookingsMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Fetch recent bookings when menu opens
  useEffect(() => {
    const fetchRecentBookings = async () => {
      if (
        isBookingsMenuOpen &&
        isAuthenticated &&
        recentBookings.length === 0
      ) {
        try {
          setLoadingBookings(true);
          const { getMyBookings } = await import(
            '../../services/bookingService'
          );
          const data = await getMyBookings();
          setRecentBookings(data?.slice(0, 3) || []);
        } catch (error) {
          console.error('Failed to fetch bookings', error);
        } finally {
          setLoadingBookings(false);
        }
      }
    };
    fetchRecentBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBookingsMenuOpen, isAuthenticated]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const navItems = [
    { name: 'Hotels', icon: Hotel, href: '/search' },
    { name: 'Deals', icon: Percent, href: '/promotions' },
    ...(isAuthenticated
      ? [{ name: 'Messages', icon: MessageCircle, href: '/chat' }]
      : []),
  ];

  const getDashboardLink = () => {
    if (user?.role === 'HOST') return '/host';
    return '/';
  };

  const userMenuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: getDashboardLink(),
      show: user?.role === 'HOST',
    },
    { label: 'My Profile', icon: UserIcon, href: '/profile', show: true },
    {
      label: 'My Bookings',
      icon: Calendar,
      href: '/bookings',
      show: user?.role === 'CUSTOMER',
    },
    { label: 'Messages', icon: MessageCircle, href: '/chat', show: true },
    { label: 'Saved', icon: Heart, href: '/wishlist', show: true },
    {
      label: 'Settings',
      icon: Settings,
      href: '#',
      show: false,
    },
  ].filter((item) => item.show);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showScrolledStyle
            ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-brand-dark/5 py-3'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Nav */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link
                to="/"
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-brand-dark to-brand-accent p-2 rounded-xl shadow-lg shadow-brand-dark/30 group-hover:shadow-brand-dark/50 transition-shadow">
                  <Hotel className="w-5 h-5 text-white" />
                </div>
                <span
                  className={`text-2xl font-black tracking-tight transition-colors ${
                    showScrolledStyle ? 'text-brand-dark' : 'text-white'
                  }`}
                >
                  Stay
                  <span className="text-brand-accent">Hub</span>
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                      showScrolledStyle
                        ? 'text-brand-dark/70 hover:text-brand-accent hover:bg-brand-accent/10'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}

                {/* My Recent Bookings - Only show if authenticated */}
                {isAuthenticated && (
                  <div className="relative">
                    <button
                      onClick={() => setIsBookingsMenuOpen(!isBookingsMenuOpen)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                        showScrolledStyle
                          ? 'text-brand-dark/70 hover:text-brand-accent hover:bg-brand-accent/10'
                          : 'text-white/90 hover:text-white hover:bg-white/10'
                      } ${isBookingsMenuOpen ? (showScrolledStyle ? 'bg-brand-accent/10 text-brand-accent' : 'bg-white/10 text-white') : ''}`}
                    >
                      <CreditCard className="w-4 h-4" />
                      My Bookings
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${isBookingsMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Bookings Dropdown */}
                    {isBookingsMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsBookingsMenuOpen(false)}
                        />
                        <div className="absolute left-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-brand-dark/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                          {/* Header */}
                          <div className="px-4 py-4 bg-brand-bg/30 border-b border-brand-dark/10 flex items-center justify-between">
                            <h3 className="font-bold text-brand-dark flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Recent Bookings
                            </h3>
                            <Link
                              to="/bookings"
                              onClick={() => setIsBookingsMenuOpen(false)}
                              className="text-xs text-brand-accent hover:underline font-semibold"
                            >
                              View All
                            </Link>
                          </div>

                          {/* Bookings List */}
                          <div className="max-h-96 overflow-y-auto">
                            {loadingBookings ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-5 h-5 animate-spin text-brand-accent" />
                              </div>
                            ) : recentBookings.length > 0 ? (
                              <div className="py-2">
                                {recentBookings.map((booking) => (
                                  <Link
                                    key={booking.id}
                                    to={`/booking/${booking.id}`}
                                    onClick={() => setIsBookingsMenuOpen(false)}
                                    className="flex items-start gap-3 px-4 py-3 hover:bg-brand-accent/5 transition-colors border-b border-brand-dark/5 last:border-0"
                                  >
                                    {booking.roomImage && (
                                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                          src={
                                            booking.roomImage.startsWith('http')
                                              ? booking.roomImage
                                              : `http://localhost:8080${booking.roomImage}`
                                          }
                                          alt={booking.roomName || 'Room'}
                                          className="w-full h-full object-cover"
                                          loading="lazy"
                                          decoding="async"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-brand-dark text-sm truncate">
                                        {booking.hotelName ||
                                          booking.roomName ||
                                          `Booking #${booking.id}`}
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-brand-dark/60 mt-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                          {new Date(
                                            booking.checkInDate
                                          ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                          })}
                                          {' - '}
                                          {new Date(
                                            booking.checkOutDate
                                          ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                          })}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between mt-2">
                                        <span
                                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            booking.status === 'CONFIRMED'
                                              ? 'bg-green-100 text-green-700'
                                              : booking.status === 'PENDING'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                          }`}
                                        >
                                          {booking.status === 'CONFIRMED'
                                            ? 'Confirmed'
                                            : booking.status === 'PENDING'
                                              ? 'Pending Payment'
                                              : booking.status === 'CANCELLED'
                                                ? 'Cancelled'
                                                : booking.status}
                                        </span>
                                        {booking.totalPrice && (
                                          <span className="text-xs font-bold text-brand-dark">
                                            {formatVND(booking.totalPrice, {
                                              showSymbol: false,
                                            })}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <div className="px-4 py-8 text-center">
                                <CreditCard className="w-12 h-12 text-brand-dark/20 mx-auto mb-3" />
                                <p className="text-sm text-brand-dark/60 mb-2">
                                  No bookings yet
                                </p>
                                <Link
                                  to="/search"
                                  onClick={() => setIsBookingsMenuOpen(false)}
                                  className="text-sm text-brand-accent hover:underline font-semibold inline-flex items-center gap-1"
                                >
                                  Start Booking
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div
                className={`hidden md:flex items-center gap-1.5 text-sm font-semibold cursor-pointer px-3 py-2 rounded-lg transition-all ${
                  showScrolledStyle
                    ? 'text-brand-dark/70 hover:bg-brand-dark/5'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>EN</span>
                <ChevronDown className="w-3 h-3" />
              </div>

              {isAuthenticated && (
                <>
                  {/* Notification Bell */}
                  <NotificationBell showScrolledStyle={showScrolledStyle} />
                </>
              )}

              {isAuthenticated ? (
                <div className="relative">
                  {/* User Button */}
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 p-1.5 rounded-xl transition-all hover:bg-white/10"
                  >
                    <span
                      className={`hidden sm:block font-semibold text-sm ${
                        showScrolledStyle ? 'text-brand-dark' : 'text-white'
                      }`}
                    >
                      {user?.fullName}
                    </span>
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-accent to-brand-dark flex items-center justify-center text-white font-bold shadow-lg shadow-brand-dark/30 overflow-hidden">
                        {getAvatarUrl(user) ? (
                          <img
                            src={getAvatarUrl(user)}
                            alt={user?.fullName || 'User'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          user?.fullName?.charAt(0) || 'U'
                        )}
                      </div>
                      {/* Role Badge */}
                      {user?.role && user.role !== 'CUSTOMER' && (
                        <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-md shadow">
                          <Shield className="w-3 h-3 text-brand-accent" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-brand-dark/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* User Info Header */}
                        <div className="px-4 py-4 bg-brand-bg/30 border-b border-brand-dark/10">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-accent to-brand-dark flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                              {getAvatarUrl(user) ? (
                                <img
                                  src={getAvatarUrl(user)}
                                  alt={user?.fullName || 'User'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                user?.fullName?.charAt(0) || 'U'
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-brand-dark">
                                {user?.fullName}
                              </div>
                              <div className="text-xs text-brand-dark/50 capitalize">
                                Account{' '}
                                {user?.role === 'HOST' ? 'Host' : 'Guest'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.label}
                              to={item.href}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-brand-dark/80 hover:bg-brand-accent/10 hover:text-brand-accent transition-colors"
                            >
                              <item.icon className="w-4 h-4" />
                              {item.label}
                            </Link>
                          ))}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-brand-dark/10">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-brand-cta hover:bg-brand-cta/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      showScrolledStyle
                        ? 'text-brand-dark hover:bg-brand-dark/5'
                        : 'text-white hover:bg-white/10 border border-white/30'
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 rounded-xl bg-brand-cta hover:bg-brand-cta-hover text-white text-sm font-bold shadow-lg shadow-brand-cta/30 transition-all hover:scale-105 hover:shadow-brand-cta/50"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  showScrolledStyle
                    ? 'text-brand-dark hover:bg-brand-dark/5'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 lg:hidden animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-brand-dark/10">
                <Link
                  to="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="bg-gradient-to-br from-brand-dark to-brand-accent p-2 rounded-xl">
                    <Hotel className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-black text-brand-dark">
                    Stay<span className="text-brand-accent">Hub</span>
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-brand-dark/50 hover:text-brand-dark hover:bg-brand-dark/5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Items */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-brand-dark/80 hover:bg-brand-accent/10 hover:text-brand-accent font-medium transition-colors"
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  ))}

                  {/* My Bookings in Mobile */}
                  {isAuthenticated && (
                    <Link
                      to="/bookings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-brand-dark/80 hover:bg-brand-accent/10 hover:text-brand-accent font-medium transition-colors"
                    >
                      <CreditCard className="w-5 h-5" />
                      My Bookings
                    </Link>
                  )}
                </nav>

                {isAuthenticated && (
                  <>
                    <div className="my-4 border-t border-brand-dark/10" />
                    <div className="px-3">
                      <div className="px-4 py-2 text-xs font-bold text-brand-dark/40 uppercase tracking-wider">
                        Account
                      </div>
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-brand-dark/80 hover:bg-brand-accent/10 hover:text-brand-accent font-medium transition-colors"
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-brand-dark/10">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-cta/10 text-brand-cta rounded-xl font-bold hover:bg-brand-cta/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-4 py-3 text-center text-brand-dark border border-brand-dark/20 rounded-xl font-bold hover:bg-brand-dark/5 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-4 py-3 text-center bg-brand-cta text-white rounded-xl font-bold hover:bg-brand-cta-hover transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
