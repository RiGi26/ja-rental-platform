import type { Schedule } from '@/lib/types'
import { formatDate, formatTime, formatDuration } from '@/lib/utils'

interface Props {
  schedule: Schedule
}

export default function ScheduleSummary({ schedule }: Props) {
  const { route, vehicle } = schedule
  const duration = route?.duration_est ?? route?.duration_minutes ?? 0
  const departMs = new Date(schedule.depart_at).getTime()
  const arrivalMs = departMs + duration * 60 * 1000
  const arrivalTime = Number.isFinite(arrivalMs)
    ? formatTime(new Date(arrivalMs).toISOString())
    : '—'

  return (
    <div className="rounded-2xl overflow-hidden shadow-card mb-6">
      <div
        className="px-5 py-4"
        style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' }}
      >
        {/* Rute */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-display font-bold text-slate-800">
            {route?.origin}
          </span>
          <span className="text-slate-400 text-lg">→</span>
          <span className="text-xl font-display font-bold text-slate-800">
            {route?.destination}
          </span>
        </div>

        {/* Detail baris 1 */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600 mb-2">
          <span>📅 {formatDate(schedule.depart_at)}</span>
          <span>🕐 Berangkat {formatTime(schedule.depart_at)} WIB</span>
        </div>

        {/* Detail baris 2 */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
          {vehicle && (
            <span>🚌 {vehicle.brand} {vehicle.model} · {vehicle.plate}</span>
          )}
          <span>⏱ Estimasi tiba {arrivalTime} WIB ({formatDuration(duration)})</span>
        </div>

        {/* Via */}
        {route?.stops && route.stops.length > 0 && (
          <p className="mt-2 text-xs text-slate-400">
            Via: {route.stops.join(' → ')}
          </p>
        )}
      </div>
    </div>
  )
}
