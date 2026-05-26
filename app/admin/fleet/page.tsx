import type { Metadata } from 'next'
import { getAllVehicles, getVehicleReminders } from '@/lib/actions/admin.actions'
import type { Vehicle } from '@/lib/types'

export const metadata: Metadata = { title: 'Manajemen Armada' }

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  available:   { label: 'Tersedia',    bg: '#f0fdf4', text: '#16a34a' },
  on_trip:     { label: 'Dalam Perjalanan', bg: '#eff6ff', text: '#2563eb' },
  maintenance: { label: 'Maintenance', bg: '#fef2f2', text: '#dc2626' },
  inactive:    { label: 'Nonaktif',   bg: '#f8fafc', text: '#64748b' },
}

export default async function AdminFleetPage() {
  const [vehicles, alerts] = await Promise.all([
    getAllVehicles(),
    getVehicleReminders(),
  ])

  const alertIds = new Set(alerts.map(a => a.id))

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-slate-900">Manajemen Armada</h1>
        <span className="text-sm text-slate-400">{vehicles.length} kendaraan terdaftar</span>
      </div>

      {vehicles.length === 0 ? (
        <div
          className="bg-white p-10 text-center"
          style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
        >
          <p className="text-slate-400">Belum ada kendaraan terdaftar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(vehicles as Vehicle[]).map(v => {
            const cfg = statusConfig[v.status] ?? statusConfig.inactive
            const hasAlert = alertIds.has(v.id)
            return (
              <div
                key={v.id}
                className="bg-white p-5 space-y-3"
                style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
              >
                {/* Placeholder photo */}
                <div
                  className="w-full h-32 flex items-center justify-center text-5xl rounded-2xl"
                  style={{ background: '#f5f7fb' }}
                >
                  🚐
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display font-bold text-slate-900">{v.brand} {v.model}</p>
                    <p className="text-sm font-mono text-slate-500">{v.plate}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: cfg.bg, color: cfg.text }}
                    >
                      {cfg.label}
                    </span>
                    {hasAlert && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: '#fff7ed', color: '#ea580c' }}>
                        ⚠ Reminder
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span>Kapasitas: <strong className="text-slate-800">{v.capacity}</strong></span>
                  <span>Tipe: <strong className="text-slate-800 capitalize">{v.type}</strong></span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
