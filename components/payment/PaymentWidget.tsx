'use client'
import { useState, useEffect } from 'react'
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

export default function PaymentWidget({ snapToken, clientKey, bookingCode }: Props) {
  const router = useRouter()
  const [scriptReady, setScriptReady] = useState(false)
  const [popupOpen,   setPopupOpen]   = useState(false)
  const [errMsg,      setErrMsg]      = useState<string | null>(null)

  function openSnap() {
    if (!window.snap) return
    setPopupOpen(true)
    setErrMsg(null)
    window.snap.pay(snapToken, {
      onSuccess: () => {
        setPopupOpen(false)
        router.push(`/booking/confirm/${bookingCode}`)
      },
      onPending: () => {
        setPopupOpen(false)
        setErrMsg('Pembayaran sedang diproses. Cek kembali status booking Anda.')
      },
      onError: () => {
        setPopupOpen(false)
        setErrMsg('Pembayaran gagal. Silakan coba lagi.')
      },
      onClose: () => {
        setPopupOpen(false)
      },
    })
  }

  useEffect(() => {
    if (scriptReady) openSnap()
  }, [scriptReady]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Script
        src={SNAP_URL}
        data-client-key={clientKey}
        onLoad={() => setScriptReady(true)}
        strategy="afterInteractive"
      />

      <div className="flex flex-col items-center gap-5 py-8">
        {popupOpen ? (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-600 font-medium">Menunggu pembayaran...</p>
            <p className="text-slate-400 text-sm">
              Selesaikan pembayaran di jendela yang terbuka
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
