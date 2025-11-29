import { useForm } from 'react-hook-form';
import { Save, ArrowLeft } from 'lucide-react';
import type { PromotionDTO, Hotel, Promotion } from '../../../types/host';
import {
  createPromotion,
  updatePromotion,
} from '../../../services/hostService';
import { toast } from 'sonner';

interface PromotionFormProps {
  hotel: Hotel;
  promotion?: Promotion;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PromotionForm({
  hotel,
  promotion,
  onSuccess,
  onCancel,
}: PromotionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PromotionDTO>({
    defaultValues: promotion
      ? {
          code: promotion.code,
          discountPercent: promotion.discountPercent,
          maxDiscountAmount: promotion.maxDiscountAmount,
          startDate: promotion.startDate,
          endDate: promotion.endDate,
          maxUsage: promotion.maxUsage,
          isActive: promotion.isActive,
        }
      : {
          isActive: true,
          maxUsage: 100,
        },
  });

  const onSubmit = async (data: PromotionDTO) => {
    try {
      if (promotion) {
        await updatePromotion(promotion.id, data);
        toast.success('Promotion updated successfully');
      } else {
        await createPromotion(hotel.id, data);
        toast.success('Promotion created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save promotion', error);
      toast.error('Failed to save promotion');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <h2 className="text-xl font-bold text-slate-900">
            {promotion ? 'Edit Promotion' : 'Create New Promotion'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Coupon Code
            </label>
            <input
              {...register('code', { required: 'Code is required' })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all uppercase font-bold tracking-wider"
              placeholder="e.g. SUMMER2025"
            />
            {errors.code && (
              <span className="text-red-500 text-xs mt-1">
                {errors.code.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Discount Percentage (%)
            </label>
            <input
              type="number"
              {...register('discountPercent', {
                required: 'Required',
                min: 1,
                max: 100,
                valueAsNumber: true,
              })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Max Discount Amount ($)
            </label>
            <input
              type="number"
              {...register('maxDiscountAmount', {
                required: 'Required',
                valueAsNumber: true,
              })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Start Date
            </label>
            <input
              type="datetime-local"
              {...register('startDate', { required: 'Required' })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              End Date
            </label>
            <input
              type="datetime-local"
              {...register('endDate', { required: 'Required' })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Max Usage Limit
            </label>
            <input
              type="number"
              {...register('maxUsage', {
                required: 'Required',
                valueAsNumber: true,
              })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex items-center h-full pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-5 h-5 text-brand-accent rounded focus:ring-brand-accent"
              />
              <span className="font-bold text-slate-700">
                Active immediately
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isSubmitting
              ? 'Saving...'
              : promotion
                ? 'Update Promotion'
                : 'Create Promotion'}
          </button>
        </div>
      </form>
    </div>
  );
}
