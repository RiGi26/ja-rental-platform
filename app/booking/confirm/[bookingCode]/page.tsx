import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/service'
import ETicket from '@/components/ticket/ETicket'

interface Props {
  params: Promise<{ bookingCode: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookingCode } = await params
  return { title: `Konfirmasi Booking ${bookingCode}` }
}

export default async function ConfirmPage({ params }: Props) {
  const { bookingCode } = await params
  const supabase = createServiceClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, booking_code, schedule_id, payment_status, total_amount, pickup_point_id,
      passengers(*),
      schedule:schedules(
        depart_at,
        route:routes(origin, destination),
        vehicle:vehicles(brand, model, plate)
      )
    `)
    .eq('booking_code', bookingCode)
    .single()

  if (!booking) {
    redirect('/')
  }

  // Jika belum bayar → redirect ke halaman pay
  if (booking.payment_status !== 'paid') {
    redirect(`/booking/pay/${bookingCode}`)
  }

  const passengers = (booking.passengers ?? []) as {
    name: string
    seat_number: string
    pickup_point_id: string | null
  }[]

  const scheduleRaw = (booking.schedule as unknown) as {
    depart_at: string
    route?: { origin: string; destination: string }
    vehicle?: { brand: string; model: string; plate: string }
  } | null

  // Ambil pickup point labels dari booking jika ada pickup_points
  const pickupPoints: { id: string; label: string }[] = []
  if (booking.pickup_point_id && (booking as { schedule_id?: string }).schedule_id) {
    const { data: schedData } = await supabase
      .from('schedules')
      .select('pickup_points')
      .eq('id', (booking as { schedule_id?: string }).schedule_id!)
      .maybeSingle()
    const raw = (schedData?.pickup_points ?? []) as { id: string; label: string }[]
    pickupPoints.push(...raw)
  }

  return (
    <main className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Success banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="text-5xl mb-3">✅</div>
          <h1 className="font-display font-bold text-2xl text-green-800 mb-1">
            Pembayaran Berhasil!
          </h1>
          <p className="text-green-600 text-sm">
            Tiket perjalananmu sudah siap. Tunjukkan QR code ini saat boarding.
          </p>
        </div>

        {/* E-Ticket */}
        <ETicket
          bookingCode={bookingCode}
          totalAmount={booking.total_amount as number}
          paymentStatus={booking.payment_status as string}
          schedule={scheduleRaw}
          passengers={passengers}
          pickupPoints={pickupPoints}
        />

        {/* Tombol aksi */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 text-center text-sm font-semibold text-slate-600 bg-slate-100
                       hover:bg-slate-200 px-5 py-3 rounded-xl transition-colors"
          >
            ← Kembali ke Beranda
          </Link>
          <Link
            href={`/account/bookings/${bookingCode}`}
            className="flex-1 text-center text-sm font-semibold bg-primary text-white
                       hover:bg-primary-hover px-5 py-3 rounded-xl transition-colors shadow-glow"
          >
            Lacak Perjalanan →
          </Link>
        </div>
      </div>
    </main>
  )
}
