interface Props {
  params: Promise<{ bookingId: string }>
}

export default async function TrackingPage({ params }: Props) {
  const { bookingId } = await params

  return (
    <main className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-display font-bold text-text mb-4">Live Tracking</h1>
        <p className="text-text-muted text-sm mb-6">Booking ID: {bookingId}</p>
        {/* TODO: Google Maps embed + realtime status via Supabase Realtime */}
        <div className="bg-slate-200 rounded-2xl h-80 flex items-center justify-center text-text-muted">
          Peta tracking — Sprint 5
        </div>
      </div>
    </main>
  )
}
