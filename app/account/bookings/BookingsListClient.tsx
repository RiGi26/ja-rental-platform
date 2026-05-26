'use client'

import { useState } from 'react'
import BookingCard from '@/components/account/BookingCard'
import type { BookingItem } from './page'
import type { BookingStatus } from '@/lib/types'

type Tab = 'semua' | 'aktif' | 'selesai' | 'dibatalkan'

const ACTIVE_STATUSES:    BookingStatus[] = ['pending', 'confirmed', 'otw_pickup', 'on_trip', 'almost_arrived']
const COMPLETED_STATUSES: BookingStatus[] = ['completed']
const CANCELLED_STATUSES: BookingStatus[] = ['cancelled', 'expired']

const TABS: { key: Tab; label: string }[] = [
  { key: 'semua',      label: 'Semua'      },
  { key: 'aktif',      label: 'Aktif'      },
  { key: 'selesai',    label: 'Selesai'    },
  { key: 'dibatalkan', label: 'Dibatalkan' },
]

export default function BookingsListClient({ bookings }: { bookings: BookingItem[] }) {
  const [tab, setTab] = useState<Tab>('semua')

  const filtered = bookings.filter(b => {
    if (tab === 'semua')      return true
    if (tab === 'aktif')      return ACTIVE_STATUSES.includes(b.status)
    if (tab === 'selesai')    return COMPLETED_STATUSES.includes(b.status)
    if (tab === 'dibatalkan') return CANCELLED_STATUSES.includes(b.status)
    return true
  })

  return (
    <div className="space-y-5">
      {/* Tab filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors
              ${tab === t.key
                ? 'bg-primary text-white shadow-glow'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8 text-center">
          <p className="text-slate-400 text-sm">Tidak ada booking di kategori ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <BookingCard
              key={b.booking_code}
              bookingCode={b.booking_code}
              origin={b.origin}
              destination={b.destination}
              departAt={b.depart_at}
              seats={b.seats}
              totalAmount={b.total_amount}
              status={b.status}
              paymentStatus={b.payment_status}
            />
          ))}
        </div>
      )}
    </div>
  )
}
