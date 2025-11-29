import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface FilterSidebarProps {
  filters: {
    minPrice: number;
    maxPrice: number;
    stars: number[];
    amenities: number[];
  };
  onFilterChange: (filters: FilterSidebarProps['filters']) => void;
}

export default function FilterSidebar({
  filters,
  onFilterChange,
}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handlePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'min' | 'max'
  ) => {
    const val = parseInt(e.target.value) || 0;
    const newFilters = {
      ...localFilters,
      [type === 'min' ? 'minPrice' : 'maxPrice']: val,
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleStar = (star: number) => {
    const currentStars = localFilters.stars || [];
    const newStars = currentStars.includes(star)
      ? currentStars.filter((s) => s !== star)
      : [...currentStars, star];

    const newFilters = { ...localFilters, stars: newStars };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-8 sticky top-24">
      {/* Price Range */}
      <div>
        <h3 className="font-bold text-slate-900 mb-4">Price Range</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">
              Min Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                type="number"
                value={localFilters.minPrice || ''}
                onChange={(e) => handlePriceChange(e, 'min')}
                className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-brand-accent outline-none transition-colors"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">
              Max Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                type="number"
                value={localFilters.maxPrice || ''}
                onChange={(e) => handlePriceChange(e, 'max')}
                className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-brand-accent outline-none transition-colors"
                placeholder="Any"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Star Rating */}
      <div>
        <h3 className="font-bold text-slate-900 mb-4">Star Rating</h3>
        <div className="flex flex-col gap-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <label
              key={star}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={localFilters.stars?.includes(star)}
                onChange={() => toggleStar(star)}
                className="w-5 h-5 rounded border-slate-300 text-brand-accent focus:ring-brand-accent/20"
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: star }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
                <span className="text-sm text-slate-600 ml-1 group-hover:text-slate-900">
                  {star} Stars
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
