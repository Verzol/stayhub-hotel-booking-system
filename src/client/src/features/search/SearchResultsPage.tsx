import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import FilterSidebar from './components/FilterSidebar';
import MapView from './components/MapView';
import { searchHotels } from '../../services/searchService';
import {
  toggleWishlist,
  getMyWishlist,
  type Wishlist,
} from '../../services/wishlistService';
import type { SearchParams } from '../../services/searchService';
import type { Hotel } from '../../types/host';
import {
  Loader2,
  Map as MapIcon,
  List as ListIcon,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sort, setSort] = useState('price_asc');
  const [wishlist, setWishlist] = useState<number[]>([]);
  interface Filters {
    minPrice: number;
    maxPrice: number;
    stars: number[];
    amenities: number[];
  }

  const [filters, setFilters] = useState<Filters>({
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 0,
    stars: searchParams.get('stars')?.split(',').map(Number) || [],
    amenities: [],
  });

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await getMyWishlist();
        setWishlist(data.map((item: Wishlist) => item.hotelId));
      } catch {
        // Ignore error if not logged in
      }
    };
    fetchWishlist();
  }, []);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const queryParams: SearchParams = {
          location: searchParams.get('query') || undefined,
          checkIn: searchParams.get('checkIn') || undefined,
          checkOut: searchParams.get('checkOut') || undefined,
          guests: Number(searchParams.get('guests')) || undefined,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          stars:
            filters.stars && filters.stars.length > 0
              ? filters.stars
              : undefined,
          sort: sort,
        };

        const data = await searchHotels(queryParams);
        setHotels(data.content);
      } catch (error) {
        console.error('Search failed', error);
        toast.error('Failed to load search results');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchParams, filters, sort]);

  const handleToggleWishlist = async (e: React.MouseEvent, hotelId: number) => {
    e.stopPropagation();
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

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Top Search Bar */}
        <div className="mb-8">
          <SearchBar
            initialValues={{
              location: searchParams.get('query') || '',
              dates: [
                searchParams.get('checkIn')
                  ? new Date(searchParams.get('checkIn')!)
                  : null,
                searchParams.get('checkOut')
                  ? new Date(searchParams.get('checkOut')!)
                  : null,
              ],
              guests: Number(searchParams.get('guests')) || 1,
            }}
          />
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside
            className={`w-80 hidden lg:block h-fit ${viewMode === 'map' ? 'hidden' : ''}`}
          >
            <FilterSidebar filters={filters} onFilterChange={setFilters} />
          </aside>

          {/* Results */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-slate-900">
                {hotels.length} places found
                {searchParams.get('query') &&
                  ` in ${searchParams.get('query')}`}
              </h1>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="relative group">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer"
                  >
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating_desc">Top Rated</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-brand-accent text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ListIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'map'
                        ? 'bg-brand-accent text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <MapIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
              </div>
            ) : viewMode === 'map' ? (
              <MapView hotels={hotels} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group relative"
                  >
                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => handleToggleWishlist(e, hotel.id)}
                      className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          wishlist.includes(hotel.id)
                            ? 'text-red-500 fill-red-500'
                            : 'text-slate-400 hover:text-red-500'
                        }`}
                      />
                    </button>

                    <div
                      className="cursor-pointer"
                      onClick={() => navigate(`/hotels/${hotel.id}`)}
                    >
                      <div className="relative aspect-[4/3] bg-slate-100">
                        <img
                          src={
                            hotel.images?.[0]?.url
                              ? hotel.images[0].url.startsWith('http')
                                ? hotel.images[0].url
                                : `http://localhost:8080${hotel.images[0].url}`
                              : '/placeholder-hotel.jpg'
                          }
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-lg text-slate-900 mb-1">
                          {hotel.name}
                        </h3>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                          {hotel.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg text-slate-900">
                            From ${/* Placeholder for min price */}100
                            <span className="text-sm text-slate-500 font-normal">
                              /night
                            </span>
                          </span>
                          <button className="px-4 py-2 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primary/90 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
