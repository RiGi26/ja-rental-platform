'use client'
import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-xl font-display font-bold text-text mb-2">Terjadi Kesalahan</h1>
        <p className="text-text-muted text-sm mb-6">
          Maaf, terjadi masalah yang tidak terduga. Silakan coba lagi.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-800 overflow-auto max-h-48">
            <summary className="font-bold cursor-pointer mb-2">Error details (dev only)</summary>
            <p className="font-semibold">{error.message}</p>
            {error.digest && <p className="opacity-60 mt-1">digest: {error.digest}</p>}
            {error.stack && <pre className="mt-2 whitespace-pre-wrap opacity-70">{error.stack}</pre>}
          </details>
        )}
        <button
          onClick={reset}
          className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-hover transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  )
}
