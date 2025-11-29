import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  Users,
  MapPin,
  Minus,
  Plus,
  ChevronDown,
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getLocationSuggestions } from '../../../services/searchService';

interface SearchBarProps {
  initialValues?: {
    location: string;
    dates: [Date | null, Date | null];
    guests: number;
    children?: number;
  };
  className?: string;
}

export default function SearchBar({
  initialValues,
  className = '',
}: SearchBarProps) {
  const navigate = useNavigate();
  const [location, setLocation] = useState(initialValues?.location || '');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(
    initialValues?.dates || [null, null]
  );
  const [startDate, endDate] = dateRange;
  const [adults, setAdults] = useState(initialValues?.guests || 1);
  const [children, setChildren] = useState(initialValues?.children || 0);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const guestPopupRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // Fetch location suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (location.length < 2) {
        setSuggestions([]);
        setShowLocationSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const data = await getLocationSuggestions(location, 8);
        setSuggestions(data);
        setShowLocationSuggestions(data.length > 0);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
        setShowLocationSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [location]);

  // Close popups on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        guestPopupRef.current &&
        !guestPopupRef.current.contains(event.target as Node)
      ) {
        setShowGuestPopup(false);
      }
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.append('query', location);
    if (startDate)
      params.append('checkIn', startDate.toISOString().split('T')[0]);
    if (endDate) params.append('checkOut', endDate.toISOString().split('T')[0]);
    if (adults > 0) params.append('guests', adults.toString());
    if (children > 0) params.append('children', children.toString());

    navigate(`/search?${params.toString()}`);
  };

  const handleLocationSelect = (suggestion: string) => {
    setLocation(suggestion);
    setShowLocationSuggestions(false);
    locationInputRef.current?.blur();
  };

  const totalGuests = adults + children;

  return (
    <div
      className={`bg-white rounded-3xl md:rounded-full shadow-2xl shadow-brand-dark/10 p-3 flex flex-col md:flex-row items-center gap-2 max-w-5xl mx-auto border border-slate-100 ${className}`}
    >
      {/* Location with Autocomplete */}
      <div
        ref={locationRef}
        className="w-full md:flex-1 px-6 py-3 border-b md:border-b-0 md:border-r border-slate-100 relative group hover:bg-slate-50 rounded-2xl md:rounded-full transition-colors"
      >
        <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1 ml-9">
          Điểm đến
        </label>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-bg/50 flex items-center justify-center text-brand-dark group-hover:bg-brand-accent group-hover:text-white transition-colors shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 relative">
            <input
              ref={locationInputRef}
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowLocationSuggestions(true);
                }
              }}
              placeholder="Bạn muốn đi đâu?"
              className="w-full outline-none text-slate-700 placeholder:text-slate-400 font-semibold bg-transparent text-lg"
            />
            {/* Location Suggestions Dropdown */}
            {showLocationSuggestions &&
              (suggestions.length > 0 || loadingSuggestions) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-64 overflow-y-auto">
                  {loadingSuggestions ? (
                    <div className="px-4 py-3 text-sm text-slate-500 text-center">
                      Đang tìm...
                    </div>
                  ) : (
                    suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleLocationSelect(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-brand-accent/10 transition-colors flex items-center gap-3 border-b border-slate-100 last:border-0"
                      >
                        <MapPin className="w-4 h-4 text-brand-accent shrink-0" />
                        <span className="text-slate-700 font-medium">
                          {suggestion}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="w-full md:flex-1 px-6 py-3 border-b md:border-b-0 md:border-r border-slate-100 relative group hover:bg-slate-50 rounded-2xl md:rounded-full transition-colors">
        <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1 ml-9">
          Nhận phòng / Trả phòng
        </label>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-bg/50 flex items-center justify-center text-brand-dark group-hover:bg-brand-accent group-hover:text-white transition-colors shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="w-full">
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update: [Date | null, Date | null]) =>
                setDateRange(update)
              }
              placeholderText="Chọn ngày"
              className="w-full outline-none text-slate-700 placeholder:text-slate-400 font-semibold bg-transparent text-lg cursor-pointer"
              dateFormat="MMM d"
              minDate={new Date()}
            />
          </div>
        </div>
      </div>

      {/* Guests */}
      <div
        className="w-full md:w-64 px-6 py-3 relative group hover:bg-slate-50 rounded-2xl md:rounded-full transition-colors cursor-pointer"
        onClick={() => setShowGuestPopup(!showGuestPopup)}
        ref={guestPopupRef}
      >
        <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1 ml-9">
          Khách
        </label>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-bg/50 flex items-center justify-center text-brand-dark group-hover:bg-brand-accent group-hover:text-white transition-colors shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-slate-700 font-semibold text-lg flex-1">
            {totalGuests} {totalGuests === 1 ? 'Khách' : 'Khách'}
            {children > 0 &&
              `, ${children} ${children === 1 ? 'Trẻ em' : 'Trẻ em'}`}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${showGuestPopup ? 'rotate-180' : ''}`}
          />
        </div>

        {/* Guest Popup */}
        {showGuestPopup && (
          <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-6">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Người lớn</h4>
                  <p className="text-sm text-slate-500">Từ 13 tuổi trở lên</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAdults(Math.max(1, adults - 1));
                    }}
                    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-brand-accent hover:text-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={adults <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-slate-900 w-8 text-center">
                    {adults}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAdults(adults + 1);
                    }}
                    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-brand-accent hover:text-brand-accent transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Trẻ em</h4>
                  <p className="text-sm text-slate-500">Từ 0-12 tuổi</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChildren(Math.max(0, children - 1));
                    }}
                    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-brand-accent hover:text-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={children <= 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-slate-900 w-8 text-center">
                    {children}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChildren(children + 1);
                    }}
                    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-brand-accent hover:text-brand-accent transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="w-full md:w-auto bg-brand-cta hover:bg-brand-cta-hover text-white p-4 md:px-8 md:py-4 rounded-2xl md:rounded-full transition-all shadow-lg shadow-brand-cta/30 hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
      >
        <Search className="w-6 h-6" />
        <span className="md:hidden font-bold">Tìm kiếm</span>
      </button>
    </div>
  );
}
