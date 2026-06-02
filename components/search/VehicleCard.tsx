'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { VehicleType, VehicleWithPrice } from '@/lib/types'
import { formatRupiah } from '@/lib/utils'

interface Props {
  vehicle: VehicleWithPrice
  start: string
  end: string
  withDriver: boolean
}

const TYPE_LABEL: Record<VehicleType, string> = {
  sedan:   'Sedan',
  suv:     'SUV',
  van:     'Van',
  minibus: 'Minibus',
  bus:     'Bus',
}

export default function VehicleCard({ vehicle, start, end, withDriver }: Props) {
  const router = useRouter()
  const photo = vehicle.photos?.[0] ?? null

  function handleSelect() {
    const params = new URLSearchParams({ start, end, driver: String(withDriver) })
    router.push(`/rental/${vehicle.id}?${params}`)
  }

  return (
    <div
      onClick={handleSelect}
      className="bg-bg-card rounded-2xl shadow-card border border-slate-100 cursor-pointer
                 hover:-translate-y-1 hover:shadow-panel transition-all duration-200 group overflow-hidden"
    >
      {/* Foto */}
      <div className="w-full h-44 bg-slate-100 overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={`${vehicle.brand} ${vehicle.model}`}
            width={400}
            height={176}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🚗</div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-bold text-slate-800 text-lg leading-tight">
            {vehicle.brand} {vehicle.model}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5">
            {TYPE_LABEL[vehicle.type] ?? vehicle.type}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <span className="text-green-500 font-medium">⭐ Tersedia</span>
          <span>•</span>
          <span>{vehicle.capacity} Penumpang</span>
        </div>

        <p className="text-xs text-slate-400 mb-3">{vehicle.plate}</p>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400">per hari</p>
            <p className="text-lg font-bold text-primary tabular-nums tracking-tight">{formatRupiah(vehicle.price_per_day)}</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); handleSelect() }}
            className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl
                       hover:bg-primary-hover active:scale-[0.96] transition-all duration-200 group-hover:shadow-glow"
          >
            Pilih Mobil →
          </button>
        </div>
      </div>
    </div>
  )
}
