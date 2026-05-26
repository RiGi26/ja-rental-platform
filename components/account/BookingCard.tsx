import Link from 'next/link'
import BookingStatusBadge from '@/components/BookingStatusBadge'
import type { BookingStatus } from '@/lib/types'
import { formatDate, formatTime, formatRupiah } from '@/lib/utils'

const ACTIVE_STATUSES: BookingStatus[] = ['confirmed', 'otw_pickup', 'on_trip', 'almost_arrived']

interface Props {
  bookingCode: string
  origin:      string
  destination: string
  departAt:    string
  seats:       string[]
  totalAmount: number
  status:      BookingStatus
  paymentStatus: string
}

export default function BookingCard({
  bookingCode,
  origin,
  destination,
  departAt,
  seats,
  totalAmount,
  status,
  paymentStatus,
}: Props) {
  const isActive  = ACTIVE_STATUSES.includes(status)
  const isPaid    = paymentStatus === 'paid'

  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5 space-y-4">
      {/* Route + status */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display font-bold text-slate-900 text-base">
            {origin} <span className="text-primary">→</span> {destination}
          </p>
          <p className="text-sm text-slate-500 mt-0.5">
            {formatDate(departAt)} &bull; {formatTime(departAt)} WIB
          </p>
        </div>
        <BookingStatusBadge status={status} />
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span>{seats.length} Penumpang</span>
        <span>Kursi: {seats.join(', ')}</span>
        <span className="font-mono text-slate-700">Kode: {bookingCode}</span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <span className="font-bold text-slate-800">{formatRupiah(totalAmount)}</span>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {isActive && (
            <Link
              href={`/tracking/${bookingCode}`}
              className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700
                         rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Tracking
            </Link>
          )}
          {isPaid && (
            <>
              <a
                href={`/api/ticket/${bookingCode}/pdf`}
                download={`eticket-${bookingCode}.pdf`}
                className="text-xs font-semibold px-3 py-1.5 bg-primary/10 text-primary
                           rounded-lg hover:bg-primary/20 transition-colors"
              >
                E-Ticket
              </a>
              <a
                href={`/api/ticket/${bookingCode}/invoice`}
                download={`invoice-${bookingCode}.pdf`}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700
                           rounded-lg hover:bg-slate-200 transition-colors"
              >
                Invoice
              </a>
            </>
          )}
          <Link
            href={`/account/bookings/${bookingCode}`}
            className="text-xs font-semibold px-3 py-1.5 text-slate-500
                       rounded-lg hover:bg-slate-100 transition-colors"
          >
            Detail
          </Link>
        </div>
      </div>
    </div>
  )
}
