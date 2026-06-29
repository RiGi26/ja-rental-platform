'use client'
import { useState, useId } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, CalendarDays, ArrowRight, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-end">
        {/* Lokasi Pengambilan */}
        <div className="flex flex-col gap-2 md:col-span-1">
          <label htmlFor={`${id}-pickup`} className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 uppercase tracking-wide">
            <MapPin size={14} className="text-primary" /> Lokasi Pengambilan / Bandara
          </label>
          <div className="relative">
            <Input
              id={`${id}-pickup`}
              list={`${id}-locations`}
              value={pickup}
              onChange={e => setPickup(e.target.value)}
              placeholder="Kota atau Bandara (ex: Narita)"
              autoComplete="off"
              className="w-full h-12 px-4 rounded-xl border-slate-200 text-sm focus-visible:ring-primary/40 shadow-sm"
            />
            <datalist id={`${id}-locations`}>
              {LOCATIONS.map(l => <option key={l} value={l} />)}
            </datalist>
          </div>
        </div>

        {/* Tanggal Mulai */}
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-start`} className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 uppercase tracking-wide">
            <CalendarDays size={14} className="text-primary" /> Mulai
          </label>
          <Input
            id={`${id}-start`}
            type="date"
            value={startDate}
            min={today}
            onChange={e => setStartDate(e.target.value)}
            className="h-12 px-4 rounded-xl border-slate-200 text-sm focus-visible:ring-primary/40 shadow-sm"
          />
        </div>

        {/* Tanggal Selesai */}
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-end`} className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 uppercase tracking-wide">
            <CalendarDays size={14} className="text-primary" /> Selesai
          </label>
          <Input
            id={`${id}-end`}
            type="date"
            value={endDate}
            min={startDate || today}
            onChange={e => setEndDate(e.target.value)}
            className="h-12 px-4 rounded-xl border-slate-200 text-sm focus-visible:ring-primary/40 shadow-sm"
          />
        </div>

        {/* Dengan Driver Toggle */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 uppercase tracking-wide">
            <User size={14} className={withDriver ? "text-primary" : "text-slate-400"} /> Tipe Sewa
          </label>
          <button
            type="button"
            onClick={() => setWithDriver(d => !d)}
            className={`flex items-center justify-center h-12 px-5 rounded-xl border text-sm font-medium transition-all shadow-sm ${
              withDriver
                ? 'bg-[#1A56DB] text-white border-[#1A56DB]'
                : 'bg-white border-slate-200 text-slate-600 hover:border-[#1A56DB]/40'
            }`}
          >
            {withDriver ? '✓ Dengan Driver' : 'Lepas Kunci'}
          </button>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="h-12 px-8 rounded-xl font-bold bg-[#1A56DB] hover:bg-[#1447C0] text-white shadow-glow transition-all active:scale-95 whitespace-nowrap gap-2"
        >
          Cek Ketersediaan Mobil
          <ArrowRight size={18} />
        </Button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          {error}
        </div>
      )}
    </form>
  )
}
