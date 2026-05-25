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
