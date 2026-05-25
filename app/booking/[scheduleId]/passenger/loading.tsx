export default function PassengerLoading() {
  return (
    <main className="min-h-screen bg-bg-base py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-4 animate-pulse">
        {/* Steps */}
        <div className="h-16 bg-bg-card rounded-2xl shadow-card" />

        {/* Checkbox */}
        <div className="h-14 bg-bg-card rounded-2xl shadow-card" />

        {/* Form cards */}
        {[1, 2].map(i => (
          <div key={i} className="bg-bg-card rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-100" />
                <div className="h-5 w-28 bg-slate-100 rounded" />
              </div>
              <div className="h-5 w-16 bg-slate-100 rounded-full" />
            </div>
            <div className="h-3 w-20 bg-slate-100 rounded mb-2" />
            <div className="h-12 bg-slate-100 rounded-xl mb-4" />
            <div className="h-3 w-24 bg-slate-100 rounded mb-2" />
            <div className="h-12 bg-slate-100 rounded-xl" />
          </div>
        ))}

        <div className="h-14 bg-slate-200 rounded-xl" />
      </div>
    </main>
  )
}
