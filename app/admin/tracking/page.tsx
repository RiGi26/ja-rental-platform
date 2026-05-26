import type { Metadata } from 'next'
import { getActiveSchedules } from '@/lib/actions/admin.actions'
import TrackingTable from '@/components/admin/TrackingTable'

export const metadata: Metadata = { title: 'Live Tracking' }

export default async function AdminTrackingPage() {
  const schedules = await getActiveSchedules()

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-slate-900">Live Tracking Armada</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-slate-500">Data realtime dari DB</span>
        </div>
      </div>

      {/* Map placeholder */}
      <div
        className="bg-white p-6 flex items-center justify-center"
        style={{
          borderRadius: 24,
          boxShadow: '0 5px 18px rgba(15,23,42,0.05)',
          minHeight: 280,
          background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
        }}
      >
        <div className="text-center">
          <div className="text-5xl mb-3">🗺️</div>
          <p className="font-bold text-slate-700">Peta GPS Realtime</p>
          <p className="text-sm text-slate-400 mt-1">
            Integrasi Google Maps API — jadwalkan di Sprint 5
          </p>
        </div>
      </div>

      {/* Schedule table */}
      <div
        className="bg-white p-6"
        style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
      >
        <h2 className="font-display font-bold text-slate-800 mb-5">Status Armada</h2>
        <TrackingTable schedules={schedules as unknown as Parameters<typeof TrackingTable>[0]['schedules']} />
      </div>
    </div>
  )
}
