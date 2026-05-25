import type { Metadata } from 'next'
import type { SearchParams } from 'next/dist/server/request/search-params'
import { searchSchedules } from '@/lib/actions/schedule.actions'
import ScheduleList from '@/components/search/ScheduleList'
import NoResults from '@/components/search/NoResults'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'

interface Props {
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p = await searchParams
  const origin = String(p.origin ?? '')
  const destination = String(p.destination ?? '')
  return {
    title: origin && destination
      ? `Jadwal ${origin} → ${destination}`
      : 'Cari Jadwal',
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const p = await searchParams

  const origin      = String(p.origin ?? '').trim()
  const destination = String(p.destination ?? '').trim()
  const date        = String(p.date ?? '')
  const passengers  = Math.max(1, parseInt(String(p.passengers ?? '1')) || 1)

  // Validasi parameter wajib
  if (!origin || !destination || !date) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Parameter pencarian tidak lengkap.</p>
          <Link href="/" className="text-primary font-semibold hover:underline">
            ← Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const schedules = await searchSchedules({ origin, destination, date, passengers })

  return (
    <main className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Ubah
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-slate-800 truncate">
              {origin} → {destination}
            </p>
            <p className="text-slate-400 text-xs">
              {formatDateShort(date)} · {passengers} penumpang
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {schedules.length === 0 ? (
          <NoResults origin={origin} destination={destination} />
        ) : (
          <ScheduleList
            schedules={schedules}
            passengers={passengers}
            origin={origin}
            destination={destination}
          />
        )}
      </div>
    </main>
  )
}
