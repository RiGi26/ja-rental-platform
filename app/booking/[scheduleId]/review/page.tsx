'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useBookingStore } from '@/lib/store/booking.store'
import { getScheduleById } from '@/lib/actions/schedule.actions'
import BookingSteps from '@/components/booking/BookingSteps'
import ScheduleSummary from '@/components/booking/ScheduleSummary'
import BookingReview from '@/components/booking/BookingReview'
import type { Schedule } from '@/lib/types'

export default function ReviewPage() {
  const router     = useRouter()
  const params     = useParams()
  const scheduleId = params.scheduleId as string

  const [mounted,   setMounted]   = useState(false)
  const [schedule,  setSchedule]  = useState<Schedule | null>(null)
  const [loading,   setLoading]   = useState(true)

  const { selectedSeats, passengerDetails, pickupPointId } = useBookingStore()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return

    async function init() {
      // Fetch jadwal dulu untuk tahu apakah ada pickup points
      const fresh = await getScheduleById(scheduleId)
      if (!fresh) {
        router.replace('/')
        return
      }

      const hasPickupPoints = (fresh.pickup_points ?? []).length > 0

      // Guard: state booking tidak lengkap
      if (
        selectedSeats.length === 0 ||
        passengerDetails.length === 0 ||
        (hasPickupPoints && !pickupPointId)
      ) {
        router.replace(`/booking/${scheduleId}`)
        return
      }

      setSchedule(fresh)
      setLoading(false)
    }

    init()
  }, [mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted || loading) {
    return (
      <main className="min-h-screen bg-bg-base py-8">
        <div className="max-w-2xl mx-auto px-4 space-y-4 animate-pulse">
          <div className="h-16 bg-bg-card rounded-2xl shadow-card" />
          <div className="h-36 bg-blue-50 rounded-2xl" />
          <div className="bg-bg-card rounded-2xl shadow-card overflow-hidden">
            <div className="h-28 bg-blue-50" />
            <div className="p-6 space-y-3">
              <div className="h-3 w-20 bg-slate-100 rounded" />
              {[1, 2].map(i => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-slate-100 rounded w-44" />
                  <div className="h-4 bg-slate-100 rounded w-20" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-14 w-28 bg-slate-100 rounded-xl" />
            <div className="h-14 flex-1 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </main>
    )
  }

  if (!schedule) return null

  return (
    <main className="min-h-screen bg-bg-base py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <BookingSteps current={3} />
        <ScheduleSummary schedule={schedule} />
        <BookingReview schedule={schedule} scheduleId={scheduleId} />
      </div>
    </main>
  )
}
