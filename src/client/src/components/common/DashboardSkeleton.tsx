import Skeleton from './Skeleton';

/**
 * Dashboard Overview Skeleton
 */
export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Section Skeleton */}
      <Skeleton
        variant="rectangular"
        className="w-full h-32 rounded-3xl"
        animation="pulse"
      />

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <Skeleton
              variant="circular"
              width={48}
              height={48}
              className="mb-4"
            />
            <Skeleton variant="text" width="60%" height={32} className="mb-2" />
            <Skeleton variant="text" width="40%" height={16} />
            <Skeleton variant="text" width="50%" height={12} className="mt-2" />
          </div>
        ))}
      </div>

      {/* Action Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            className="w-full h-32 rounded-2xl"
            animation="pulse"
          />
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <Skeleton variant="text" width="30%" height={24} className="mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
            >
              <div className="flex-1">
                <Skeleton
                  variant="text"
                  width="40%"
                  height={18}
                  className="mb-2"
                />
                <Skeleton variant="text" width="60%" height={14} />
              </div>
              <div className="text-right">
                <Skeleton
                  variant="text"
                  width={80}
                  height={18}
                  className="mb-1"
                />
                <Skeleton variant="text" width={60} height={12} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Analytics Skeleton
 */
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton variant="text" width="20%" height={28} className="mb-2" />
          <Skeleton variant="text" width="40%" height={16} />
        </div>
        <div className="flex gap-4">
          <Skeleton
            variant="rectangular"
            width={150}
            height={40}
            className="rounded-xl"
          />
          <Skeleton
            variant="rectangular"
            width={200}
            height={40}
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 border border-slate-100"
          >
            <Skeleton
              variant="circular"
              width={48}
              height={48}
              className="mb-4"
            />
            <Skeleton variant="text" width="70%" height={32} className="mb-2" />
            <Skeleton variant="text" width="50%" height={16} />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <Skeleton variant="text" width="40%" height={24} className="mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <Skeleton variant="text" width={80} height={14} />
                <Skeleton variant="text" width={100} height={14} />
              </div>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={12}
                className="rounded-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Earnings Skeleton
 */
export function EarningsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton variant="text" width="20%" height={28} className="mb-2" />
          <Skeleton variant="text" width="40%" height={16} />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200">
        <div className="flex items-center gap-4">
          <Skeleton
            variant="rectangular"
            width={150}
            height={40}
            className="rounded-xl"
          />
          <Skeleton
            variant="rectangular"
            width={120}
            height={40}
            className="rounded-xl"
          />
          <Skeleton
            variant="rectangular"
            width={120}
            height={40}
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            className="w-full h-40 rounded-2xl"
            animation="pulse"
          />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <Skeleton variant="text" width="30%" height={24} />
          <Skeleton
            variant="rectangular"
            width={120}
            height={36}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border-b border-slate-100"
            >
              <Skeleton variant="text" width="15%" height={16} />
              <Skeleton variant="text" width="20%" height={16} />
              <Skeleton variant="text" width="15%" height={16} />
              <Skeleton variant="text" width="15%" height={16} />
              <Skeleton variant="text" width="15%" height={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
