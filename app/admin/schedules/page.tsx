import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllSchedules } from '@/lib/actions/admin.actions'
import { formatDate, formatTime } from '@/lib/utils'

export const metadata: Metadata = { title: 'Jadwal' }

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  scheduled: { label: 'Terjadwal',  bg: '#eff6ff', text: '#2563eb' },
  boarding:  { label: 'Boarding',   bg: '#fefce8', text: '#ca8a04' },
  on_trip:   { label: 'Perjalanan', bg: '#f0fdf4', text: '#16a34a' },
  completed: { label: 'Selesai',    bg: '#f8fafc', text: '#64748b' },
  cancelled: { label: 'Dibatalkan', bg: '#fef2f2', text: '#dc2626' },
}

export default async function AdminSchedulesPage() {
  const rawSchedules = await getAllSchedules()

  type SchedRow = {
    id: string
    depart_at: string
    status: string
    seats_total: number
    seats_available: number
    price: number
    price_adult: number
    service_class: string
    vehicle: { id: string; plate: string; brand: string; model: string } | null
    driver:  { id: string; name: string } | null
    route:   { id: string; origin: string; destination: string } | null
  }

  const schedules = rawSchedules as unknown as SchedRow[]

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-slate-900">Jadwal</h1>
        <Link
          href="/admin/schedules/new"
          className="px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
        >
          + Jadwal Baru
        </Link>
      </div>

      {schedules.length === 0 ? (
        <div
          className="bg-white p-10 text-center"
          style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
        >
          <p className="text-slate-400">Belum ada jadwal terdaftar.</p>
        </div>
      ) : (
        <div
          className="bg-white overflow-hidden"
          style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Rute', 'Keberangkatan', 'Armada / Driver', 'Kursi', 'Harga', 'Status'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedules.map(s => {
                const cfg   = statusConfig[s.status] ?? statusConfig.scheduled
                const taken = s.seats_total - s.seats_available
                return (
                  <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">
                        {s.route?.origin ?? '-'} → {s.route?.destination ?? '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{formatDate(s.depart_at)}</p>
                      <p className="text-xs text-slate-400">{formatTime(s.depart_at)} WIB</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">{s.vehicle?.plate ?? '-'}</p>
                      <p className="text-xs text-slate-400">{s.driver?.name ?? 'Belum assign'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{taken}/{s.seats_total}</p>
                      <p className="text-xs text-slate-400">{s.seats_available} tersisa</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      Rp {((s.price_adult ?? s.price) / 1000).toFixed(0)}k
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
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
      )}
    </div>
  )
}
