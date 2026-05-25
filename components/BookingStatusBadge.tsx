import type { BookingStatus } from '@/lib/types'

const labelMap: Record<BookingStatus, string> = {
  pending:    'Menunggu Pembayaran',
  confirmed:  'Dikonfirmasi',
  otw_pickup: 'OTW Jemput',
  on_trip:    'Perjalanan',
  done:       'Selesai',
  cancelled:  'Dibatalkan',
}

const classMap: Record<BookingStatus, string> = {
  pending:    'badge-pending',
  confirmed:  'badge-confirmed',
  otw_pickup: 'badge-otw',
  on_trip:    'badge-active',
  done:       'badge-done',
  cancelled:  'badge-cancelled',
}

interface Props {
  status: BookingStatus
}

export default function BookingStatusBadge({ status }: Props) {
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${classMap[status]}`}>
      {labelMap[status]}
    </span>
  )
}
