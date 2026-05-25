'use client'
import { useRouter } from 'next/navigation'

interface Props {
  origin?: string
  destination?: string
}

export default function NoResults({ origin, destination }: Props) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {/* Ilustrasi */}
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mb-6 opacity-40">
        <rect x="10" y="40" width="100" height="55" rx="8" fill="#1A56DB" />
        <rect x="20" y="50" width="30" height="20" rx="4" fill="white" fillOpacity="0.6" />
        <rect x="60" y="50" width="30" height="20" rx="4" fill="white" fillOpacity="0.6" />
        <circle cx="30" cy="98" r="10" fill="#0F172A" />
        <circle cx="90" cy="98" r="10" fill="#0F172A" />
        <rect x="35" y="25" width="20" height="18" rx="3" fill="#1A56DB" />
        <rect x="65" y="25" width="20" height="18" rx="3" fill="#1A56DB" />
        {/* X mark */}
        <line x1="70" y1="5" x2="110" y2="35" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
        <line x1="110" y1="5" x2="70" y2="35" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
      </svg>

      <h2 className="text-xl font-display font-bold text-slate-700 mb-2">
        Tidak ada jadwal tersedia
      </h2>

      {origin && destination ? (
        <p className="text-slate-500 text-sm mb-1">
          Tidak ditemukan jadwal{' '}
          <span className="font-semibold">{origin} → {destination}</span>
        </p>
      ) : null}

      <p className="text-slate-400 text-sm mb-8">
        Coba ubah tanggal atau pilih rute yang berbeda.
      </p>

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors"
      >
        ← Ubah Pencarian
      </button>
    </div>
  )
}
