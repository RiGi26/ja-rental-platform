export default function BookingLoading() {
  return (
    <main className="min-h-screen bg-bg-base py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Schedule summary skeleton */}
        <div className="rounded-2xl overflow-hidden shadow-card mb-6 animate-pulse">
          <div className="px-5 py-4 bg-blue-50">
            <div className="h-7 w-48 bg-blue-200 rounded mb-3" />
            <div className="h-4 w-64 bg-blue-100 rounded mb-2" />
            <div className="h-4 w-56 bg-blue-100 rounded" />
          </div>
        </div>

        {/* Seat picker skeleton */}
        <div className="bg-bg-card rounded-2xl shadow-card p-6 animate-pulse">
          <div className="h-5 w-28 bg-slate-200 rounded mb-1" />
          <div className="h-4 w-48 bg-slate-100 rounded mb-5" />
          <div className="flex gap-3 mb-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-5 h-5 rounded bg-slate-200" />
            ))}
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map(row => (
              <div key={row} className="flex gap-1.5">
                <div className="w-5 h-11 bg-slate-100 rounded" />
                {[1, 2, 3].map(col => (
                  <div key={col} className="w-11 h-11 rounded-xl bg-slate-100" />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Pickup point skeleton */}
        <div className="bg-bg-card rounded-2xl shadow-card p-6 animate-pulse">
          <div className="h-5 w-24 bg-slate-200 rounded mb-1" />
          <div className="h-4 w-48 bg-slate-100 rounded mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>

        {/* CTA skeleton */}
        <div className="bg-bg-card rounded-2xl shadow-card p-5 animate-pulse">
          <div className="flex justify-between mb-4">
            <div>
              <div className="h-3 w-16 bg-slate-100 rounded mb-1" />
              <div className="h-7 w-32 bg-slate-200 rounded mb-1" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-12 w-full rounded-xl bg-slate-200" />
        </div>
      </div>
    </main>
  )
}
