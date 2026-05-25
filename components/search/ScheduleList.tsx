'use client'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { Schedule } from '@/lib/types'
import ScheduleCard from './ScheduleCard'
import SearchFilter from './SearchFilter'
import NoResults from './NoResults'
import { SlidersHorizontal, X } from 'lucide-react'

interface Props {
  schedules: Schedule[]
  passengers: number
  origin: string
  destination: string
}

function getWibHour(dateStr: string): number {
  return parseInt(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Asia/Jakarta',
    }).format(new Date(dateStr))
  )
}

export default function ScheduleList({ schedules, passengers, origin, destination }: Props) {
  const searchParams = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)

  const activeTime   = searchParams.getAll('time')
  const activeModels = searchParams.getAll('model')
  const activeSort   = searchParams.get('sort') ?? 'depart_asc'

  const filtered = useMemo(() => {
    let result = [...schedules]

    // Filter waktu
    if (activeTime.length > 0) {
      result = result.filter(s => {
        const h = getWibHour(s.depart_at)
        return (
          (activeTime.includes('pagi')  && h >= 5  && h < 12) ||
          (activeTime.includes('siang') && h >= 12 && h < 17) ||
          (activeTime.includes('malam') && h >= 17 && h < 24)
        )
      })
    }

    // Filter armada
    if (activeModels.length > 0) {
      result = result.filter(s => s.vehicle && activeModels.includes(s.vehicle.model))
    }

    // Sort
    result.sort((a, b) => {
      switch (activeSort) {
        case 'price_asc':
          return a.price_adult - b.price_adult
        case 'seats_desc':
          return b.seats_available - a.seats_available
        case 'rating_desc':
          return (b.driver?.avg_rating ?? 0) - (a.driver?.avg_rating ?? 0)
        default: // depart_asc
          return new Date(a.depart_at).getTime() - new Date(b.depart_at).getTime()
      }
    })

    return result
  }, [schedules, activeTime, activeModels, activeSort])

  return (
    <div>
      {/* Mobile filter toggle */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <p className="text-sm text-slate-500">
          {filtered.length} jadwal ditemukan
        </p>
        <button
          onClick={() => setFilterOpen(o => !o)}
          className="flex items-center gap-2 text-sm font-medium text-primary border border-primary/30 px-4 py-2 rounded-xl"
        >
          <SlidersHorizontal size={15} />
          {filterOpen ? 'Tutup Filter' : 'Filter & Urutan'}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filter — desktop sticky, mobile collapsible */}
        <aside className={`${filterOpen ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
          {/* Mobile: overlay-style */}
          {filterOpen && (
            <div className="md:hidden flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Filter</h3>
              <button onClick={() => setFilterOpen(false)}>
                <X size={18} className="text-slate-500" />
              </button>
            </div>
          )}
          <div className="md:sticky md:top-6">
            <SearchFilter schedules={schedules} />
          </div>
        </aside>

        {/* Hasil */}
        <div className="flex-1 min-w-0">
          {/* Desktop count */}
          <p className="hidden md:block text-sm text-slate-500 mb-4">
            {filtered.length} jadwal ditemukan
          </p>

          {filtered.length === 0 ? (
            <NoResults origin={origin} destination={destination} />
          ) : (
            <div className="space-y-3">
              {filtered.map(schedule => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  passengers={passengers}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
