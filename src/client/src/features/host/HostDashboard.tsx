import { useState } from 'react';
import {
  Building2,
  Home,
  Calendar,
  CreditCard,
  BarChart3,
  LogOut,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkerCleanup } from '../../hooks/useWorker';
import Navbar from '../../components/layout/Navbar';
import HotelList from './components/HotelList';
import HotelForm from './components/HotelForm';
import RoomList from './components/RoomList';
import RoomForm from './components/RoomForm';
import AvailabilityCalendar from './components/AvailabilityCalendar';
import PromotionList from './components/PromotionList';
import PromotionForm from './components/PromotionForm';
import HostBookingManagementWrapper from './components/HostBookingManagementWrapper';
import DashboardOverview from './components/DashboardOverview';
import HostAnalytics from './components/HostAnalytics';
import HostEarnings from './components/HostEarnings';
import HostChatList from './components/HostChatList';
import type { Hotel, Room, Promotion } from '../../types/host';

type View =
  | 'DASHBOARD'
  | 'HOTELS'
  | 'HOTEL_FORM'
  | 'ROOMS'
  | 'ROOM_FORM'
  | 'AVAILABILITY'
  | 'PROMOTIONS'
  | 'PROMOTION_FORM'
  | 'BOOKINGS'
  | 'ANALYTICS'
  | 'EARNINGS'
  | 'CHAT';

export default function HostDashboard() {
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | undefined>(
    undefined
  );
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(undefined);
  const [selectedPromotion, setSelectedPromotion] = useState<
    Promotion | undefined
  >(undefined);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Cleanup workers on unmount
  useWorkerCleanup();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'DASHBOARD', label: 'Overview', icon: Home },
    { id: 'HOTELS', label: 'Hotels', icon: Building2 },
    { id: 'BOOKINGS', label: 'Bookings', icon: Calendar },
    { id: 'CHAT', label: 'Messages', icon: MessageCircle },
    { id: 'EARNINGS', label: 'Earnings', icon: CreditCard },
    { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
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
    setSelectedPromotion(undefined);
    setCurrentView('PROMOTION_FORM');
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
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
            onEdit={handleEditPromotion}
            onBack={() => setCurrentView('HOTELS')}
          />
        );
      case 'PROMOTION_FORM':
        if (!selectedHotel) return null;
        return (
          <PromotionForm
            hotel={selectedHotel}
            promotion={selectedPromotion}
            onSuccess={() => setCurrentView('PROMOTIONS')}
            onCancel={() => setCurrentView('PROMOTIONS')}
          />
        );
      case 'BOOKINGS':
        return <HostBookingManagementWrapper />;
      case 'CHAT':
        return <HostChatList />;
      case 'ANALYTICS':
        return <HostAnalytics />;
      case 'EARNINGS':
        return <HostEarnings />;
      case 'DASHBOARD':
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F3F3] font-sans text-slate-800">
      <Navbar />
      <div className="min-h-screen bg-brand-bg pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header - Similar to Profile Page */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Left - User Info */}
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-brand-dark to-brand-accent rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-brand-dark/20 overflow-hidden ring-4 ring-white">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user?.fullName || 'Host'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      user?.fullName?.charAt(0) || 'H'
                    )}
                  </div>
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-black text-brand-dark">
                      {user?.fullName || 'Host Dashboard'}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-accent/10 text-brand-accent text-xs font-bold uppercase tracking-wider rounded-full">
                      <Building2 className="w-3.5 h-3.5" />
                      Host
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium">{user?.email}</p>
                </div>
              </div>

              {/* Right - Actions */}
              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold text-sm flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to Home
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-bold text-sm flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          </div>

          {/* Tabs Navigation - Similar to Profile Page */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <div className="border-b border-slate-100">
              <div className="flex p-2 gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentView(tab.id as View)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                      currentView === tab.id
                        ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/30'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[600px]">
            <div className="p-8">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
