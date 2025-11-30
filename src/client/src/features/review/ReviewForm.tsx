import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  createReview,
  uploadPhotos,
  getReviewByBooking,
  type Review,
} from '../../services/reviewService';
import { getBooking } from '../../services/bookingService';
import { Star, Upload, X, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewForm() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [hotelName, setHotelName] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const fetchData = async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      // Check if review already exists
      try {
        const review = await getReviewByBooking(parseInt(bookingId));
        setExistingReview(review);
        setRating(review.rating);
        setComment(review.comment || '');
        if (review.images) {
          try {
            const images = JSON.parse(review.images) as string[];
            setPhotoUrls(images);
          } catch (e) {
            console.error('Failed to parse images:', e);
          }
        }
      } catch {
        // Review doesn't exist yet, that's ok
      }

      // Get booking info for hotel name
      try {
        const booking = await getBooking(parseInt(bookingId));
        setHotelName(booking.hotelName || '');
      } catch (error) {
        console.error('Failed to fetch booking:', error);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Không thể tải thông tin đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length + photos.length > 10) {
      toast.error('Tối đa 10 ảnh');
      return;
    }

    setPhotos((prev) => [...prev, ...imageFiles]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemovePhotoUrl = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || submitting) return;

    if (rating < 1 || rating > 5) {
      toast.error('Vui lòng chọn số sao từ 1 đến 5');
      return;
    }

    try {
      setSubmitting(true);

      // Upload photos if any
      let uploadedPhotoUrls: string[] = [];
      if (photos.length > 0) {
        setUploadingPhotos(true);
        try {
          uploadedPhotoUrls = await uploadPhotos(photos);
          setPhotoUrls((prev) => [...prev, ...uploadedPhotoUrls]);
        } catch (error) {
          console.error('Failed to upload photos:', error);
          toast.error('Không thể tải lên ảnh');
          setUploadingPhotos(false);
          setSubmitting(false);
          return;
        } finally {
          setUploadingPhotos(false);
        }
      }

      // Create review with all photo URLs
      const allPhotoUrls = [...photoUrls, ...uploadedPhotoUrls];
      await createReview({
        bookingId: parseInt(bookingId),
        rating,
        comment: comment.trim() || undefined,
        photoUrls: allPhotoUrls.length > 0 ? allPhotoUrls : undefined,
      });

      toast.success(
        existingReview
          ? 'Cập nhật đánh giá thành công!'
          : 'Gửi đánh giá thành công!'
      );
      navigate(-1);
    } catch (error: unknown) {
      console.error('Failed to submit review:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể gửi đánh giá';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    const baseUrl = (
      import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
    ).replace(/\/api$/, '');
    return `${baseUrl}${url}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-bg via-white to-brand-bg/50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-brand-dark/5 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-brand-dark" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-brand-dark">
                {existingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
              </h1>
              {hotelName && (
                <p className="text-sm text-brand-dark/60 mt-1">{hotelName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-6">
            <label className="block text-lg font-bold text-brand-dark mb-4">
              Đánh giá của bạn *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-2 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-6">
            <label
              htmlFor="comment"
              className="block text-lg font-bold text-brand-dark mb-4"
            >
              Nhận xét (tùy chọn)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              className="w-full resize-none rounded-xl border border-brand-dark/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent text-brand-dark placeholder:text-brand-dark/40"
            />
          </div>

          {/* Photos */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-6">
            <label className="block text-lg font-bold text-brand-dark mb-4">
              Ảnh (tùy chọn, tối đa 10 ảnh)
            </label>

            {/* Existing Photos */}
            {photoUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mb-4">
                {photoUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={getImageUrl(url)}
                      alt={`Review photo ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhotoUrl(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Photos Preview */}
            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mb-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {photoUrls.length + photos.length < 10 && (
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                  disabled={uploadingPhotos}
                />
                <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-brand-dark/20 rounded-xl hover:border-brand-accent transition-colors text-brand-dark/60 hover:text-brand-accent">
                  <Upload className="w-5 h-5" />
                  <span>Thêm ảnh</span>
                </div>
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-4 bg-white text-brand-dark rounded-xl border border-brand-dark/10 hover:bg-brand-dark/5 transition-colors font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingPhotos || rating < 1}
              className="flex-1 px-6 py-4 bg-brand-accent text-white rounded-xl hover:bg-brand-accent/90 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting || uploadingPhotos ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  {existingReview ? 'Cập nhật' : 'Gửi đánh giá'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
