export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-6 h-[160px]" style={{ borderRadius: 24 }}>
            <div className="flex justify-between mb-6">
              <div className="w-12 h-12 bg-slate-100 rounded-xl" />
              <div className="w-10 h-3 bg-slate-50 rounded" />
            </div>
            <div className="space-y-3">
              <div className="w-24 h-8 bg-slate-100 rounded" />
              <div className="w-16 h-3 bg-slate-50 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Content grid Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">
        <div className="bg-white p-8 h-[400px]" style={{ borderRadius: 24 }}>
          <div className="w-48 h-6 bg-slate-100 rounded mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-full h-12 bg-slate-50 rounded" />
            ))}
          </div>
        </div>
        <div className="bg-white p-8 h-[400px]" style={{ borderRadius: 24 }}>
          <div className="w-48 h-6 bg-slate-100 rounded mb-8" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-14 bg-slate-50 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
