'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'
import MockPaymentWidget from '@/components/payment/MockPaymentWidget'
import PaymentWidget from '@/components/payment/PaymentWidget'

interface TokenResponse {
  snapToken:   string
  clientKey:   string
  isMockMode:  boolean
  bookingCode: string
  amount:      number
  expiresAt:   string
  error?:      string
}

function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now())
      setRemaining(diff)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  return remaining
}

function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

export default function PayPage() {
  const { bookingCode } = useParams<{ bookingCode: string }>()
  const router          = useRouter()

  const [data,    setData]    = useState<TokenResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchErr, setFetchErr] = useState<string | null>(null)

  const remaining = useCountdown(data?.expiresAt ?? null)
  const isExpired = remaining !== null && remaining === 0

  const fetchToken = useCallback(async () => {
    setLoading(true)
    setFetchErr(null)
    try {
      const res = await fetch('/api/payment/create-token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ bookingCode }),
      })
      const json = await res.json() as TokenResponse
      if (!res.ok || json.error) {
        setFetchErr(json.error ?? 'Gagal memuat data pembayaran.')
      } else {
        setData(json)
      }
    } catch {
      setFetchErr('Gagal terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }, [bookingCode])

  useEffect(() => { fetchToken() }, [fetchToken])

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm">Menyiapkan pembayaran...</p>
        </div>
      </main>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (fetchErr) {
    const isExpiredError = fetchErr.toLowerCase().includes('kadaluarsa')
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="bg-bg-card rounded-2xl shadow-card p-8 max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">{isExpiredError ? '⏰' : '⚠️'}</div>
          <h2 className="font-display font-bold text-xl text-slate-800">
            {isExpiredError ? 'Booking Kadaluarsa' : 'Terjadi Kesalahan'}
          </h2>
          <p className="text-slate-500 text-sm">{fetchErr}</p>
          <Link
            href="/"
            className="block bg-primary text-white font-semibold px-6 py-3 rounded-xl
                       hover:bg-primary-hover transition-colors"
          >
            Booking Baru
          </Link>
        </div>
      </main>
    )
  }

  if (!data) return null

  // ── Expired (timer habis saat di halaman) ─────────────────────────────────
  if (isExpired) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="bg-bg-card rounded-2xl shadow-card p-8 max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">⏰</div>
          <h2 className="font-display font-bold text-xl text-slate-800">Waktu Pembayaran Habis</h2>
          <p className="text-slate-500 text-sm">
            Sesi booking <span className="font-mono font-semibold">{bookingCode}</span> sudah berakhir.
          </p>
          <Link
            href="/"
            className="block bg-primary text-white font-semibold px-6 py-3 rounded-xl
                       hover:bg-primary-hover transition-colors"
          >
            Booking Baru
          </Link>
        </div>
      </main>
    )
  }

  const isAlmostExpired = remaining !== null && remaining < 5 * 60 * 1000

  return (
    <main className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-slate-900 mb-1">Selesaikan Pembayaran</h1>
          <p className="text-slate-500 text-sm">
            Kode booking:{' '}
            <span className="font-mono font-semibold text-primary">{bookingCode}</span>
          </p>
        </div>

        {/* Countdown */}
        {remaining !== null && (
          <div
            className={`rounded-2xl p-4 text-center transition-colors ${
              isAlmostExpired
                ? 'bg-red-50 border border-red-200'
                : 'bg-blue-50 border border-blue-100'
            }`}
          >
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
              isAlmostExpired ? 'text-red-500' : 'text-slate-400'
            }`}>
              Bayar dalam
            </p>
            <p className={`font-mono font-bold text-3xl ${
              isAlmostExpired ? 'text-red-600 animate-pulse' : 'text-slate-800'
            }`}>
              {formatCountdown(remaining)}
            </p>
          </div>
        )}

        {/* Total */}
        <div className="bg-bg-card rounded-2xl shadow-card p-5 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-400">Total Pembayaran</p>
            <p className="text-2xl font-bold text-primary">{formatRupiah(data.amount)}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
            🎫
          </div>
        </div>

        {/* Widget */}
        {data.isMockMode ? (
          <MockPaymentWidget bookingCode={bookingCode} amount={data.amount} />
        ) : (
          <PaymentWidget
            snapToken={data.snapToken}
            clientKey={data.clientKey}
            bookingCode={bookingCode}
          />
        )}
      </div>
    </main>
  )
}
