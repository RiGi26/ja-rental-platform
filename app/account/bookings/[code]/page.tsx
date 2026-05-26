import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import BookingStatusBadge from '@/components/BookingStatusBadge'
import { DownloadButtons } from '@/components/ticket/DownloadButtons'
import { formatDate, formatTime, formatRupiah } from '@/lib/utils'
import type { BookingStatus } from '@/lib/types'

interface Props {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  return { title: `Booking ${code}` }
}

export default async function BookingDetailPage({ params }: Props) {
  const { code } = await params

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect(`/auth/login?next=/account/bookings/${code}`)

  const supabase = createServiceClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, booking_code, status, payment_status, seats, total_amount, created_at,
      passengers(name, phone, seat_number),
      schedule:schedules(
        depart_at,
        route:routes(origin, destination, duration_minutes),
        vehicle:vehicles(brand, model, plate)
      ),
      payment:payments(method, amount, paid_at)
    `)
    .eq('booking_code', code)
    .eq('customer_id', user.id)
    .single()

  if (!booking) notFound()

  const schedule = (booking.schedule as unknown) as {
    depart_at: string
    route: { origin: string; destination: string; duration_minutes: number } | null
    vehicle: { brand: string; model: string; plate: string } | null
  } | null

  const passengers = (booking.passengers ?? []) as {
    name: string
    phone: string
    seat_number: string
  }[]

  const payment = ((booking.payment ?? null) as unknown) as {
    method: string | null
    amount: number
    paid_at: string | null
  } | null

  const isPaid = booking.payment_status === 'paid'

  return (
    <main className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Back */}
        <Link
          href="/account/bookings"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          ← Riwayat Booking
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display font-bold text-lg text-slate-900">
                {schedule?.route?.origin ?? '-'} → {schedule?.route?.destination ?? '-'}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {schedule?.depart_at ? `${formatDate(schedule.depart_at)} • ${formatTime(schedule.depart_at)} WIB` : '-'}
              </p>
            </div>
            <BookingStatusBadge status={booking.status as BookingStatus} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-slate-100">
            <div>
              <p className="text-slate-400 text-xs mb-0.5">Kode Booking</p>
              <p className="font-mono font-bold text-slate-800">{booking.booking_code}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-0.5">Tanggal Pesan</p>
              <p className="text-slate-700">{formatDate(booking.created_at)}</p>
            </div>
            {schedule?.vehicle && (
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Kendaraan</p>
                <p className="text-slate-700">{schedule.vehicle.brand} {schedule.vehicle.model}</p>
              </div>
            )}
            <div>
              <p className="text-slate-400 text-xs mb-0.5">Total Pembayaran</p>
              <p className="font-bold text-slate-900">{formatRupiah(booking.total_amount)}</p>
            </div>
          </div>

          {payment?.paid_at && (
            <div className="text-xs text-slate-400 pt-1 border-t border-slate-100">
              Dibayar: {formatDate(payment.paid_at)} • {payment.method ?? '-'}
            </div>
          )}
        </div>

        {/* Passengers */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
          <h2 className="font-display font-semibold text-slate-800 mb-3">
            Penumpang ({passengers.length})
          </h2>
          <div className="space-y-3">
            {passengers.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-slate-800">{p.name}</p>
                  <p className="text-slate-500 text-xs">{p.phone}</p>
                </div>
                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                  Kursi {p.seat_number}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Downloads */}
        {isPaid && (
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
            <h2 className="font-display font-semibold text-slate-800 mb-3">Unduhan</h2>
            <DownloadButtons bookingCode={code} />
          </div>
        )}

        {/* Tracking */}
        {['otw_pickup', 'on_trip', 'almost_arrived'].includes(booking.status) && (
          <Link
            href={`/tracking/${booking.id}`}
            className="block w-full text-center font-bold text-white bg-indigo-600
                       hover:bg-indigo-700 py-3 rounded-xl transition-colors"
          >
            Tracking Perjalanan
          </Link>
        )}

      </div>
    </main>
  )
}
