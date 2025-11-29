import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Tag,
  Calendar,
  ArrowLeft,
  Percent,
  DollarSign,
  Users,
  Edit,
  Power,
} from 'lucide-react';
import type { Promotion, Hotel } from '../../../types/host';
import {
  getHotelPromotions,
  togglePromotion,
} from '../../../services/hostService';
import { toast } from 'sonner';

interface PromotionListProps {
  hotel: Hotel;
  onCreate: () => void;
  onEdit: (promotion: Promotion) => void;
  onBack: () => void;
}

export default function PromotionList({
  hotel,
  onCreate,
  onEdit,
  onBack,
}: PromotionListProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHotelPromotions(hotel.id);
      setPromotions(data);
    } catch (error) {
      console.error('Failed to load promotions', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  }, [hotel.id]);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const handleToggle = async (id: number) => {
    try {
      await togglePromotion(id);
      toast.success('Promotion status updated');
      loadPromotions();
    } catch (error) {
      console.error('Failed to toggle promotion', error);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Promotions</h2>
            <p className="text-slate-500 font-medium">
              Manage coupons for {hotel.name}
            </p>
          </div>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-cta hover:bg-brand-cta-hover text-white rounded-xl transition-all shadow-lg shadow-brand-cta/30 font-bold text-sm hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-slate-50 rounded-2xl animate-pulse border border-slate-100"
            />
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Tag className="w-12 h-12 text-orange-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            No promotions found
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
            Create coupons to attract more guests and boost your bookings.
          </p>
          <button
            onClick={onCreate}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Create First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl hover:border-brand-accent/30 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 z-10 flex gap-2">
                <button
                  onClick={() => onEdit(promo)}
                  className="p-1.5 bg-white/80 backdrop-blur rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggle(promo.id)}
                  className={`p-1.5 bg-white/80 backdrop-blur rounded-lg transition-colors ${
                    promo.isActive
                      ? 'text-green-500 hover:text-red-500 hover:bg-red-50'
                      : 'text-slate-400 hover:text-green-500 hover:bg-green-50'
                  }`}
                  title={promo.isActive ? 'Deactivate' : 'Activate'}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              {/* Decorative background circle */}
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />

              <div className="flex items-center gap-4 mb-6 relative">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center shadow-inner border border-orange-100">
                  <Tag className="w-7 h-7 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-black text-2xl text-slate-900 tracking-tight">
                    {promo.code}
                  </h3>
                  <div className="flex items-center gap-1 text-orange-600 font-bold">
                    <Percent className="w-4 h-4" />
                    <span>{promo.discountPercent}% OFF</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-600 relative">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">
                    {new Date(promo.startDate).toLocaleDateString()} -{' '}
                    {new Date(promo.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-400 font-bold mb-1 uppercase">
                      Max Discount
                    </div>
                    <div className="flex items-center gap-1 font-bold text-slate-900">
                      <DollarSign className="w-3 h-3" />
                      {promo.maxDiscountAmount}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-400 font-bold mb-1 uppercase">
                      Usage Limit
                    </div>
                    <div className="flex items-center gap-1 font-bold text-slate-900">
                      <Users className="w-3 h-3" />
                      {promo.maxUsage}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    promo.isActive
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {promo.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
