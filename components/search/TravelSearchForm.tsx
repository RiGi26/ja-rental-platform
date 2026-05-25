'use client'
import { useState, useId } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, CalendarDays, Users, ArrowRight, ArrowLeftRight } from 'lucide-react'

const CITIES = [
  'Jakarta', 'Bandung', 'Yogyakarta', 'Surabaya', 'Semarang',
  'Solo', 'Malang', 'Denpasar', 'Medan', 'Makassar',
  'Palembang', 'Bekasi', 'Depok', 'Tangerang', 'Bogor',
  'Cirebon', 'Purwokerto', 'Pekalongan', 'Kebumen', 'Karawang',
]

export default function TravelSearchForm() {
  const router = useRouter()
  const id = useId()

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [passengers, setPassengers] = useState(1)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  function swapCities() {
    setOrigin(destination)
    setDestination(origin)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!origin || !destination || !date) {
      setError('Lengkapi semua field terlebih dahulu.')
      return
    }
    if (origin.toLowerCase() === destination.toLowerCase()) {
      setError('Kota asal dan tujuan tidak boleh sama.')
      return
    }

    const params = new URLSearchParams({
      type: 'travel',
      origin,
      destination,
      date,
      passengers: String(passengers),
    })
    router.push(`/search?${params}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_auto_auto] gap-3 items-end">
        {/* Kota Asal */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-origin`} className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <MapPin size={12} /> Dari
          </label>
          <div className="relative">
            <input
              id={`${id}-origin`}
              list={`${id}-cities-origin`}
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              placeholder="Kota Asal"
              autoComplete="off"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            <datalist id={`${id}-cities-origin`}>
              {CITIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>

        {/* Swap */}
        <button
          type="button"
          onClick={swapCities}
          className="hidden md:flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors mb-0.5"
          title="Tukar kota"
        >
          <ArrowLeftRight size={16} />
        </button>

        {/* Kota Tujuan */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-dest`} className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <MapPin size={12} /> Ke
          </label>
          <div className="relative">
            <input
              id={`${id}-dest`}
              list={`${id}-cities-dest`}
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="Kota Tujuan"
              autoComplete="off"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            <datalist id={`${id}-cities-dest`}>
              {CITIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>

        {/* Tanggal */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-date`} className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <CalendarDays size={12} /> Tanggal
          </label>
          <input
            id={`${id}-date`}
            type="date"
            value={date}
            min={today}
            onChange={e => setDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        {/* Penumpang */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Users size={12} /> Penumpang
          </label>
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5">
            <button
              type="button"
              onClick={() => setPassengers(Math.max(1, passengers - 1))}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base leading-none transition-colors"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-semibold text-slate-800">{passengers}</span>
            <button
              type="button"
              onClick={() => setPassengers(Math.min(8, passengers + 1))}
              className="w-7 h-7 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-base leading-none transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-xl transition-colors glow-btn whitespace-nowrap"
        >
          Cari Tiket
          <ArrowRight size={16} />
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-500 font-medium">{error}</p>
      )}
    </form>
  )
}
