import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Percent,
  MapPin,
  Star,
  Calendar,
  Tag,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  getActivePromotions,
  type PublicPromotion,
} from '../../services/promotionService';
import { toast } from 'sonner';
import HotelImage from '../../components/common/HotelImage';
import { formatVND } from '../../utils/currency';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<PublicPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const data = await getActivePromotions();
      setPromotions(data);
    } catch (error) {
      console.error('Failed to fetch promotions', error);
      toast.error('Không thể tải danh sách ưu đãi');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHotel = (hotelId: number) => {
    navigate(`/hotels/${hotelId}`);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-brand-accent animate-spin" />
              <p className="text-slate-500 font-medium">Đang tải ưu đãi...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-accent to-brand-dark rounded-3xl mb-6 shadow-xl shadow-brand-accent/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-brand-dark mb-4">
            Ưu đãi đặc biệt
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
            Khám phá các chương trình khuyến mãi hấp dẫn từ các khách sạn hàng
            đầu
          </p>
        </div>

        {/* Promotions Grid */}
        {promotions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Tag className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Hiện chưa có ưu đãi nào
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Các ưu đãi mới sẽ được cập nhật sớm. Hãy quay lại sau nhé!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl hover:border-brand-accent/30 transition-all duration-300 group cursor-pointer"
                onClick={() => handleViewHotel(promotion.hotelId)}
              >
                {/* Hotel Image */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  {promotion.hotelThumbnailUrl ? (
                    <HotelImage
                      src={promotion.hotelThumbnailUrl}
                      alt={promotion.hotelName}
                      className="w-full h-full group-hover:scale-110 transition-transform duration-700"
                      aspectRatio="16/9"
                      lazy={true}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-accent/20 to-brand-dark/20">
                      <Tag className="w-16 h-16 text-brand-accent/50" />
                    </div>
                  )}

                  {/* Discount Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-br from-red-500 to-red-600 text-white px-4 py-2 rounded-xl shadow-lg font-black text-lg">
                    -{promotion.discountPercent}%
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Hotel Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-black text-xl text-slate-900 group-hover:text-brand-accent transition-colors line-clamp-1">
                        {promotion.hotelName}
                      </h3>
                      {promotion.hotelStarRating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-bold text-slate-600">
                            {promotion.hotelStarRating}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <MapPin className="w-4 h-4 text-brand-accent" />
                      <span className="line-clamp-1">
                        {promotion.hotelCity}
                        {promotion.hotelAddress &&
                          `, ${promotion.hotelAddress}`}
                      </span>
                    </div>
                  </div>

                  {/* Promotion Code */}
                  <div className="bg-gradient-to-r from-brand-accent/10 to-brand-dark/10 rounded-xl p-4 mb-4 border border-brand-accent/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                          Mã giảm giá
                        </p>
                        <p className="text-2xl font-black text-brand-dark tracking-wider">
                          {promotion.code}
                        </p>
                      </div>
                      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md">
                        <Percent className="w-8 h-8 text-brand-accent" />
                      </div>
                    </div>
                  </div>

                  {/* Promotion Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Tag className="w-4 h-4 text-brand-accent" />
                        <span className="font-medium">Giảm giá:</span>
                      </div>
                      <span className="font-black text-brand-accent">
                        {promotion.discountPercent}%
                      </span>
                    </div>

                    {promotion.maxDiscountAmount && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <span className="font-medium">Tối đa:</span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {formatVND(promotion.maxDiscountAmount)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4 text-brand-accent" />
                        <span className="font-medium">Hiệu lực:</span>
                      </div>
                      <span className="font-medium text-slate-700 text-right">
                        {formatDate(promotion.startDate)} -{' '}
                        {formatDate(promotion.endDate)}
                      </span>
                    </div>

                    {promotion.maxUsage && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Số lượt sử dụng:</span>
                        <span className="font-bold text-slate-700">
                          {promotion.currentUsage || 0}/{promotion.maxUsage}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewHotel(promotion.hotelId);
                    }}
                    className="w-full py-3 bg-brand-cta hover:bg-brand-cta-hover text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-cta/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    Xem khách sạn
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
