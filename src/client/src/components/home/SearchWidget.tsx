import { Hotel, MapPin, Users, Search } from 'lucide-react';

export default function SearchWidget() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-28 relative z-20">
      <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header of Widget */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Hotel className="w-5 h-5 text-blue-600" />
          <span className="text-blue-600 font-bold text-lg">Hotel Booking</span>
        </div>

        {/* Search Form */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Destination */}
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                City, Destination, or Hotel Name
              </label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600" />
                <input
                  type="text"
                  list="locations"
                  placeholder="Where do you want to stay?"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <datalist id="locations">
                  <option value="Da Nang" />
                  <option value="Ho Chi Minh City" />
                  <option value="Hanoi" />
                  <option value="Phu Quoc" />
                  <option value="Nha Trang" />
                  <option value="Da Lat" />
                </datalist>
              </div>
            </div>

            {/* Dates */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Check-in Date
              </label>
              <div className="relative group">
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Guests & Rooms
              </label>
              <div className="relative group">
                <Users className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600" />
                <input
                  type="text"
                  placeholder="1 Adult, 1 Room"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="md:col-span-2 flex items-end">
              <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-lg shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95">
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
