'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ChevronDown } from 'lucide-react'
import { createVehicle, updateVehicle, type VehicleInput } from '@/lib/actions/fleet.actions'
import type { Vehicle } from '@/lib/types'
import PhotoUploader from './PhotoUploader'

const TYPE_OPTIONS = [
  { value: 'mpv', label: 'MPV' },
  { value: 'suv', label: 'SUV' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'citycar', label: 'City Car' },
  { value: 'minibus', label: 'Minibus' },
  { value: 'van', label: 'Van' },
  { value: 'pickup', label: 'Pick Up' },
  { value: 'bus', label: 'Bus' },
]
const STATUS_OPTIONS = [
  { value: 'available', label: 'Tersedia' },
  { value: 'on_trip', label: 'Dalam Perjalanan' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inactive', label: 'Nonaktif (arsip)' },
]
const TRANSMISSION_OPTIONS = ['Manual', 'Matic']
const FUEL_OPTIONS = ['Bensin', 'Diesel', 'Hybrid', 'Listrik']

// Render a stored number (including 0) in a text input; blank only when null/undefined.
// Without this, a vehicle whose price/capacity is 0 shows an empty field (0 is falsy),
// which then fails the required-field check and blocks saving.
const numStr = (n?: number | null) => (n != null ? String(n) : '')

export default function VehicleForm({ mode, initial }: { mode: 'create' | 'edit'; initial?: Vehicle }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showLegal, setShowLegal] = useState(false)

  const [brand, setBrand] = useState<string>(initial?.brand ?? '')
  const [model, setModel] = useState<string>(initial?.model ?? '')
  const [plate, setPlate] = useState<string>(initial?.plate ?? '')
  const [type, setType] = useState<string>(initial?.type ?? 'mpv')
  const [capacity, setCapacity] = useState<string>(numStr(initial?.capacity))
  const [year, setYear] = useState<string>(numStr(initial?.year))
  const [transmission, setTransmission] = useState<string>(initial?.transmission ?? '')
  const [fuelType, setFuelType] = useState<string>(initial?.fuel_type ?? '')
  const [price, setPrice] = useState<string>(numStr(initial?.price_per_day))
  const [status, setStatus] = useState<string>(initial?.status ?? 'available')
  const [description, setDescription] = useState<string>(initial?.description ?? '')
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? [])

  const [nextServiceDate, setNextServiceDate] = useState<string>(initial?.next_service_date ?? '')
  const [nextServiceKm, setNextServiceKm] = useState<string>(numStr(initial?.next_service_km))
  const [stnkExpiry, setStnkExpiry] = useState<string>(initial?.stnk_expiry ?? '')
  const [kirExpiry, setKirExpiry] = useState<string>(initial?.kir_expiry ?? '')
  const [taxExpiry, setTaxExpiry] = useState<string>(initial?.tax_expiry ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!brand.trim() || !model.trim() || !plate.trim() || !capacity || !price) {
      setError('Lengkapi field wajib: merek, model, plat, kapasitas, dan harga.')
      return
    }
    const payload: VehicleInput = {
      brand,
      model,
      plate,
      type,
      capacity: Number(capacity),
      year: year ? Number(year) : null,
      price_per_day: Number(price),
      transmission: transmission || null,
      fuel_type: fuelType || null,
      description: description || null,
      status,
      photos,
      next_service_date: nextServiceDate || null,
      next_service_km: nextServiceKm ? Number(nextServiceKm) : null,
      stnk_expiry: stnkExpiry || null,
      kir_expiry: kirExpiry || null,
      tax_expiry: taxExpiry || null,
    }
    startTransition(async () => {
      const res =
        mode === 'edit' && initial
          ? await updateVehicle(initial.id, payload)
          : await createVehicle(payload)
      if (res.error) setError(res.error)
      else {
        router.push('/admin/fleet')
        router.refresh()
      }
    })
  }

  const inputClass = `w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800
    placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400`
  const labelClass = 'block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide'
  const req = <span className="text-red-400">*</span>

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className={labelClass}>Foto Kendaraan</label>
        <PhotoUploader value={photos} onChange={setPhotos} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Merek {req}</label>
          <input className={inputClass} placeholder="Toyota" value={brand} onChange={(e) => setBrand(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Model {req}</label>
          <input className={inputClass} placeholder="Avanza" value={model} onChange={(e) => setModel(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Nomor Plat {req}</label>
          <input className={inputClass} placeholder="B 1234 STY" value={plate} onChange={(e) => setPlate(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Tipe {req}</label>
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
            {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Kapasitas (kursi) {req}</label>
          <input type="number" min={1} className={inputClass} placeholder="7" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Tahun</label>
          <input type="number" min={1990} max={2100} className={inputClass} placeholder="2023" value={year} onChange={(e) => setYear(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Transmisi</label>
          <select className={inputClass} value={transmission} onChange={(e) => setTransmission(e.target.value)}>
            <option value="">— Pilih —</option>
            {TRANSMISSION_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Bahan Bakar</label>
          <select className={inputClass} value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
            <option value="">— Pilih —</option>
            {FUEL_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Harga Sewa / Hari (Rp) {req}</label>
          <input type="number" min={1} className={inputClass} placeholder="350000" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Deskripsi</label>
        <textarea
          rows={3}
          className={inputClass}
          placeholder="Mobil keluarga nyaman dan irit, cocok untuk perjalanan jauh…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => setShowLegal((s) => !s)}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ChevronDown size={16} className={`transition-transform ${showLegal ? 'rotate-180' : ''}`} />
          Legal &amp; servis (opsional)
        </button>
        {showLegal && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className={labelClass}>Servis berikutnya (tanggal)</label>
              <input type="date" className={inputClass} value={nextServiceDate} onChange={(e) => setNextServiceDate(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Servis berikutnya (KM)</label>
              <input type="number" min={0} className={inputClass} placeholder="60000" value={nextServiceKm} onChange={(e) => setNextServiceKm(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>STNK berlaku s/d</label>
              <input type="date" className={inputClass} value={stnkExpiry} onChange={(e) => setStnkExpiry(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>KIR berlaku s/d</label>
              <input type="date" className={inputClass} value={kirExpiry} onChange={(e) => setKirExpiry(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Pajak berlaku s/d</label>
              <input type="date" className={inputClass} value={taxExpiry} onChange={(e) => setTaxExpiry(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
      >
        {pending && <Loader2 size={15} className="animate-spin" />}
        {mode === 'edit' ? 'Simpan Perubahan' : 'Tambah Kendaraan'}
      </button>
    </form>
  )
}
