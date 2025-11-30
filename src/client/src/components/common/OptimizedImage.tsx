import { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  normalizeImageUrl,
  getThumbnailUrl,
  createBlurPlaceholder,
} from '../../utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  lazy?: boolean;
  aspectRatio?: string;
  thumbnailUrl?: string; // Optional thumbnail URL for progressive loading
  useThumbnail?: boolean; // Use thumbnail if available
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  fallback = '/placeholder-hotel.jpg',
  lazy = true,
  aspectRatio,
  thumbnailUrl,
  useThumbnail = true,
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [thumbnailSrc, setThumbnailSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState(false);
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLDivElement>(null);

  // Create blur placeholder
  const blurPlaceholder = createBlurPlaceholder(20, 20);

  useEffect(() => {
    if (!lazy) {
      return;
    }

    const currentRef = imgRef.current;
    if (!currentRef) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [lazy]);

  useEffect(() => {
    if (isInView && src) {
      const normalizedSrc = normalizeImageUrl(src);
      const normalizedThumbnail = thumbnailUrl
        ? normalizeImageUrl(thumbnailUrl)
        : useThumbnail
          ? getThumbnailUrl(src)
          : null;

      // Step 1: Load thumbnail first (if available) for progressive loading
      if (normalizedThumbnail && useThumbnail) {
        const thumbImg = new Image();
        thumbImg.onload = () => {
          setThumbnailSrc(normalizedThumbnail);
          setIsThumbnailLoaded(true);
          setIsLoading(false);
        };
        thumbImg.onerror = () => {
          // If thumbnail fails, continue to load full image
          setIsThumbnailLoaded(false);
        };
        thumbImg.src = normalizedThumbnail;
      } else {
        // No thumbnail, set loading to false to show fallback
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(false);
      }

      // Step 2: Load full image
      const fullImg = new Image();
      fullImg.onload = () => {
        setImageSrc(normalizedSrc);
        setIsFullImageLoaded(true);
        setIsLoading(false);
        setHasError(false);
      };
      fullImg.onerror = () => {
        setIsLoading(false);
        setHasError(true);
        setImageSrc(fallback);
      };
      fullImg.src = normalizedSrc;
    }
  }, [isInView, src, thumbnailUrl, useThumbnail, fallback]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallback);
      setIsLoading(false);
    }
  };

  // Determine which image to show
  const displaySrc = isFullImageLoaded
    ? imageSrc
    : isThumbnailLoaded
      ? thumbnailSrc
      : blurPlaceholder;

  const showBlur = isThumbnailLoaded && !isFullImageLoaded;

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Blur placeholder background */}
      {(isLoading || showBlur) && (
        <div
          className="absolute inset-0 bg-slate-100 flex items-center justify-center"
          style={{
            backgroundImage: `url(${blurPlaceholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
          }}
        />
      )}

      {/* Thumbnail (shown while loading full image) */}
      {isThumbnailLoaded && !isFullImageLoaded && thumbnailSrc && (
        <img
          src={thumbnailSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(5px)', transform: 'scale(1.1)' }}
          aria-hidden="true"
        />
      )}

      {/* Loading spinner */}
      {isLoading && !isThumbnailLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-brand-accent" />
        </div>
      )}

      {/* Full image */}
      {isInView && (
        <img
          src={displaySrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isFullImageLoaded
              ? 'opacity-100'
              : isThumbnailLoaded
                ? 'opacity-0'
                : 'opacity-0'
          } ${className.includes('object-') ? '' : 'object-cover'}`}
          onError={handleError}
          onLoad={() => {
            if (!isThumbnailLoaded) {
              setIsLoading(false);
            }
          }}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
        />
      )}
    </div>
  );
}
