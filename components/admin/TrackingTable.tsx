import { formatTime } from '@/lib/utils'

type ScheduleStatus = 'scheduled' | 'boarding' | 'on_trip' | 'completed' | 'cancelled'

interface ScheduleRow {
  id:     string
  status: ScheduleStatus
  depart_at: string
  seats_total: number
  seats_available: number
  vehicle: { plate: string; brand: string; model: string } | null
  driver:  { name: string } | null
  route:   { origin: string; destination: string } | null
}

interface Props {
  schedules: ScheduleRow[]
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  on_trip:   { label: 'Realtime',  bg: '#f0fdf4', text: '#16a34a' },
  boarding:  { label: 'OTW',       bg: '#fefce8', text: '#ca8a04' },
  scheduled: { label: 'Terjadwal', bg: '#eff6ff', text: '#2563eb' },
  completed: { label: 'Selesai',   bg: '#f8fafc', text: '#64748b' },
  cancelled: { label: 'Dibatalkan',bg: '#fef2f2', text: '#dc2626' },
}

export default function TrackingTable({ schedules }: Props) {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">
        Tidak ada armada aktif saat ini.
      </div>
    )
  }

  return (
    <>
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left pb-3 pr-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Armada</th>
            <th className="text-left pb-3 pr-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Driver</th>
            <th className="text-left pb-3 pr-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Rute</th>
            <th className="text-left pb-3 pr-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Jam</th>
            <th className="text-left pb-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(s => {
            const cfg = statusConfig[s.status] ?? statusConfig.scheduled
            const seatsTaken = s.seats_total - s.seats_available
            return (
              <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                <td className="py-3.5 pr-4">
                  <p className="font-bold text-slate-800 group-hover:text-primary transition-colors">{s.vehicle?.plate ?? '-'}</p>
                  <p className="text-xs text-slate-400">{s.vehicle?.brand} {s.vehicle?.model}</p>
                </td>
                <td className="py-3.5 pr-4">
                  <p className="font-medium text-slate-700">{s.driver?.name ?? 'Belum assign'}</p>
                </td>
                <td className="py-3.5 pr-4">
                  <p className="font-medium text-slate-800">
                    {s.route?.origin ?? '-'} → {s.route?.destination ?? '-'}
                  </p>
                  <p className="text-xs text-slate-400 tabular-nums">{seatsTaken}/{s.seats_total} penumpang</p>
                </td>
                <td className="py-3.5 pr-4">
                  <p className="font-medium text-slate-700">{formatTime(s.depart_at)}</p>
                </td>
                <td className="py-3.5">
                  <span
                    className="inline-block text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: cfg.bg, color: cfg.text }}
                  >
                    {cfg.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>

    {/* Mobile: card fallback (chrome flat — no bg-white/shadow, parent panel already provides it) */}
    <div className="lg:hidden space-y-3">
      {schedules.map(s => {
        const cfg = statusConfig[s.status] ?? statusConfig.scheduled
        const seatsTaken = s.seats_total - s.seats_available
        return (
          <div key={s.id} className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-slate-900">{s.vehicle?.plate ?? '-'}</p>
                <p className="text-xs text-slate-400">{s.vehicle?.brand} {s.vehicle?.model}</p>
              </div>
              <span
                className="inline-block shrink-0 text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: cfg.bg, color: cfg.text }}
              >
                {cfg.label}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between gap-3">
                <span className="text-xs font-semibold text-slate-500">Driver</span>
                <span className="text-sm text-slate-800 text-right">{s.driver?.name ?? 'Belum assign'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-xs font-semibold text-slate-500">Rute</span>
                <span className="text-sm text-slate-800 text-right">
                  {s.route?.origin ?? '-'} → {s.route?.destination ?? '-'}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-xs font-semibold text-slate-500">Penumpang</span>
                <span className="text-sm text-slate-800 text-right tabular-nums">{seatsTaken}/{s.seats_total}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-xs font-semibold text-slate-500">Jam</span>
                <span className="text-sm text-slate-800 text-right">{formatTime(s.depart_at)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
    </>
  )
}
