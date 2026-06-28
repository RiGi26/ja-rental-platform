'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate, formatRupiah } from '@/lib/utils'
import { confirmPaymentManual, cancelBookingAdmin } from '@/lib/actions/admin.actions'
import BookingStatusBadge from '@/components/BookingStatusBadge'
import type { BookingStatus } from '@/lib/types'

type Tab = 'semua' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

interface BookingRow {
  id:             string
  booking_code:   string
  status:         string
  payment_status: string
  total_amount:   number
  created_at:     string
  seats:          string[]
  passengers:     { name: string }[]
  schedule:       { id: string; depart_at: string; route: { origin: string; destination: string } | null } | null
}

interface Props {
  bookings: BookingRow[]
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'semua',     label: 'Semua'         },
  { key: 'pending',   label: 'Pending Bayar' },
  { key: 'confirmed', label: 'Dikonfirmasi'  },
  { key: 'completed', label: 'Selesai'       },
  { key: 'cancelled', label: 'Dibatalkan'    },
]

export default function BookingTable({ bookings }: Props) {
  const router             = useRouter()
  const [tab, setTab]      = useState<Tab>('semua')
  const [search, setSearch] = useState('')
  const [pending, startTransition] = useTransition()

  const filtered = bookings.filter(b => {
    const matchTab = tab === 'semua'
      ? true
      : tab === 'pending'    ? b.payment_status === 'pending'
      : tab === 'confirmed'  ? b.status === 'confirmed'
      : tab === 'completed'  ? b.status === 'completed'
      : b.status === 'cancelled'

    const q = search.toLowerCase()
    const matchSearch = !q
      || b.booking_code.toLowerCase().includes(q)
      || b.passengers.some(p => p.name.toLowerCase().includes(q))

    return matchTab && matchSearch
  })

  function handleConfirm(id: string) {
    startTransition(async () => {
      await confirmPaymentManual(id)
      router.refresh()
    })
  }

  function handleCancel(id: string) {
    if (!confirm('Yakin batalkan booking ini?')) return
    startTransition(async () => {
      await cancelBookingAdmin(id)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors
                ${tab === t.key ? 'text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              style={tab === t.key ? { background: 'linear-gradient(135deg,#1A56DB,#3b82f6)' } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Cari kode / nama penumpang..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ml-auto border border-slate-200 rounded-xl px-4 py-2 text-sm w-64
                     focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {['Kode', 'Rute', 'Penumpang', 'Tanggal', 'Total', 'Status', 'Aksi'].map(h => (
                <th key={h} className="text-left pb-3 pr-4 text-xs font-bold text-slate-400 uppercase tracking-wide last:pr-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400 text-sm">
                  Tidak ada booking di kategori ini.
                </td>
              </tr>
            ) : filtered.map(b => {
              const sched = b.schedule as { id: string; depart_at: string; route: { origin: string; destination: string } | null } | null
              return (
                <tr key={b.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="py-3.5 pr-4">
                    <span className="font-mono text-xs font-bold text-slate-700">{b.booking_code}</span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <p className="font-medium text-slate-800 whitespace-nowrap">
                      {sched?.route?.origin ?? '-'} → {sched?.route?.destination ?? '-'}
                    </p>
                    {sched?.depart_at && (
                      <p className="text-xs text-slate-400">{formatDate(sched.depart_at)}</p>
                    )}
                  </td>
                  <td className="py-3.5 pr-4">
                    <p className="text-slate-700">{b.passengers[0]?.name ?? '-'}</p>
                    {b.passengers.length > 1 && (
                      <p className="text-xs text-slate-400">+{b.passengers.length - 1} lainnya</p>
                    )}
                  </td>
                  <td className="py-3.5 pr-4 text-slate-500 whitespace-nowrap text-xs">
                    {formatDate(b.created_at)}
                  </td>
                  <td className="py-3.5 pr-4 font-bold text-slate-800 whitespace-nowrap">
                    {formatRupiah(b.total_amount)}
                  </td>
                  <td className="py-3.5 pr-4">
                    <BookingStatusBadge status={b.status as BookingStatus} />
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      {b.payment_status === 'pending' && (
                        <button
                          onClick={() => handleConfirm(b.id)}
                          disabled={pending}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors text-white"
                          style={{ background: '#16a34a' }}
                        >
                          Konfirmasi
                        </button>
                      )}
                      {b.status !== 'cancelled' && b.status !== 'completed' && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={pending}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors
                                     bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          Batalkan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
