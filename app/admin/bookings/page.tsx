import type { Metadata } from 'next'
import { getAllBookings } from '@/lib/actions/admin.actions'
import BookingTable from '@/components/admin/BookingTable'

export const metadata: Metadata = { title: 'Manajemen Booking' }

export default async function AdminBookingsPage() {
  const rawBookings = await getAllBookings()

  type RawBooking = (typeof rawBookings)[number]
  const bookings = (rawBookings as unknown as (RawBooking & {
    passengers: { name: string }[]
    schedule: { id: string; depart_at: string; route: { origin: string; destination: string } | null } | null
  })[])

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-slate-900">Manajemen Booking</h1>
        <span className="text-sm text-slate-400">{bookings.length} booking ditemukan</span>
      </div>

      <div
        className="bg-white p-6"
        style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
      >
        <BookingTable bookings={bookings} />
      </div>
    </div>
  )
}
