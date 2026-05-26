import type { Metadata } from 'next'
import { getReportsData } from '@/lib/actions/admin.actions'
import { formatRupiah } from '@/lib/utils'

export const metadata: Metadata = { title: 'Laporan & Analytics' }

function monthKey(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string) {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white p-6"
      style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
    >
      <h2 className="font-display font-bold text-slate-800 mb-5">{title}</h2>
      {children}
    </div>
  )
}

export default async function AdminReportsPage() {
  const { payments, bookings, vehicles } = await getReportsData()

  // Revenue per month
  const revenueByMonth: Record<string, number> = {}
  for (const p of payments) {
    if (!p.paid_at) continue
    const key = monthKey(p.paid_at)
    revenueByMonth[key] = (revenueByMonth[key] ?? 0) + (p.amount ?? 0)
  }
  const revenueMonths = Object.keys(revenueByMonth).sort().reverse()
  const totalRevenue  = payments.reduce((s, p) => s + (p.amount ?? 0), 0)

  // Bookings per route
  type BookingWithSched = { schedule?: { route?: { origin?: string; destination?: string } | null } | null }
  const routeMap: Record<string, number> = {}
  for (const b of bookings as BookingWithSched[]) {
    const sched = b.schedule as { route?: { origin?: string; destination?: string } | null } | null
    const origin = sched?.route?.origin
    const dest   = sched?.route?.destination
    if (!origin || !dest) continue
    const key = `${origin} → ${dest}`
    routeMap[key] = (routeMap[key] ?? 0) + 1
  }
  const topRoutes = Object.entries(routeMap).sort((a, b) => b[1] - a[1]).slice(0, 8)

  // Vehicle utilization (booking count by vehicle — simplified)
  const totalBookings    = bookings.length
  const completedBookings = bookings.filter((b: { status?: string }) => b.status === 'completed').length

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-slate-900">Laporan & Analytics</h1>
        <span className="text-sm text-slate-400">6 bulan terakhir</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pendapatan', value: formatRupiah(totalRevenue), color: '#2563eb' },
          { label: 'Total Booking',    value: String(totalBookings),      color: '#7c3aed' },
          { label: 'Selesai',          value: String(completedBookings),  color: '#16a34a' },
          { label: 'Armada Terdaftar', value: String(vehicles.length),    color: '#ea580c' },
        ].map(s => (
          <div
            key={s.label}
            className="bg-white p-5"
            style={{ borderRadius: 20, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
          >
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{s.label}</p>
            <p className="font-extrabold text-2xl" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by month */}
        <Card title="Pendapatan per Bulan">
          {revenueMonths.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Belum ada data pembayaran.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Bulan</th>
                  <th className="text-right pb-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {revenueMonths.map(key => (
                  <tr key={key} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 font-medium text-slate-700">{monthLabel(key)}</td>
                    <td className="py-3 text-right font-bold text-slate-900">{formatRupiah(revenueByMonth[key])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Top routes */}
        <Card title="Booking per Rute">
          {topRoutes.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Belum ada data booking.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Rute</th>
                  <th className="text-right pb-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Booking</th>
                </tr>
              </thead>
              <tbody>
                {topRoutes.map(([route, count]) => (
                  <tr key={route} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 font-medium text-slate-700">{route}</td>
                    <td className="py-3 text-right font-bold text-slate-900">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  )
}
