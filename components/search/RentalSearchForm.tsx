'use client'
import { useState, useId } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, CalendarDays, ArrowRight, User } from 'lucide-react'

const LOCATIONS = [
  'Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Barat', 'Jakarta Utara',
  'Bandung Kota', 'Yogyakarta Kota', 'Surabaya Kota', 'Semarang Kota',
  'Bekasi', 'Depok', 'Tangerang', 'Bogor',
]

export default function RentalSearchForm() {
  const router = useRouter()
  const id = useId()

  const [pickup, setPickup] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [withDriver, setWithDriver] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!pickup || !startDate || !endDate) {
      setError('Lengkapi semua field terlebih dahulu.')
      return
    }
    if (startDate > endDate) {
      setError('Tanggal selesai harus setelah tanggal mulai.')
      return
    }

    const params = new URLSearchParams({
      type: 'rental',
      pickup,
      start: startDate,
      end: endDate,
      driver: String(withDriver),
    })
    router.push(`/search?${params}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-end">
        {/* Lokasi Pengambilan */}
        <div className="flex flex-col gap-1.5 md:col-span-1">
          <label htmlFor={`${id}-pickup`} className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <MapPin size={12} /> Lokasi Pengambilan
          </label>
          <input
            id={`${id}-pickup`}
            list={`${id}-locations`}
            value={pickup}
            onChange={e => setPickup(e.target.value)}
            placeholder="Pilih lokasi"
            autoComplete="off"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
          <datalist id={`${id}-locations`}>
            {LOCATIONS.map(l => <option key={l} value={l} />)}
          </datalist>
        </div>

        {/* Tanggal Mulai */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-start`} className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <CalendarDays size={12} /> Mulai
          </label>
          <input
            id={`${id}-start`}
            type="date"
            value={startDate}
            min={today}
            onChange={e => setStartDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        {/* Tanggal Selesai */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-end`} className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <CalendarDays size={12} /> Selesai
          </label>
          <input
            id={`${id}-end`}
            type="date"
            value={endDate}
            min={startDate || today}
            onChange={e => setEndDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        {/* Dengan Driver Toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <User size={12} /> Driver
          </label>
          <button
            type="button"
            onClick={() => setWithDriver(d => !d)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              withDriver
                ? 'bg-primary text-white border-primary'
                : 'border-slate-200 text-slate-600 hover:border-primary/40'
            }`}
          >
            {withDriver ? '✓ Dengan Driver' : 'Lepas Kunci'}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-xl transition-colors glow-btn whitespace-nowrap"
        >
          Cari Mobil
          <ArrowRight size={16} />
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-500 font-medium">{error}</p>
      )}
    </form>
  )
}
