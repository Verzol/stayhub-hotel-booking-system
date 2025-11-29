import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Users, MapPin, Minus, Plus } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface SearchBarProps {
  initialValues?: {
    location: string;
    dates: [Date | null, Date | null];
    guests: number;
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
  const [guests, setGuests] = useState(initialValues?.guests || 1);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const guestPopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        guestPopupRef.current &&
        !guestPopupRef.current.contains(event.target as Node)
      ) {
        setShowGuestPopup(false);
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
    if (guests > 1) params.append('guests', guests.toString());

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div
      className={`bg-white rounded-3xl md:rounded-full shadow-2xl shadow-brand-dark/10 p-3 flex flex-col md:flex-row items-center gap-2 max-w-5xl mx-auto border border-slate-100 ${className}`}
    >
      {/* Location */}
      <div className="w-full md:flex-1 px-6 py-3 border-b md:border-b-0 md:border-r border-slate-100 relative group hover:bg-slate-50 rounded-2xl md:rounded-full transition-colors">
        <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1 ml-9">
          Destination
        </label>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-bg/50 flex items-center justify-center text-brand-dark group-hover:bg-brand-accent group-hover:text-white transition-colors shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where are you going?"
            className="w-full outline-none text-slate-700 placeholder:text-slate-400 font-semibold bg-transparent text-lg"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="w-full md:flex-1 px-6 py-3 border-b md:border-b-0 md:border-r border-slate-100 relative group hover:bg-slate-50 rounded-2xl md:rounded-full transition-colors">
        <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1 ml-9">
          Check-in / Check-out
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
              placeholderText="Add dates"
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
          Guests
        </label>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-bg/50 flex items-center justify-center text-brand-dark group-hover:bg-brand-accent group-hover:text-white transition-colors shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-slate-700 font-semibold text-lg">
            {guests} Guest{guests > 1 ? 's' : ''}
          </span>
        </div>

        {/* Guest Popup */}
        {showGuestPopup && (
          <div className="absolute top-full right-0 mt-4 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">Adults</h4>
                <p className="text-sm text-slate-500">Ages 13 or above</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGuests(Math.max(1, guests - 1));
                  }}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-brand-accent hover:text-brand-accent transition-colors disabled:opacity-50"
                  disabled={guests <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-900 w-4 text-center">
                  {guests}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGuests(guests + 1);
                  }}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-brand-accent hover:text-brand-accent transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
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
        <span className="md:hidden font-bold">Search</span>
      </button>
    </div>
  );
}
