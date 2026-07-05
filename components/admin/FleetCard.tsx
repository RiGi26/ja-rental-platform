'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Car, Pencil, Archive, RotateCcw, Loader2, AlertTriangle } from 'lucide-react'
import { setVehicleStatus } from '@/lib/actions/fleet.actions'
import type { Vehicle } from '@/lib/types'

const STATUS_CFG: Record<string, { label: string; bg: string; text: string }> = {
  available:   { label: 'Tersedia',          bg: '#f0fdf4', text: '#16a34a' },
  on_trip:     { label: 'Dalam Perjalanan',  bg: '#eff6ff', text: '#2563eb' },
  maintenance: { label: 'Maintenance',       bg: '#fef2f2', text: '#dc2626' },
  inactive:    { label: 'Nonaktif',          bg: '#f8fafc', text: '#64748b' },
}

const rupiah = (n: number) => 'Rp' + (n || 0).toLocaleString('id-ID')

export default function FleetCard({ vehicle, hasAlert }: { vehicle: Vehicle; hasAlert: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [err, setErr] = useState<string | null>(null)

  const cfg = STATUS_CFG[vehicle.status] ?? STATUS_CFG.inactive
  const archived = vehicle.status === 'inactive'
  const photo = vehicle.photos?.[0]

  function toggleArchive() {
    setErr(null)
    startTransition(async () => {
      const res = await setVehicleStatus(vehicle.id, archived ? 'available' : 'inactive')
      if (res.error) setErr(res.error)
      else router.refresh()
    })
  }

  return (
    <div
      className="bg-white overflow-hidden flex flex-col"
      style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
    >
      <div className="relative w-full h-36 bg-slate-100 flex items-center justify-center text-slate-300">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
        ) : (
          <Car size={44} strokeWidth={1.4} />
        )}
        <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/55 text-white capitalize">
          {vehicle.type}
        </span>
        <span
          className="absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: cfg.bg, color: cfg.text }}
        >
          {cfg.label}
        </span>
      </div>

      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <div>
          <p className="font-display font-bold text-slate-900">{vehicle.brand} {vehicle.model}</p>
          <p className="text-sm font-mono text-slate-500">{vehicle.plate}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{vehicle.capacity} kursi</span>
          {vehicle.transmission && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{vehicle.transmission}</span>}
          {vehicle.fuel_type && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{vehicle.fuel_type}</span>}
          {hasAlert && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: '#fff7ed', color: '#ea580c' }}>
              <AlertTriangle size={11} /> Reminder
            </span>
          )}
        </div>

        <p className="text-lg font-extrabold text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {rupiah(vehicle.price_per_day)}
          <span className="text-xs font-medium text-slate-400"> / hari</span>
        </p>

        {err && <p className="text-xs text-red-600">{err}</p>}

        <div className="flex gap-2 pt-1 mt-auto">
          <Link
            href={`/admin/fleet/${vehicle.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Pencil size={14} /> Edit
          </Link>
          <button
            type="button"
            onClick={toggleArchive}
            disabled={pending}
            title={archived ? 'Aktifkan kembali' : 'Arsipkan (sembunyikan dari website)'}
            className="flex items-center justify-center gap-1.5 py-2 px-3 text-sm font-semibold rounded-xl border transition-colors disabled:opacity-60"
            style={archived ? { borderColor: '#bbf7d0', color: '#16a34a' } : { borderColor: '#e2e8f0', color: '#64748b' }}
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : archived ? <RotateCcw size={14} /> : <Archive size={14} />}
            {archived ? 'Aktifkan' : 'Arsip'}
          </button>
        </div>
      </div>
    </div>
  )
}
