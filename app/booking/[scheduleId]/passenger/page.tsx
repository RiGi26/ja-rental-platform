'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useBookingStore } from '@/lib/store/booking.store'
import BookingSteps from '@/components/booking/BookingSteps'
import PassengerForm from '@/components/booking/PassengerForm'

export default function PassengerPage() {
  const router     = useRouter()
  const params     = useParams()
  const scheduleId = params.scheduleId as string

  const [mounted, setMounted] = useState(false)
  const selectedSeats = useBookingStore(s => s.selectedSeats)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && selectedSeats.length === 0) {
      router.replace(`/booking/${scheduleId}`)
    }
  }, [mounted, selectedSeats.length, scheduleId, router])

  if (!mounted || selectedSeats.length === 0) {
    return (
      <main className="min-h-screen bg-bg-base py-8">
        <div className="max-w-2xl mx-auto px-4 space-y-4 animate-pulse">
          <div className="h-16 bg-bg-card rounded-2xl shadow-card" />
          <div className="h-52 bg-bg-card rounded-2xl shadow-card" />
          <div className="h-52 bg-bg-card rounded-2xl shadow-card" />
          <div className="h-14 bg-slate-200 rounded-xl" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg-base py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <BookingSteps current={2} />
        <PassengerForm scheduleId={scheduleId} />
      </div>
    </main>
  )
}
