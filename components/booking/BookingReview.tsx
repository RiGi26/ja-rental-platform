'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, ChevronLeft } from 'lucide-react'
import { useBookingStore } from '@/lib/store/booking.store'
import { createBooking } from '@/lib/actions/booking.actions'
import { formatRupiah, formatDate, formatTime } from '@/lib/utils'
import type { Schedule } from '@/lib/types'

const SERVICE_FEE = 5_000

interface Props {
  schedule: Schedule
  scheduleId: string
}

export default function BookingReview({ schedule, scheduleId }: Props) {
  const router = useRouter()
  const { selectedSeats, passengerDetails, pickupPointId, setBookingCode } = useBookingStore()

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const pickupPoint = schedule.pickup_points?.find(p => p.id === pickupPointId)
  const count       = selectedSeats.length
  const subtotal    = schedule.price_adult * count
  const serviceFee  = SERVICE_FEE * count
  const total       = subtotal + serviceFee

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    try {
      const result = await createBooking({
        scheduleId,
        seats:          selectedSeats,
        pickupPointId:  pickupPointId!,
        passengers:     passengerDetails,
        totalAmount:    total,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      setBookingCode(result.bookingCode!)
      router.push(`/booking/pay/${result.bookingCode}`)
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Ringkasan */}
      <div className="bg-bg-card rounded-2xl shadow-card overflow-hidden">
        {/* Header jadwal */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            📋 Ringkasan Pesanan
          </p>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-display font-bold text-slate-900">{schedule.route?.origin}</span>
            <span className="text-slate-400 text-lg">→</span>
            <span className="text-xl font-display font-bold text-slate-900">{schedule.route?.destination}</span>
          </div>
          <p className="text-sm text-slate-500">{formatDate(schedule.depart_at)} · {formatTime(schedule.depart_at)} WIB</p>
          {schedule.vehicle && (
            <p className="text-sm text-slate-500 mt-0.5">
              {schedule.vehicle.brand} {schedule.vehicle.model} · {schedule.vehicle.plate}
            </p>
          )}
        </div>

        {/* Penumpang */}
        <div className="px-6 py-4 border-b border-slate-50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Penumpang</p>
          <div className="space-y-3">
            {passengerDetails.map((p, i) => (
              <div key={i} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.phone}</p>
                </div>
                <span className="text-xs font-semibold text-primary bg-primary/5 px-2.5 py-1 rounded-full whitespace-nowrap">
                  Kursi {p.seat_number}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Titik jemput */}
        {pickupPoint && (
          <div className="px-6 py-4 border-b border-slate-50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Titik Jemput</p>
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{pickupPoint.label}</p>
                <p className="text-xs text-slate-400">{pickupPoint.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rincian harga */}
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Rincian Harga</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Tiket ({count} × {formatRupiah(schedule.price_adult)})</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Biaya layanan ({count} × {formatRupiah(SERVICE_FEE)})</span>
              <span>{formatRupiah(serviceFee)}</span>
            </div>
            <div className="border-t border-slate-100 pt-2.5 flex justify-between items-baseline">
              <span className="font-bold text-slate-800">Total</span>
              <span className="text-xl font-bold text-primary">{formatRupiah(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          ⚠ {error}
        </div>
      )}

      {/* Tombol aksi */}
      <div className="flex gap-3">
        <Link
          href={`/booking/${scheduleId}/passenger`}
          className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800
                     bg-slate-100 hover:bg-slate-200 px-5 py-3.5 rounded-xl transition-colors whitespace-nowrap"
        >
          <ChevronLeft size={16} />
          Kembali
        </Link>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`flex-1 font-bold py-3.5 rounded-xl text-sm transition-all duration-200
            ${!loading
              ? 'bg-primary text-white hover:bg-primary-hover glow-btn'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
        >
          {loading ? 'Memproses Booking...' : 'Bayar Sekarang →'}
        </button>
      </div>
    </div>
  )
}
