export default function ReviewLoading() {
  return (
    <main className="min-h-screen bg-bg-base py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-4 animate-pulse">
        {/* Steps */}
        <div className="h-16 bg-bg-card rounded-2xl shadow-card" />

        {/* Schedule summary */}
        <div className="h-36 bg-blue-50 rounded-2xl" />

        {/* Review card */}
        <div className="bg-bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-blue-50 to-blue-100" />
          <div className="px-6 py-4 border-b border-slate-50 space-y-3">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            {[1, 2].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <div className="h-4 w-36 bg-slate-100 rounded mb-1.5" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
                <div className="h-6 w-16 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-b border-slate-50 space-y-2">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-4 w-44 bg-slate-100 rounded" />
            <div className="h-3 w-56 bg-slate-100 rounded" />
          </div>
          <div className="px-6 py-4 space-y-2">
            <div className="h-3 w-24 bg-slate-100 rounded" />
            {[1, 2].map(i => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-44 bg-slate-100 rounded" />
                <div className="h-4 w-20 bg-slate-100 rounded" />
              </div>
            ))}
            <div className="border-t border-slate-100 pt-2 flex justify-between">
              <div className="h-5 w-12 bg-slate-200 rounded" />
              <div className="h-6 w-28 bg-primary/20 rounded" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <div className="h-14 w-28 bg-slate-100 rounded-xl" />
          <div className="h-14 flex-1 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </main>
  )
}
