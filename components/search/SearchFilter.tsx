'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import type { Schedule } from '@/lib/types'

const TIME_SLOTS = [
  { key: 'pagi',  label: 'Pagi',  desc: '05:00 – 11:59' },
  { key: 'siang', label: 'Siang', desc: '12:00 – 16:59' },
  { key: 'malam', label: 'Malam', desc: '17:00 – 23:59' },
]

const SORT_OPTIONS = [
  { key: 'depart_asc',  label: 'Berangkat Paling Awal' },
  { key: 'price_asc',   label: 'Harga Termurah' },
  { key: 'seats_desc',  label: 'Kursi Terbanyak' },
  { key: 'rating_desc', label: 'Rating Tertinggi' },
]

interface Props {
  schedules: Schedule[]  // untuk ekstrak model unik
}

export default function SearchFilter({ schedules }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeTime   = searchParams.getAll('time')
  const activeModels = searchParams.getAll('model')
  const activeSort   = searchParams.get('sort') ?? 'depart_asc'

  // Model unik dari hasil pencarian
  const uniqueModels = [...new Set(
    schedules.map(s => s.vehicle?.model).filter((m): m is string => !!m)
  )].sort()

  const updateParam = useCallback(
    (key: string, value: string, multi = false) => {
      const params = new URLSearchParams(searchParams.toString())

      if (multi) {
        const current = params.getAll(key)
        if (current.includes(value)) {
          params.delete(key)
          current.filter(v => v !== value).forEach(v => params.append(key, v))
        } else {
          params.append(key, value)
        }
      } else {
        params.set(key, value)
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  function resetFilters() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('time')
    params.delete('model')
    params.delete('sort')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const hasActiveFilter = activeTime.length > 0 || activeModels.length > 0 || activeSort !== 'depart_asc'

  return (
    <div className="bg-bg-card rounded-2xl shadow-card border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-slate-800">Filter & Urutan</h3>
        {hasActiveFilter && (
          <button
            onClick={resetFilters}
            className="text-xs text-primary hover:underline font-medium"
          >
            Reset
          </button>
        )}
      </div>

      {/* Waktu Berangkat */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Waktu Berangkat
        </p>
        <div className="space-y-2">
          {TIME_SLOTS.map(slot => (
            <label key={slot.key} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={activeTime.includes(slot.key)}
                onChange={() => updateParam('time', slot.key, true)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="flex-1">
                <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">
                  {slot.label}
                </span>
                <span className="text-xs text-slate-400 ml-2">{slot.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Jenis Armada */}
      {uniqueModels.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Jenis Armada
          </p>
          <div className="space-y-2">
            {uniqueModels.map(model => (
              <label key={model} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={activeModels.includes(model)}
                  onChange={() => updateParam('model', model, true)}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">
                  {model}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Urutkan */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Urutkan
        </p>
        <div className="space-y-2">
          {SORT_OPTIONS.map(opt => (
            <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="sort"
                checked={activeSort === opt.key}
                onChange={() => updateParam('sort', opt.key)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
