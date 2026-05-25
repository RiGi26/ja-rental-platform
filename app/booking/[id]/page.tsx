interface Props {
  params: Promise<{ id: string }>
}

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-display font-bold text-text mb-6">Detail Booking</h1>
        <p className="text-text-muted text-sm">Booking ID: {id}</p>
        {/* TODO: seat picker → form penumpang → pembayaran → e-ticket */}
      </div>
    </main>
  )
}
