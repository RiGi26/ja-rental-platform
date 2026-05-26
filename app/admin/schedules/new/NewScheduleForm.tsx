'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { createSchedule } from '@/lib/actions/admin.actions'
import type { Route, Vehicle, Driver } from '@/lib/types'

interface Props {
  routes:   Route[]
  vehicles: Vehicle[]
  drivers:  Driver[]
}

interface PickupPoint {
  label:   string
  address: string
}

export default function NewScheduleForm({ routes, vehicles, drivers }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [routeId,   setRouteId]   = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [driverId,  setDriverId]  = useState('')
  const [departAt,  setDepartAt]  = useState('')
  const [price,     setPrice]     = useState('')
  const [points,    setPoints]    = useState<PickupPoint[]>([{ label: '', address: '' }])
  const [error,     setError]     = useState<string | null>(null)
  const [success,   setSuccess]   = useState(false)

  function addPoint() {
    setPoints(p => [...p, { label: '', address: '' }])
  }

  function removePoint(i: number) {
    setPoints(p => p.filter((_, idx) => idx !== i))
  }

  function updatePoint(i: number, field: keyof PickupPoint, value: string) {
    setPoints(p => p.map((pt, idx) => idx === i ? { ...pt, [field]: value } : pt))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!routeId || !vehicleId || !departAt || !price) {
      setError('Lengkapi semua field yang wajib diisi.')
      return
    }

    const validPoints = points.filter(p => p.label.trim())
    const pickupPoints = validPoints.map((p, i) => ({
      id:      crypto.randomUUID(),
      label:   p.label.trim(),
      address: p.address.trim(),
      order:   i,
    }))

    startTransition(async () => {
      const result = await createSchedule({
        routeId,
        vehicleId,
        driverId,
        departAt: new Date(departAt).toISOString(),
        price:    Number(price),
        pickupPoints,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        router.push('/admin/schedules')
        router.refresh()
      }
    })
  }

  const inputClass = `w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800
    placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400`

  const labelClass = 'block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Rute */}
      <div>
        <label className={labelClass}>Rute <span className="text-red-400">*</span></label>
        <select value={routeId} onChange={e => setRouteId(e.target.value)} className={inputClass} required>
          <option value="">-- Pilih Rute --</option>
          {routes.map(r => (
            <option key={r.id} value={r.id}>
              {r.origin} → {r.destination}
            </option>
          ))}
        </select>
      </div>

      {/* Kendaraan */}
      <div>
        <label className={labelClass}>Kendaraan <span className="text-red-400">*</span></label>
        <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className={inputClass} required>
          <option value="">-- Pilih Kendaraan --</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>
              {v.plate} — {v.brand} {v.model} ({v.capacity} seat)
            </option>
          ))}
        </select>
        {vehicles.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">Tidak ada kendaraan tersedia saat ini.</p>
        )}
      </div>

      {/* Driver */}
      <div>
        <label className={labelClass}>Driver</label>
        <select value={driverId} onChange={e => setDriverId(e.target.value)} className={inputClass}>
          <option value="">-- Tanpa Driver --</option>
          {drivers.map(d => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tanggal & jam */}
      <div>
        <label className={labelClass}>Tanggal & Jam Berangkat <span className="text-red-400">*</span></label>
        <input
          type="datetime-local"
          required
          value={departAt}
          onChange={e => setDepartAt(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Harga */}
      <div>
        <label className={labelClass}>Harga Tiket (Rp) <span className="text-red-400">*</span></label>
        <input
          type="number"
          required
          min={0}
          placeholder="150000"
          value={price}
          onChange={e => setPrice(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Pickup points */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass + ' mb-0'}>Titik Jemput</label>
          <button
            type="button"
            onClick={addPoint}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <Plus size={13} /> Tambah
          </button>
        </div>
        <div className="space-y-2">
          {points.map((pt, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  placeholder="Nama titik (mis: Terminal A)"
                  value={pt.label}
                  onChange={e => updatePoint(i, 'label', e.target.value)}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Alamat lengkap"
                  value={pt.address}
                  onChange={e => updatePoint(i, 'address', e.target.value)}
                  className={inputClass}
                />
              </div>
              {points.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePoint(i)}
                  className="mt-3 p-2 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold
                   text-white rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
      >
        {pending && <Loader2 size={15} className="animate-spin" />}
        Buat Jadwal
      </button>
    </form>
  )
}
