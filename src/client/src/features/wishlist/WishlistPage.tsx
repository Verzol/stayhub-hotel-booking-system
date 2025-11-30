import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMyWishlist,
  toggleWishlist,
  type Wishlist,
} from '../../services/wishlistService';
import { getHotelDetails } from '../../services/searchService';
import type { Hotel } from '../../types/host';
import { Loader2, Heart, MapPin, Star, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import HotelImage from '../../components/common/HotelImage';

export default function WishlistPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<Hotel[]>([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const wishlistData = await getMyWishlist();
        const hotelPromises = wishlistData.map((item: Wishlist) =>
          getHotelDetails(item.hotelId).catch(() => null)
        );
        const hotels = await Promise.all(hotelPromises);
        setWishlistItems(hotels.filter((h): h is Hotel => h !== null));
      } catch (error) {
        console.error('Failed to load wishlist', error);
        toast.error('Không thể tải danh sách yêu thích của bạn');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = async (e: React.MouseEvent, hotelId: number) => {
    e.stopPropagation();
    try {
      await toggleWishlist(hotelId);
      setWishlistItems((prev) => prev.filter((h) => h.id !== hotelId));
      toast.success('Đã xóa khỏi danh sách yêu thích');
    } catch {
      toast.error('Không thể xóa khỏi danh sách yêu thích');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-black text-slate-900 mb-8">
          Danh sách yêu thích của tôi
        </h1>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Danh sách yêu thích của bạn đang trống
            </h2>
            <p className="text-slate-500 mb-6">
              Bắt đầu khám phá khách sạn và lưu những nơi bạn yêu thích!
            </p>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 transition-colors"
            >
              Khám phá khách sạn
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((hotel) => (
              <div
                key={hotel.id}
                onClick={() => navigate(`/hotels/${hotel.id}`)}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group relative cursor-pointer"
              >
                <button
                  onClick={(e) => handleRemove(e, hotel.id)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors group/btn"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-red-500 group-hover/btn:scale-110 transition-transform" />
                </button>

                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <HotelImage
                    src={hotel.images?.[0]?.url || null}
                    alt={hotel.name}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    aspectRatio="4/3"
                    lazy={true}
                  />
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">
                      {hotel.city}, {hotel.country}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1 bg-brand-accent/10 px-2 py-1 rounded-lg">
                      <Star className="w-3 h-3 text-brand-accent fill-brand-accent" />
                      <span className="text-xs font-bold text-brand-accent">
                        {hotel.starRating} Sao
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-brand-primary font-bold text-sm group-hover:translate-x-1 transition-transform">
                      Xem chi tiết
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
