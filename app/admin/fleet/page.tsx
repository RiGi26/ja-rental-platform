import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getAllVehicles, getVehicleReminders } from '@/lib/actions/admin.actions'
import type { Vehicle } from '@/lib/types'
import FleetCard from '@/components/admin/FleetCard'

export const metadata: Metadata = { title: 'Manajemen Armada' }

export default async function AdminFleetPage() {
  const [vehicles, alerts] = await Promise.all([
    getAllVehicles(),
    getVehicleReminders(),
  ])

  const alertIds = new Set(alerts.map((a) => a.id))

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Manajemen Armada</h1>
          <p className="text-sm text-slate-400">{vehicles.length} kendaraan terdaftar</p>
        </div>
        <Link
          href="/admin/fleet/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:-translate-y-0.5 whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
        >
          <Plus size={16} /> Tambah Kendaraan
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-white p-10 text-center" style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}>
          <p className="text-slate-400 mb-4">Belum ada kendaraan terdaftar.</p>
          <Link
            href="/admin/fleet/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl"
            style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
          >
            <Plus size={16} /> Tambah Kendaraan Pertama
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(vehicles as Vehicle[]).map((v) => (
            <FleetCard key={v.id} vehicle={v} hasAlert={alertIds.has(v.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
