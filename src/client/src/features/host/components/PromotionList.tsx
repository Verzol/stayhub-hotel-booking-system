import { useEffect, useState } from 'react';
import { Plus, Tag, Calendar, ArrowLeft } from 'lucide-react';
import type { Promotion, Hotel } from '../../../types/host';
import { getHotelPromotions } from '../../../services/hostService';
import { toast } from 'sonner';

interface PromotionListProps {
  hotel: Hotel;
  onCreate: () => void;
  onBack: () => void;
}

export default function PromotionList({ hotel, onCreate, onBack }: PromotionListProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromotions();
  }, [hotel.id]);

  const loadPromotions = async () => {
    try {
      const data = await getHotelPromotions(hotel.id);
      setPromotions(data);
    } catch (error) {
      console.error('Failed to load promotions', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading promotions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Promotions</h2>
            <p className="text-slate-500 font-medium">Manage coupons for {hotel.name}</p>
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

      {promotions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Tag className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No promotions found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
            Create coupons to attract more guests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${promo.isActive ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                  {promo.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Tag className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900">{promo.code}</h3>
                  <p className="text-orange-500 font-bold">{promo.discountPercent}% OFF</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span>Max Discount: <span className="font-bold text-slate-900">${promo.maxDiscountAmount}</span></span>
                  <span>Usage: <span className="font-bold text-slate-900">{promo.maxUsage}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
