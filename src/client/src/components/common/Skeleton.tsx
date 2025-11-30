interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Reusable Skeleton component for loading states
 */
export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-slate-200 rounded';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height)
    style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  );
}

/**
 * Hotel Card Skeleton
 */
export function HotelCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100">
      <Skeleton variant="rectangular" height={200} className="w-full" />
      <div className="p-5 space-y-3">
        <Skeleton variant="text" width="75%" height={16} />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="50%" height={14} />
        <div className="flex items-center justify-between pt-4">
          <Skeleton variant="text" width={80} height={24} />
          <Skeleton
            variant="rectangular"
            width={100}
            height={36}
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Image Skeleton với aspect ratio
 */
export function ImageSkeleton({
  aspectRatio = '4/3',
  className = '',
}: {
  aspectRatio?: string;
  className?: string;
}) {
  return (
    <div className={`w-full ${className}`} style={{ aspectRatio }}>
      <Skeleton variant="rectangular" className="w-full h-full" />
    </div>
  );
}
