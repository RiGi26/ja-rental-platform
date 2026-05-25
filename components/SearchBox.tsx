'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type TabType = 'travel' | 'rental'

export default function SearchBox() {
  const router = useRouter()
  const [tab, setTab] = useState<TabType>('travel')

  // Travel fields
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departDate, setDepartDate] = useState('')
  const [passengers, setPassengers] = useState(1)

  // Rental fields
  const [pickupLocation, setPickupLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [withDriver, setWithDriver] = useState(false)

  function handleSearch() {
    if (tab === 'travel') {
      const params = new URLSearchParams({ type: 'travel', origin, destination, date: departDate, pax: String(passengers) })
      router.push(`/search?${params}`)
    } else {
      const params = new URLSearchParams({ type: 'rental', pickup: pickupLocation, start: startDate, end: endDate, driver: String(withDriver) })
      router.push(`/search?${params}`)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Tab switcher */}
      <div className="flex bg-white/20 rounded-full p-1 mb-4 w-fit mx-auto">
        {(['travel', 'rental'] as TabType[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${tab === t ? 'bg-white text-primary shadow' : 'text-white/80 hover:text-white'}`}
          >
            {t === 'travel' ? '🚌 Travel Antar Kota' : '🚗 Rental Mobil'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-panel p-4">
        {tab === 'travel' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Kota Asal"
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              placeholder="Kota Tujuan"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="date"
              value={departDate}
              onChange={e => setDepartDate(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 gap-3">
              <span className="text-text-muted text-sm flex-1">Penumpang: {passengers}</span>
              <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-7 h-7 rounded-full bg-slate-100 text-text font-bold">−</button>
              <button onClick={() => setPassengers(Math.min(8, passengers + 1))} className="w-7 h-7 rounded-full bg-primary text-white font-bold">+</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Lokasi Pengambilan Mobil"
              value={pickupLocation}
              onChange={e => setPickupLocation(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary md:col-span-2"
            />
            <input
              type="date"
              placeholder="Tanggal Mulai"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="date"
              placeholder="Tanggal Selesai"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <label className="flex items-center gap-3 col-span-full cursor-pointer">
              <input type="checkbox" checked={withDriver} onChange={e => setWithDriver(e.target.checked)} className="w-4 h-4 accent-primary" />
              <span className="text-text text-sm">Dengan Driver</span>
            </label>
          </div>
        )}

        <button
          onClick={handleSearch}
          className="mt-4 w-full bg-primary text-white font-bold py-3 rounded-pill text-sm glow-btn hover:bg-primary-hover transition-colors"
        >
          {tab === 'travel' ? 'Cari Tiket' : 'Cari Mobil'}
        </button>
      </div>
    </div>
  )
}
