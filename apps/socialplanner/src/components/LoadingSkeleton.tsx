'use client';

interface LoadingSkeletonProps {
  variant: 'card' | 'table' | 'form' | 'stats';
  count?: number;
}

export default function LoadingSkeleton({ variant, count = 1 }: LoadingSkeletonProps) {
  const renderCard = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-gray-200 rounded-lg w-20" />
        <div className="h-8 bg-gray-100 rounded-lg w-16" />
      </div>
    </div>
  );

  const renderTable = () => {
    const rows = Array.from({ length: count }, (_, i) => i);
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="h-5 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="divide-y divide-gray-100">
          {rows.map((i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/5" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
              <div className="flex gap-2">
                <div className="h-7 bg-gray-100 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-100 rounded-full w-12" />
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-100 rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-24 bg-gray-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-100 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-100 rounded-lg" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-100 rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-100 rounded-lg" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <div className="h-10 bg-gray-200 rounded-lg w-32" />
        <div className="h-10 bg-gray-100 rounded-lg w-24" />
      </div>
    </div>
  );

  const renderStats = () => {
    const stats = Array.from({ length: count }, (_, i) => i);
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {stats.map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="w-8 h-8 bg-gray-100 rounded-lg" />
            </div>
            <div className="h-7 bg-gray-200 rounded w-1/2 mb-1" />
            <div className="h-3 bg-gray-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  };

  switch (variant) {
    case 'card':
      return renderCard();
    case 'table':
      return renderTable();
    case 'form':
      return renderForm();
    case 'stats':
      return renderStats();
    default:
      return null;
  }
}
