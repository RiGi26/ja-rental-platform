import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createCoreClient } from '@/lib/supabase/server'
import { createRentalServiceClient } from '@/lib/supabase/service'
import BookingCard from '@/components/account/BookingCard'
import type { BookingStatus } from '@/lib/types'

export const metadata: Metadata = { title: 'Akun Saya' }

const ACTIVE_STATUSES = ['pending', 'confirmed', 'otw_pickup', 'on_trip', 'almost_arrived']

interface BookingRow {
  booking_code: string
  status:       string
  payment_status: string
  seats:        string[]
  total_amount: number
  schedule: {
    depart_at: string
    route: { origin: string; destination: string } | null
  } | null
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>
}) {
  const { registered } = await searchParams

  const authClient = await createCoreClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/auth/login?next=/account')

  const meta     = user.user_metadata as { full_name?: string }
  const firstName = (meta.full_name ?? user.email ?? 'Pengguna').split(' ')[0]

  const supabase = createRentalServiceClient()

  const { data: rawBookings } = await supabase
    .from('bookings')
    .select(`
      booking_code, status, payment_status, seats, total_amount,
      schedule:schedules(
        depart_at,
        route:routes(origin, destination)
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const bookings = (rawBookings ?? []) as unknown as BookingRow[]

  const activeBookings = bookings.filter(b => ACTIVE_STATUSES.includes(b.status))
  const recentBookings = bookings.slice(0, 3)

  return (
    <main className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Welcome banner */}
        {registered === 'true' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-start gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-green-800 text-sm">Akun berhasil dibuat!</p>
              <p className="text-green-700 text-xs mt-0.5">Selamat datang di JaTravel, {firstName}.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">
              Halo, {firstName}!
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">{user.email}</p>
          </div>
          <Link
            href="/account/profile"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Edit Profil
          </Link>
        </div>

        {/* Active bookings */}
        <section>
          <h2 className="font-display font-bold text-slate-700 text-sm uppercase tracking-wide mb-3">
            Booking Aktif
          </h2>
          {activeBookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 text-center">
              <p className="text-slate-400 text-sm">Tidak ada booking aktif saat ini.</p>
              <Link
                href="/"
                className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Pesan perjalanan sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBookings.map(b => (
                <BookingCard
                  key={b.booking_code}
                  bookingCode={b.booking_code}
                  origin={b.schedule?.route?.origin ?? '-'}
                  destination={b.schedule?.route?.destination ?? '-'}
                  departAt={b.schedule?.depart_at ?? ''}
                  seats={b.seats ?? []}
                  totalAmount={b.total_amount}
                  status={b.status as BookingStatus}
                  paymentStatus={b.payment_status}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent bookings */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-slate-700 text-sm uppercase tracking-wide">
              Riwayat Booking
            </h2>
            <Link
              href="/account/bookings"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Lihat Semua →
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 text-center">
              <p className="text-slate-400 text-sm">Belum ada riwayat booking.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map(b => (
                <BookingCard
                  key={b.booking_code}
                  bookingCode={b.booking_code}
                  origin={b.schedule?.route?.origin ?? '-'}
                  destination={b.schedule?.route?.destination ?? '-'}
                  departAt={b.schedule?.depart_at ?? ''}
                  seats={b.seats ?? []}
                  totalAmount={b.total_amount}
                  status={b.status as BookingStatus}
                  paymentStatus={b.payment_status}
                />
              ))}
            </div>
          )}
        </section>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/account/bookings"
            className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 text-center
                       hover:border-primary/30 transition-colors group"
          >
            <span className="text-2xl block mb-1">📋</span>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary">
              Riwayat Lengkap
            </span>
          </Link>
          <Link
            href="/account/profile"
            className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 text-center
                       hover:border-primary/30 transition-colors group"
          >
            <span className="text-2xl block mb-1">👤</span>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary">
              Edit Profil
            </span>
          </Link>
        </div>

      </div>
    </main>
  )
}
