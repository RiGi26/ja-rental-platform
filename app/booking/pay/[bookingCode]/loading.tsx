export default function PayLoading() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm">Menyiapkan pembayaran...</p>
      </div>
    </main>
  )
}
