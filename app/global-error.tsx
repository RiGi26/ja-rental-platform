'use client'

import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="id">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Terjadi Kesalahan</h1>
          <p className="text-slate-500 text-sm mb-6">
            Maaf, terjadi masalah yang tidak terduga. Silakan coba lagi.
          </p>
          <button
            onClick={reset}
            className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  )
}
