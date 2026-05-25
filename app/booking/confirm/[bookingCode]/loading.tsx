export default function ConfirmLoading() {
  return (
    <main className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-lg mx-auto space-y-6 animate-pulse">
        <div className="h-36 bg-green-50 rounded-2xl" />
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
          <div className="h-40 bg-blue-100" />
          <div className="p-6 space-y-3">
            <div className="h-4 bg-slate-100 rounded w-48" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 h-12 bg-slate-100 rounded-xl" />
          <div className="flex-1 h-12 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </main>
  )
}
