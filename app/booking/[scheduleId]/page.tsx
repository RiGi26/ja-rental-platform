import { notFound } from 'next/navigation'
import { getScheduleById, getOccupiedSeats } from '@/lib/actions/schedule.actions'
import { generateSeatMap } from '@/lib/utils/seat'
import ScheduleSummary from '@/components/booking/ScheduleSummary'
import BookingInteractive from '@/components/booking/BookingInteractive'

interface Props {
  params: Promise<{ scheduleId: string }>
  searchParams: Promise<{ passengers?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { scheduleId } = await params
  const schedule = await getScheduleById(scheduleId)
  if (!schedule) return { title: 'Jadwal Tidak Ditemukan' }
  return {
    title: `Booking ${schedule.route?.origin} → ${schedule.route?.destination} | JapanArena Travel`,
  }
}

export default async function BookingPage({ params, searchParams }: Props) {
  const { scheduleId } = await params
  const { passengers: passengersParam } = await searchParams
  const passengers = Math.max(1, Math.min(8, parseInt(passengersParam ?? '1', 10) || 1))

  const [schedule, occupiedSeats] = await Promise.all([
    getScheduleById(scheduleId),
    getOccupiedSeats(scheduleId),
  ])

  if (!schedule) notFound()

  const capacity = schedule.vehicle?.capacity ?? 15
  const seatMap = generateSeatMap(capacity, occupiedSeats)

  if (schedule.seats_available < passengers) {
    return (
      <main className="min-h-screen bg-bg-base py-8">
        <div className="max-w-2xl mx-auto px-4">
          <ScheduleSummary schedule={schedule} />
          <div className="bg-bg-card rounded-2xl shadow-card p-8 text-center">
            <p className="text-4xl mb-4">😔</p>
            <h2 className="font-display font-bold text-xl text-slate-800 mb-2">
              Kursi Tidak Cukup
            </h2>
            <p className="text-slate-500 text-sm">
              Hanya tersisa <span className="font-semibold text-primary">{schedule.seats_available}</span> kursi,
              sementara Anda membutuhkan <span className="font-semibold">{passengers}</span> kursi.
            </p>
            <a
              href="/search"
              className="inline-block mt-6 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors"
            >
              Cari Jadwal Lain
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg-base py-8">
      <div className="max-w-2xl mx-auto px-4">
        <ScheduleSummary schedule={schedule} />
        <BookingInteractive
          schedule={schedule}
          initialSeatMap={seatMap}
          initialOccupied={occupiedSeats}
          passengers={passengers}
        />
      </div>
    </main>
  )
}
