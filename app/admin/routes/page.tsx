import type { Metadata } from 'next'
import { getAllRoutes } from '@/lib/actions/admin.actions'
import { formatDuration } from '@/lib/utils'
import type { Route } from '@/lib/types'

export const metadata: Metadata = { title: 'Rute Tetap' }

export default async function AdminRoutesPage() {
  const routes = (await getAllRoutes()) as Route[]

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-slate-900">Rute Tetap</h1>
        <span className="text-sm text-slate-400">{routes.length} rute aktif</span>
      </div>

      {routes.length === 0 ? (
        <div
          className="bg-white p-10 text-center"
          style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
        >
          <p className="text-slate-400">Belum ada rute terdaftar.</p>
        </div>
      ) : (
        <>
        <div
          className="hidden lg:block bg-white overflow-hidden"
          style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Rute', 'Estimasi', 'Pemberhentian', 'Status'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routes.map(r => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">
                      {r.origin} <span className="text-blue-500">→</span> {r.destination}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatDuration(r.duration_minutes || r.duration_est)}
                  </td>
                  <td className="px-6 py-4">
                    {r.stops?.length > 0 ? (
                      <span className="text-slate-600">{r.stops.join(' • ')}</span>
                    ) : (
                      <span className="text-slate-400">Langsung</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={r.is_active
                        ? { background: '#f0fdf4', color: '#16a34a' }
                        : { background: '#f8fafc', color: '#64748b' }}
                    >
                      {r.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden space-y-3">
          {routes.map(r => (
            <div
              key={r.id}
              className="rounded-2xl bg-white p-4"
              style={{ boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-slate-900">
                  {r.origin} <span className="text-blue-500">→</span> {r.destination}
                </p>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                  style={r.is_active
                    ? { background: '#f0fdf4', color: '#16a34a' }
                    : { background: '#f8fafc', color: '#64748b' }}
                >
                  {r.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-500">Estimasi</span>
                  <span className="text-slate-800">{formatDuration(r.duration_minutes || r.duration_est)}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-500">Pemberhentian</span>
                  {r.stops?.length > 0 ? (
                    <span className="text-slate-800 text-right">{r.stops.join(' • ')}</span>
                  ) : (
                    <span className="text-slate-400">Langsung</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  )
}
