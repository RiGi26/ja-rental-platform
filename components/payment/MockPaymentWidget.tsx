'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatRupiah } from '@/lib/utils'

interface Props {
  bookingCode: string
  amount:      number
}

export default function MockPaymentWidget({ bookingCode, amount }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'success' | 'pending' | 'failed' | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function sendMockWebhook(status: 'settlement' | 'pending' | 'cancel') {
    const res = await fetch('/api/webhooks/midtrans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mock:               true,
        order_id:           bookingCode,
        transaction_status: status,
        fraud_status:       'accept',
        payment_type:       'mock',
      }),
    })
    return res.ok
  }

  async function handleSuccess() {
    setLoading('success')
    const ok = await sendMockWebhook('settlement')
    if (ok) {
      router.push(`/booking/confirm/${bookingCode}`)
    } else {
      setMessage('Gagal memproses simulasi pembayaran.')
      setLoading(null)
    }
  }

  async function handlePending() {
    setLoading('pending')
    await sendMockWebhook('pending')
    setMessage('Pembayaran dalam status pending. Menunggu konfirmasi...')
    setLoading(null)
  }

  async function handleFailed() {
    setLoading('failed')
    await sendMockWebhook('cancel')
    router.push('/?payment=cancelled')
  }

  return (
    <div className="bg-amber-50 border-2 border-amber-300 border-dashed rounded-2xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🧪</span>
        <div>
          <p className="font-display font-bold text-amber-800 text-lg leading-tight">
            Mode Simulasi Pembayaran
          </p>
          <p className="text-xs text-amber-600">
            Midtrans keys belum dikonfigurasi
          </p>
        </div>
      </div>

      {/* Detail */}
      <div className="bg-white rounded-xl p-4 mb-5 space-y-1.5 border border-amber-100">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Kode Booking</span>
          <span className="font-mono font-bold text-primary">{bookingCode}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Total Bayar</span>
          <span className="font-bold text-slate-800">{formatRupiah(amount)}</span>
        </div>
      </div>

      {/* Pilihan simulasi */}
      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">
        Pilih simulasi:
      </p>
      <div className="space-y-2.5">
        <button
          onClick={handleSuccess}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600
                     text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
        >
          {loading === 'success' ? (
            <span className="animate-spin">⏳</span>
          ) : '✅'}
          Bayar Berhasil
        </button>

        <button
          onClick={handlePending}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500
                     text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
        >
          {loading === 'pending' ? (
            <span className="animate-spin">⏳</span>
          ) : '⏳'}
          Pembayaran Pending
        </button>

        <button
          onClick={handleFailed}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600
                     text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
        >
          {loading === 'failed' ? (
            <span className="animate-spin">⏳</span>
          ) : '❌'}
          Pembayaran Gagal
        </button>
      </div>

      {message && (
        <div className="mt-4 p-3 bg-amber-100 text-amber-800 text-sm rounded-xl border border-amber-200">
          {message}
        </div>
      )}
    </div>
  )
}
