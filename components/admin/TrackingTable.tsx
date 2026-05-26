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
    <div className="overflow-x-auto">
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
              <tr key={s.id} className="border-b border-slate-50 last:border-0">
                <td className="py-3.5 pr-4">
                  <p className="font-bold text-slate-800">{s.vehicle?.plate ?? '-'}</p>
                  <p className="text-xs text-slate-400">{s.vehicle?.brand} {s.vehicle?.model}</p>
                </td>
                <td className="py-3.5 pr-4">
                  <p className="font-medium text-slate-700">{s.driver?.name ?? 'Belum assign'}</p>
                </td>
                <td className="py-3.5 pr-4">
                  <p className="font-medium text-slate-800">
                    {s.route?.origin ?? '-'} → {s.route?.destination ?? '-'}
                  </p>
                  <p className="text-xs text-slate-400">{seatsTaken}/{s.seats_total} penumpang</p>
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
  )
}
