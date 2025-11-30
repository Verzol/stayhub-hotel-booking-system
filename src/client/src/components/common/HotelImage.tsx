import OptimizedImage from './OptimizedImage';
import { normalizeImageUrl } from '../../utils/imageOptimization';

interface HotelImageProps {
  src: string | undefined | null;
  alt: string;
  className?: string;
  lazy?: boolean;
  aspectRatio?: string;
}

/**
 * Simplified image component for hotel images
 * Wraps OptimizedImage with hotel-specific defaults
 */
export default function HotelImage({
  src,
  alt,
  className = '',
  lazy = true,
  aspectRatio = '4/3',
}: HotelImageProps) {
  if (!src) {
    return (
      <div
        className={`bg-slate-200 flex items-center justify-center ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <span className="text-slate-400 text-sm">No image</span>
      </div>
    );
  }

  // normalizeImageUrl will handle both relative and absolute URLs
  const imageSrc = normalizeImageUrl(src);

  return (
    <OptimizedImage
      src={imageSrc}
      alt={alt}
      className={className}
      lazy={lazy}
      aspectRatio={aspectRatio}
      fallback="/placeholder-hotel.jpg"
    />
  );
}
