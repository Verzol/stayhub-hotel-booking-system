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
  Star,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import HotelList from './components/HotelList';
import HotelForm from './components/HotelForm';
import RoomList from './components/RoomList';
import RoomForm from './components/RoomForm';
import AvailabilityCalendar from './components/AvailabilityCalendar';
import PromotionList from './components/PromotionList';
import PromotionForm from './components/PromotionForm';
import type { Hotel, Room } from '../../types/host';

type View = 'DASHBOARD' | 'HOTELS' | 'HOTEL_FORM' | 'ROOMS' | 'ROOM_FORM' | 'AVAILABILITY' | 'PROMOTIONS' | 'PROMOTION_FORM';

export default function HostDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | undefined>(undefined);
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(undefined);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', view: 'DASHBOARD' as View },
    { icon: Building2, label: 'My Listings', view: 'HOTELS' as View },
    { icon: Calendar, label: 'Bookings', view: 'DASHBOARD' as View }, // Placeholder
    { icon: CreditCard, label: 'Earnings', view: 'DASHBOARD' as View }, // Placeholder
    { icon: MessageSquare, label: 'Messages', view: 'DASHBOARD' as View, badge: 3 }, // Placeholder
    { icon: Star, label: 'Reviews', view: 'DASHBOARD' as View }, // Placeholder
    { icon: BarChart3, label: 'Analytics', view: 'DASHBOARD' as View }, // Placeholder
    { icon: Settings, label: 'Settings', view: 'DASHBOARD' as View }, // Placeholder
  ];

  // Navigation Handlers
  const handleCreateHotel = () => {
    setSelectedHotel(undefined);
    setCurrentView('HOTEL_FORM');
  };

  const handleEditHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setCurrentView('HOTEL_FORM');
  };

  const handleManageRooms = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setCurrentView('ROOMS');
  };

  const handleManagePromotions = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setCurrentView('PROMOTIONS');
  };

  const handleCreateRoom = () => {
    setSelectedRoom(undefined);
    setCurrentView('ROOM_FORM');
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setCurrentView('ROOM_FORM');
  };

  const handleAvailability = (room: Room) => {
    setSelectedRoom(room);
    setCurrentView('AVAILABILITY');
  };

  const handleCreatePromotion = () => {
    setCurrentView('PROMOTION_FORM');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'HOTELS':
        return (
          <HotelList
            onCreate={handleCreateHotel}
            onEdit={handleEditHotel}
            onManageRooms={handleManageRooms}
            onManagePromotions={handleManagePromotions}
          />
        );
      case 'HOTEL_FORM':
        return (
          <HotelForm
            hotel={selectedHotel}
            onSuccess={() => setCurrentView('HOTELS')}
            onCancel={() => setCurrentView('HOTELS')}
          />
        );
      case 'ROOMS':
        if (!selectedHotel) return null;
        return (
          <RoomList
            hotel={selectedHotel}
            onCreate={handleCreateRoom}
            onEdit={handleEditRoom}
            onAvailability={handleAvailability}
            onBack={() => setCurrentView('HOTELS')}
          />
        );
      case 'ROOM_FORM':
        if (!selectedHotel) return null;
        return (
          <RoomForm
            hotel={selectedHotel}
            room={selectedRoom}
            onSuccess={() => setCurrentView('ROOMS')}
            onCancel={() => setCurrentView('ROOMS')}
          />
        );
      case 'AVAILABILITY':
        if (!selectedRoom) return null;
        return (
          <AvailabilityCalendar
            room={selectedRoom}
            onBack={() => setCurrentView('ROOMS')}
          />
        );
      case 'PROMOTIONS':
        if (!selectedHotel) return null;
        return (
          <PromotionList
            hotel={selectedHotel}
            onCreate={handleCreatePromotion}
            onBack={() => setCurrentView('HOTELS')}
          />
        );
      case 'PROMOTION_FORM':
        if (!selectedHotel) return null;
        return (
          <PromotionForm
            hotel={selectedHotel}
            onSuccess={() => setCurrentView('PROMOTIONS')}
            onCancel={() => setCurrentView('PROMOTIONS')}
          />
        );
      case 'DASHBOARD':
      default:
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Welcome to Host Dashboard</h2>
            <p className="text-slate-500 mb-8">Select "My Listings" to manage your properties.</p>
            <button
              onClick={() => setCurrentView('HOTELS')}
              className="px-6 py-3 bg-brand-cta text-white rounded-xl font-bold shadow-lg hover:bg-brand-cta-hover transition-all"
            >
              Go to My Listings
            </button>
          </div>
        );
    }
  };

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
              onClick={() => setCurrentView(item.view)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                currentView === item.view
                  ? 'bg-gradient-to-r from-brand-accent to-brand-dark text-white shadow-lg shadow-brand-accent/25 font-bold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'
              }`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  currentView === item.view
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
              <button 
                onClick={handleCreateHotel}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-cta hover:bg-brand-cta-hover text-white rounded-xl transition-all shadow-lg shadow-brand-cta/30 font-bold text-sm hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Add New Listing
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
