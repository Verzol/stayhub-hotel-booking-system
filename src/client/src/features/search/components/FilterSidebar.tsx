import { useState, useEffect, useRef } from 'react';
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

  // Debounce price changes to avoid too many updates
  const priceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

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

    // Debounce the filter change (800ms for price input)
    if (priceTimeoutRef.current) {
      clearTimeout(priceTimeoutRef.current);
    }
    priceTimeoutRef.current = setTimeout(() => {
      onFilterChange(newFilters);
    }, 800);
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (priceTimeoutRef.current) {
        clearTimeout(priceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-8 sticky top-24">
      {/* Price Range */}
      <div>
        <h3 className="font-bold text-slate-900 mb-4">Khoảng giá</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">
              Giá tối thiểu
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                ₫
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
              Giá tối đa
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                ₫
              </span>
              <input
                type="number"
                value={localFilters.maxPrice || ''}
                onChange={(e) => handlePriceChange(e, 'max')}
                className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-brand-accent outline-none transition-colors"
                placeholder="Bất kỳ"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Star Rating */}
      <div>
        <h3 className="font-bold text-slate-900 mb-4">Xếp hạng sao</h3>
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
                  {star} Sao
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
