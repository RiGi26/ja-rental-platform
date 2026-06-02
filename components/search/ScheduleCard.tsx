'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Schedule } from '@/lib/types'
import { formatRupiah, formatTime, formatDuration, isWithinHours } from '@/lib/utils'

interface Props {
  schedule: Schedule
  passengers: number
}

export default function ScheduleCard({ schedule, passengers }: Props) {
  const router = useRouter()
  const { route, vehicle, driver } = schedule

  const photo = vehicle?.photos?.[0] ?? null
  const isAlmostFull = schedule.seats_available < 5
  const isDepartingSoon = isWithinHours(schedule.depart_at, 2)
  const duration = route?.duration_est ?? route?.duration_minutes ?? 0
  const arrivalMs = new Date(schedule.depart_at).getTime() + duration * 60 * 1000
  const arrivalTime = formatTime(new Date(arrivalMs).toISOString())

  function handleSelect() {
    router.push(`/booking/${schedule.id}?passengers=${passengers}`)
  }

  return (
    <div
      onClick={handleSelect}
      className="bg-bg-card rounded-2xl shadow-card border border-slate-100 p-5 cursor-pointer
                 hover:-translate-y-1 hover:shadow-panel transition-all duration-200 group"
    >
      {/* Header: kendaraan + rating */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
          {photo ? (
            <Image src={photo} alt={vehicle?.model ?? ''} width={48} height={48} className="object-cover w-full h-full" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">🚌</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">
            {vehicle?.brand} {vehicle?.model}
          </p>
          <p className="text-slate-400 text-xs">{vehicle?.plate}</p>
        </div>
        {driver && (
          <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold flex-shrink-0">
            <span>⭐</span>
            <span>{driver.avg_rating?.toFixed(1) ?? '—'}</span>
          </div>
        )}
      </div>

      {/* Rute & waktu */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-center">
          <p className="text-xl font-bold text-slate-900 tabular-nums">{formatTime(schedule.depart_at)}</p>
          <p className="text-sm font-medium text-slate-700">{route?.origin}</p>
        </div>

        <div className="flex-1 flex flex-col items-center gap-0.5 px-2">
          <p className="text-xs text-slate-400">{formatDuration(duration)}</p>
          <div className="flex items-center w-full gap-1">
            <div className="flex-1 border-t-2 border-dashed border-slate-200" />
            <span className="text-slate-300 text-xs">›</span>
          </div>
          {route?.stops && route.stops.length > 0 && (
            <p className="text-xs text-slate-400 truncate max-w-[120px] text-center">
              Via: {route.stops.join(', ')}
            </p>
          )}
        </div>

        <div className="text-center">
          <p className="text-xl font-bold text-slate-900 tabular-nums">{arrivalTime}</p>
          <p className="text-sm font-medium text-slate-700">{route?.destination}</p>
        </div>
      </div>

      {/* Info bawah */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>💺 {schedule.seats_available} kursi</span>
          {schedule.pickup_points?.length > 0 && (
            <span>📍 {schedule.pickup_points.length} titik jemput</span>
          )}
        </div>

        {/* Badges */}
        <div className="flex gap-2">
          {isAlmostFull && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
              ⚠ Hampir Penuh
            </span>
          )}
          {isDepartingSoon && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
              🔴 Segera Berangkat
            </span>
          )}
        </div>
      </div>

      {/* Harga + tombol */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <div>
          <p className="text-xs text-slate-400">per orang</p>
          <p className="text-lg font-bold text-primary">{formatRupiah(schedule.price_adult)}</p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); handleSelect() }}
          className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl
                     hover:bg-primary-hover active:scale-[0.96] transition-all duration-200 group-hover:shadow-glow"
        >
          Pilih Kursi →
        </button>
      </div>
    </div>
  )
}
