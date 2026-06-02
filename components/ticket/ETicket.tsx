import QRCode from 'qrcode'
import Image from 'next/image'
import { formatDate, formatTime, formatRupiah } from '@/lib/utils'

interface Passenger {
  name:          string
  seat_number:   string
  pickup_point_id: string | null
}

interface Route {
  origin:      string
  destination: string
}

interface Vehicle {
  brand: string
  model: string
  plate: string
}

interface Schedule {
  depart_at: string
  route?:    Route
  vehicle?:  Vehicle
}

interface ETicketProps {
  bookingCode:   string
  totalAmount:   number
  paymentStatus: string
  schedule:      Schedule | null
  passengers:    Passenger[]
  pickupPoints?: { id: string; label: string }[]
}

export default async function ETicket({
  bookingCode,
  totalAmount,
  paymentStatus,
  schedule,
  passengers,
  pickupPoints = [],
}: ETicketProps) {
  const qrContent = JSON.stringify({ bookingCode, type: 'travel', version: 1 })
  const qrSvg     = await QRCode.toString(qrContent, { type: 'svg', width: 120, margin: 1 })
  const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString('base64')}`

  const route   = schedule?.route
  const vehicle = schedule?.vehicle

  function getPickupLabel(pickupPointId: string | null): string {
    if (!pickupPointId) return '—'
    return pickupPoints.find(p => p.id === pickupPointId)?.label ?? pickupPointId
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-lg max-w-lg mx-auto">
      {/* Header biru */}
      <div className="bg-gradient-to-r from-primary to-blue-600 px-6 pt-5 pb-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold opacity-70 uppercase tracking-widest mb-1">E-TICKET</p>
            <p className="font-display font-bold text-xl">JaMobility</p>
          </div>
          {/* QR Code */}
          <div className="bg-white rounded-xl p-1.5 shadow">
            <Image src={qrDataUrl} alt="QR Code" width={80} height={80} unoptimized />
          </div>
        </div>

        {/* Rute */}
        <div className="mt-5">
          {route ? (
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-2xl">{route.origin}</span>
              <span className="opacity-60 text-xl">→</span>
              <span className="font-display font-bold text-2xl">{route.destination}</span>
            </div>
          ) : (
            <p className="text-xl font-bold opacity-70">Rental</p>
          )}
          {schedule?.depart_at && (
            <p className="text-sm opacity-80 mt-1">
              {formatDate(schedule.depart_at)} · {formatTime(schedule.depart_at)} WIB
            </p>
          )}
        </div>
      </div>

      {/* Perforasi */}
      <div className="relative h-4 -mt-2">
        <div className="absolute inset-x-0 top-0 h-4 bg-bg"
             style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #f1f5f9 8px, transparent 8px)' }} />
      </div>

      {/* Kode booking */}
      <div className="px-6 py-3 border-b border-dashed border-slate-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Kode Booking</span>
        <span className="font-mono font-bold text-primary text-lg tracking-widest">{bookingCode}</span>
      </div>

      {/* Penumpang */}
      {passengers.length > 0 && (
        <div className="px-6 py-4 border-b border-dashed border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Penumpang</p>
          <div className="space-y-2">
            {passengers.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-slate-800">{p.name}</span>
                  {p.pickup_point_id && (
                    <span className="text-slate-400 text-xs ml-2">
                      📍 {getPickupLabel(p.pickup_point_id)}
                    </span>
                  )}
                </div>
                <span className="font-semibold text-primary bg-primary/5 px-2.5 py-0.5 rounded-full text-xs whitespace-nowrap">
                  Kursi {p.seat_number}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer: total + armada */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Total Dibayar</p>
          <p className="font-bold text-lg text-slate-800">{formatRupiah(totalAmount)}</p>
          {vehicle && (
            <p className="text-xs text-slate-400 mt-0.5">
              {vehicle.brand} {vehicle.model} · {vehicle.plate}
            </p>
          )}
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
          paymentStatus === 'paid'
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-100 text-amber-700'
        }`}>
          {paymentStatus === 'paid' ? '✅ LUNAS' : '⏳ PENDING'}
        </span>
      </div>
    </div>
  )
}
