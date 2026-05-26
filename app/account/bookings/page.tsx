import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import BookingsListClient from './BookingsListClient'
import type { BookingStatus } from '@/lib/types'

export const metadata: Metadata = { title: 'Riwayat Booking' }

export interface BookingItem {
  booking_code:   string
  status:         BookingStatus
  payment_status: string
  seats:          string[]
  total_amount:   number
  created_at:     string
  depart_at:      string
  origin:         string
  destination:    string
}

export default async function BookingsPage() {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/auth/login?next=/account/bookings')

  const supabase = createServiceClient()

  const { data: rawBookings } = await supabase
    .from('bookings')
    .select(`
      booking_code, status, payment_status, seats, total_amount, created_at,
      schedule:schedules(
        depart_at,
        route:routes(origin, destination)
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  type RawRow = {
    booking_code:   string
    status:         string
    payment_status: string
    seats:          string[]
    total_amount:   number
    created_at:     string
    schedule:       unknown
  }

  const bookings: BookingItem[] = ((rawBookings ?? []) as RawRow[]).map((b) => {
    const sched = b.schedule as { depart_at: string; route: { origin: string; destination: string } | null } | null
    return ({
      booking_code:   b.booking_code,
      status:         b.status as BookingStatus,
      payment_status: b.payment_status,
      seats:          b.seats ?? [],
      total_amount:   b.total_amount,
      created_at:     b.created_at,
      depart_at:      sched?.depart_at        ?? '',
      origin:         sched?.route?.origin      ?? '-',
      destination:    sched?.route?.destination ?? '-',
    })
  })

  return (
    <main className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display font-bold text-2xl text-slate-900 mb-6">
          Riwayat Booking
        </h1>
        <BookingsListClient bookings={bookings} />
      </div>
    </main>
  )
}
