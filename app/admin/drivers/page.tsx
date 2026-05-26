import type { Metadata } from 'next'
import { getAllDrivers } from '@/lib/actions/admin.actions'

export const metadata: Metadata = { title: 'Manajemen Driver' }

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  active:   { label: 'Aktif',   bg: '#f0fdf4', text: '#16a34a' },
  on_leave: { label: 'Libur',   bg: '#fefce8', text: '#ca8a04' },
  inactive: { label: 'Nonaktif',bg: '#f8fafc', text: '#64748b' },
}

export default async function AdminDriversPage() {
  const drivers = await getAllDrivers()

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-slate-900">Driver & Karyawan</h1>
        <span className="text-sm text-slate-400">{drivers.length} driver terdaftar</span>
      </div>

      {drivers.length === 0 ? (
        <div
          className="bg-white p-10 text-center"
          style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
        >
          <p className="text-slate-400 mb-2">Belum ada driver terdaftar.</p>
          <p className="text-xs text-slate-300">
            Jalankan SQL seed dari prompt Phase 10 untuk menambah driver contoh.
          </p>
        </div>
      ) : (
        <div
          className="bg-white overflow-hidden"
          style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Driver', 'No. Lisensi', 'Rating', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => {
                const cfg = statusConfig[d.status] ?? statusConfig.inactive
                return (
                  <tr key={d.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}
                        >
                          {d.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{d.name}</p>
                          <p className="text-xs text-slate-400">{d.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">{d.license_no}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800">⭐ {d.avg_rating?.toFixed(1) ?? '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: cfg.bg, color: cfg.text }}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-xs font-semibold text-blue-600 hover:underline">
                        Jadwal
                      </button>
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
