import type { BookingStatus } from '@/lib/types'

const labelMap: Record<BookingStatus, string> = {
  pending_payment: 'Menunggu Pembayaran',
  paid:            'Sudah Dibayar',
  confirmed:       'Dikonfirmasi',
  otw_pickup:      'OTW Jemput',
  on_trip:         'Perjalanan',
  almost_arrived:  'Hampir Tiba',
  completed:       'Selesai',
  cancelled:       'Dibatalkan',
  expired:         'Kadaluarsa',
}

const classMap: Record<BookingStatus, string> = {
  pending_payment: 'badge-pending',
  paid:            'badge-confirmed',
  confirmed:       'badge-confirmed',
  otw_pickup:      'badge-otw',
  on_trip:         'badge-active',
  almost_arrived:  'badge-active',
  completed:       'badge-done',
  cancelled:       'badge-cancelled',
  expired:         'badge-cancelled',
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
