'use client'
import type { PickupPoint } from '@/lib/types'
import { MapPin } from 'lucide-react'

interface Props {
  pickupPoints: PickupPoint[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function PickupPointSelector({ pickupPoints, selectedId, onSelect }: Props) {
  if (pickupPoints.length === 0) {
    return (
      <p className="text-sm text-slate-400 italic">
        Tidak ada titik jemput untuk jadwal ini.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {[...pickupPoints]
        .sort((a, b) => a.order - b.order)
        .map(point => {
          const active = selectedId === point.id
          return (
            <button
              key={point.id}
              type="button"
              onClick={() => onSelect(point.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 flex items-start gap-3
                ${active
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 hover:border-primary/40 hover:bg-slate-50'
                }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${active ? 'border-primary bg-primary' : 'border-slate-300'}`}
              >
                {active && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${active ? 'text-primary' : 'text-slate-800'}`}>
                  {point.label}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin size={10} className="flex-shrink-0" />
                  {point.address}
                </p>
              </div>
            </button>
          )
        })}
    </div>
  )
}
