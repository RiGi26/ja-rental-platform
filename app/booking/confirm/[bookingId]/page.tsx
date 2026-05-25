interface Props {
  params: Promise<{ bookingId: string }>
}

export default async function BookingConfirmPage({ params }: Props) {
  const { bookingId } = await params

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="bg-bg-card rounded-2xl shadow-card p-8 max-w-lg w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-display font-bold text-text mb-2">Booking Dikonfirmasi!</h1>
        <p className="text-text-muted mb-6">
          Kode Booking: <span className="font-mono font-bold text-primary">{bookingId}</span>
        </p>
        {/* TODO: tampilkan e-ticket, QR code, download PDF */}
      </div>
    </main>
  )
}
