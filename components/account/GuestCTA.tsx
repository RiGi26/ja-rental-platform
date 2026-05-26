'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  bookingCode: string
}

export default function GuestCTA({ bookingCode }: Props) {
  const router = useRouter()

  function handleRegister() {
    sessionStorage.setItem('ja-pending-booking', bookingCode)
    router.push('/auth/register')
  }

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
      <h3 className="font-display font-bold text-slate-800 mb-1">
        Simpan tiket &amp; pantau perjalanan
      </h3>
      <p className="text-slate-500 text-sm mb-3">Daftar gratis untuk:</p>
      <ul className="text-sm text-slate-600 space-y-1 mb-4">
        <li className="flex items-center gap-2">
          <span className="text-green-500 font-bold">✓</span> Simpan semua histori booking
        </li>
        <li className="flex items-center gap-2">
          <span className="text-green-500 font-bold">✓</span> Tracking perjalanan realtime
        </li>
        <li className="flex items-center gap-2">
          <span className="text-green-500 font-bold">✓</span> Download tiket kapan saja
        </li>
      </ul>
      <div className="flex gap-3">
        <button
          onClick={handleRegister}
          className="flex-1 text-center text-sm font-bold bg-primary text-white
                     hover:bg-primary-hover px-4 py-2.5 rounded-xl transition-colors"
        >
          Daftar Gratis
        </button>
        <Link
          href={`/auth/login?next=/booking/confirm/${bookingCode}`}
          className="flex-1 text-center text-sm font-semibold text-primary bg-white border
                     border-primary/30 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors"
        >
          Masuk
        </Link>
      </div>
    </div>
  )
}
