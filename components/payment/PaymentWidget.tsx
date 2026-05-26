'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

interface Props {
  snapToken:   string
  clientKey:   string
  bookingCode: string
}

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess:  (r: unknown) => void
          onPending:  (r: unknown) => void
          onError:    (r: unknown) => void
          onClose:    () => void
        }
      ) => void
    }
  }
}

const SNAP_URL = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'

const POLL_INTERVAL_MS = 5_000
const POLL_MAX         = 72   // 6 menit

export default function PaymentWidget({ snapToken, clientKey, bookingCode }: Props) {
  const router = useRouter()

  const [scriptReady, setScriptReady] = useState(false)
  const [popupOpen,   setPopupOpen]   = useState(false)
  const [polling,     setPolling]     = useState(false)
  const [errMsg,      setErrMsg]      = useState<string | null>(null)
  const [expired,     setExpired]     = useState(false)

  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollCount = useRef(0)

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    setPolling(false)
  }

  function startPolling() {
    pollCount.current = 0
    setPolling(true)

    pollRef.current = setInterval(async () => {
      pollCount.current += 1

      if (pollCount.current > POLL_MAX) {
        stopPolling()
        setErrMsg('Waktu pengecekan habis. Cek email atau histori booking Anda.')
        return
      }

      try {
        const res  = await fetch(`/api/payment/check-status/${bookingCode}`)
        const data = await res.json() as { status?: string }

        if (data.status === 'paid') {
          stopPolling()
          router.push(`/booking/confirm/${bookingCode}`)
        } else if (data.status === 'expired') {
          stopPolling()
          setExpired(true)
          setPopupOpen(false)
        }
        // 'pending' → lanjut polling
      } catch {
        // network error — lanjut polling
      }
    }, POLL_INTERVAL_MS)
  }

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), [])

  function openSnap() {
    if (!window.snap) return
    setPopupOpen(true)
    setErrMsg(null)
    setExpired(false)

    window.snap.pay(snapToken, {
      onSuccess: () => {
        setPopupOpen(false)
        stopPolling()
        router.push(`/booking/confirm/${bookingCode}`)
      },
      onPending: () => {
        setPopupOpen(false)
        // Snap signals pending — mulai polling
        startPolling()
      },
      onError: () => {
        setPopupOpen(false)
        stopPolling()
        setErrMsg('Pembayaran gagal. Silakan coba lagi.')
      },
      onClose: () => {
        setPopupOpen(false)
        // User tutup popup — tetap polling karena mungkin sudah bayar
        startPolling()
      },
    })
  }

  // Auto-open Snap setelah script load
  useEffect(() => {
    if (scriptReady) openSnap()
  }, [scriptReady]) // eslint-disable-line react-hooks/exhaustive-deps

  if (expired) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="text-4xl">⏰</div>
        <p className="font-semibold text-slate-800">Pembayaran Kadaluarsa</p>
        <p className="text-sm text-slate-500">
          Waktu pembayaran habis. Silakan buat booking baru.
        </p>
        <a href="/" className="mt-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover transition-colors">
          Kembali ke Beranda
        </a>
      </div>
    )
  }

  return (
    <>
      <Script
        src={SNAP_URL}
        data-client-key={clientKey}
        onLoad={() => setScriptReady(true)}
        strategy="afterInteractive"
      />

      <div className="flex flex-col items-center gap-5 py-8">
        {popupOpen || polling ? (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-600 font-medium">
              {popupOpen ? 'Menunggu pembayaran...' : 'Memverifikasi pembayaran...'}
            </p>
            <p className="text-slate-400 text-sm">
              {popupOpen
                ? 'Selesaikan pembayaran di jendela yang terbuka'
                : 'Jangan tutup halaman ini'}
            </p>
          </div>
        ) : (
          <>
            {errMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl max-w-sm w-full text-center">
                {errMsg}
              </div>
            )}
            <button
              onClick={openSnap}
              disabled={!scriptReady}
              className="bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3.5 rounded-xl
                         transition-colors shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {scriptReady ? 'Lanjutkan Pembayaran' : 'Memuat gateway...'}
            </button>
          </>
        )}
      </div>
    </>
  )
}
