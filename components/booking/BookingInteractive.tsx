'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SeatPicker from './SeatPicker'
import PickupPointSelector from './PickupPointSelector'
import { useBookingStore } from '@/lib/store/booking.store'
import { formatRupiah } from '@/lib/utils'
import type { Schedule, SeatMap } from '@/lib/types'

interface Props {
  schedule: Schedule
  initialSeatMap: SeatMap[]
  initialOccupied: string[]
  passengers: number
}

export default function BookingInteractive({
  schedule,
  initialOccupied,
  passengers,
}: Props) {
  const router = useRouter()
  const { setSchedule, setSeats, setPickupPoint, setTotal, pickupPointId, selectedSeats } =
    useBookingStore()

  const [localSeats, setLocalSeats] = useState<string[]>([])
  const [localPickup, setLocalPickup] = useState<string | null>(null)

  // Init store dengan data jadwal
  useEffect(() => {
    setSchedule(schedule.id, schedule, passengers)
    setTotal(schedule.price_adult * passengers)
  }, [schedule, passengers, setSchedule, setTotal])

  const handleSeatsChange = useCallback((seats: string[]) => {
    setLocalSeats(seats)
    setSeats(seats)
    setTotal(schedule.price_adult * seats.length)
  }, [setSeats, setTotal, schedule.price_adult])

  const handlePickupSelect = useCallback((id: string) => {
    setLocalPickup(id)
    setPickupPoint(id)
  }, [setPickupPoint])

  const pickupPoints = schedule.pickup_points ?? []
  const hasPickupPoints = pickupPoints.length > 0
  const totalPrice = schedule.price_adult * (localSeats.length || passengers)

  const canContinue =
    localSeats.length === passengers && (!hasPickupPoints || localPickup !== null)

  function handleContinue() {
    if (!canContinue) return
    router.push(`/booking/${schedule.id}/passenger?passengers=${passengers}`)
  }

  return (
    <div className="space-y-6">
      {/* Seat Picker */}
      <section className="bg-bg-card rounded-2xl shadow-card p-6">
        <h2 className="font-display font-bold text-slate-800 mb-1">Pilih Kursi</h2>
        <p className="text-slate-400 text-sm mb-5">
          Pilih {passengers} kursi untuk {passengers} penumpang
        </p>
        <SeatPicker
          scheduleId={schedule.id}
          capacity={schedule.vehicle?.capacity ?? 15}
          initialOccupied={initialOccupied}
          maxSelectable={passengers}
          onSeatsChange={handleSeatsChange}
        />
      </section>

      {/* Pickup Point Selector */}
      {hasPickupPoints && (
        <section className="bg-bg-card rounded-2xl shadow-card p-6">
          <h2 className="font-display font-bold text-slate-800 mb-1">Titik Jemput</h2>
          <p className="text-slate-400 text-sm mb-4">Pilih titik jemput terdekat Anda</p>
          <PickupPointSelector
            pickupPoints={pickupPoints}
            selectedId={localPickup}
            onSelect={handlePickupSelect}
          />
        </section>
      )}

      {/* Summary & CTA */}
      <div className="bg-bg-card rounded-2xl shadow-card p-5 sticky bottom-4 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400">Total harga</p>
            <p className="text-xl font-bold text-primary" suppressHydrationWarning>
              {formatRupiah(totalPrice)}
            </p>
            <p className="text-xs text-slate-400" suppressHydrationWarning>
              {schedule.price_adult.toLocaleString('id-ID')} × {localSeats.length || passengers} penumpang
            </p>
          </div>

          <div className="text-right text-sm text-slate-500 space-y-0.5">
            {localSeats.length > 0 && (
              <p>Kursi: <span className="font-semibold text-slate-700">{localSeats.sort().join(', ')}</span></p>
            )}
            {localPickup && (
              <p>Jemput: <span className="font-semibold text-slate-700">
                {pickupPoints.find(p => p.id === localPickup)?.label}
              </span></p>
            )}
          </div>
        </div>

        {/* Validation hints */}
        {localSeats.length < passengers && (
          <p className="text-xs text-amber-600 mb-3">
            ⚠ Pilih {passengers - localSeats.length} kursi lagi
          </p>
        )}
        {localSeats.length === passengers && hasPickupPoints && !localPickup && (
          <p className="text-xs text-amber-600 mb-3">
            ⚠ Pilih titik jemput terlebih dahulu
          </p>
        )}

        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-full font-bold py-3.5 rounded-xl text-sm transition-all duration-200
            ${canContinue
              ? 'bg-primary text-white hover:bg-primary-hover glow-btn'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
        >
          Lanjut Isi Data Penumpang →
        </button>
      </div>
    </div>
  )
}
