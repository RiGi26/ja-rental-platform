import Image from 'next/image'
import Link from 'next/link'
import type { Vehicle } from '@/lib/types'
import { formatRupiah } from '@/lib/utils'

interface Props {
  vehicle: Vehicle
  pricePerDay: number
  available: boolean
}

export default function VehicleCard({ vehicle, pricePerDay, available }: Props) {
  return (
    <div className="bg-bg-card rounded-2xl shadow-card overflow-hidden hover:shadow-panel transition-shadow">
      <div className="relative h-48 bg-slate-100">
        {vehicle.photos[0] && (
          <Image src={vehicle.photos[0]} alt={vehicle.plate} fill className="object-cover" unoptimized />
        )}
        <span className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full ${available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {available ? 'Tersedia' : 'Tidak Tersedia'}
        </span>
      </div>
      <div className="p-4">
        <p className="font-semibold text-text capitalize">{vehicle.type} — {vehicle.plate}</p>
        <p className="text-text-muted text-sm mb-3">{vehicle.capacity} penumpang • {vehicle.year}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">Mulai dari</p>
            <p className="font-bold text-primary">{formatRupiah(pricePerDay)}<span className="text-xs font-normal text-text-muted">/hari</span></p>
          </div>
          <Link
            href={`/search?type=rental&vehicle=${vehicle.id}`}
            className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-pill hover:bg-primary-hover transition-colors"
          >
            Pilih
          </Link>
        </div>
      </div>
    </div>
  )
}
