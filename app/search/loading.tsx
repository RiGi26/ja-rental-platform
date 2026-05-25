export default function SearchLoading() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Header skeleton */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="skeleton w-16 h-5 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton w-48 h-5 rounded-lg" />
            <div className="skeleton w-32 h-3.5 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filter sidebar skeleton */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-bg-card rounded-2xl shadow-card p-5 space-y-4">
              <div className="skeleton h-5 w-32 rounded-lg" />
              <div className="space-y-2.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton h-4 w-full rounded-lg" />
                ))}
              </div>
              <div className="skeleton h-5 w-28 rounded-lg mt-4" />
              <div className="space-y-2.5">
                {[1, 2].map(i => (
                  <div key={i} className="skeleton h-4 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </aside>

          {/* Cards skeleton */}
          <div className="flex-1 space-y-3">
            <div className="skeleton h-4 w-40 rounded-lg mb-4" />
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-bg-card rounded-2xl shadow-card border border-slate-100 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-4 w-32 rounded-lg" />
                    <div className="skeleton h-3 w-20 rounded-lg" />
                  </div>
                  <div className="skeleton h-4 w-10 rounded-lg" />
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="skeleton h-8 w-16 rounded-lg" />
                  <div className="flex-1 skeleton h-2 rounded-full" />
                  <div className="skeleton h-8 w-16 rounded-lg" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="skeleton h-6 w-24 rounded-lg" />
                  <div className="skeleton h-9 w-20 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
