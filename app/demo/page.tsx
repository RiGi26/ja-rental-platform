'use client'

/**
 * /demo — halaman pilih-role demo Portal Travel & Rental.
 *
 * Menyamakan pengalaman demo dengan portal lain (LMS/Klinik dst) yang punya
 * halaman pilih-role. Memakai ulang endpoint statis yang sudah ada:
 *   POST /api/auth/demo-login  { role: 'admin' | 'driver' }  -> { redirectTo }
 * Akun demo statis (admin@demo.com / driver@demo.com) sudah ada di Core DB.
 *
 * Token visual mengikuti komponen login seragam repo ini
 * (components/auth/PortalLoginCard.tsx): #0071E3, rounded-[28px]/[24px],
 * /logo-rocket.png, bg-[#F5F5F7] — BUKAN utilitas khas repo lain
 * (apple-shadow/sf-display-heavy tidak tersedia di sini).
 */

import { useState } from 'react'
import { Loader2, LayoutDashboard, Bus, ArrowRight } from 'lucide-react'

const WA_HREF = 'https://wa.me/6281296917963'

const ROLES = [
  {
    key        : 'admin',
    role       : 'admin',
    label      : 'Admin Rental',
    Icon       : LayoutDashboard,
    description: 'Kelola armada, booking & jadwal, pembayaran, dan laporan operasional.',
    iconBg     : 'bg-blue-50',
    iconColor  : 'text-blue-600',
    pill       : 'bg-blue-50 text-blue-600 border-blue-100',
    redirect   : '/admin',
  },
  {
    key        : 'driver',
    role       : 'driver',
    label      : 'Supir / Driver',
    Icon       : Bus,
    description: 'Lihat tugas antar-jemput, status perjalanan, dan jadwal harian.',
    iconBg     : 'bg-sky-50',
    iconColor  : 'text-sky-600',
    pill       : 'bg-sky-50 text-sky-600 border-sky-100',
    redirect   : '/driver',
  },
] as const

type RoleKey = typeof ROLES[number]['key']

export default function DemoHubPage() {
  const [loading, setLoading] = useState<RoleKey | null>(null)
  const [error,   setError]   = useState('')

  async function handleSelect(role: typeof ROLES[number]) {
    setLoading(role.key)
    setError('')
    try {
      const res = await fetch('/api/auth/demo-login', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ role: role.role }),
      })
      const data = await res.json() as { success?: boolean; redirectTo?: string; error?: string }
      if (res.ok && data.success !== false) {
        window.location.href = data.redirectTo ?? role.redirect
      } else {
        setError(data.error ?? 'Gagal menyiapkan demo. Coba lagi.')
        setLoading(null)
      }
    } catch {
      setError('Koneksi gagal. Coba lagi.')
      setLoading(null)
    }
  }

  const isDisabled = loading !== null

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decor — selaras PortalLoginCard */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl -mr-64 -mt-64 opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-100/30 rounded-full blur-3xl -ml-32 -mb-32 opacity-40 pointer-events-none" />

      <div className="w-full max-w-[480px] relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10 flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-rocket.png" alt="Logo Webzoka" className="h-16 w-16 object-contain" />
          <div className="text-center mt-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 leading-none">Webzoka</h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">Rent Portal</p>
          </div>
          <p className="text-[12px] font-bold text-green-600 uppercase tracking-widest flex items-center justify-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Mode Demo Aktif
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mt-1">Pilih Role Preview</h2>
          <p className="text-gray-500 text-sm mt-1">Eksplorasi setiap peran tanpa perlu membuat akun.</p>
        </div>

        {/* Role Cards */}
        <div className="flex flex-col gap-4">
          {ROLES.map((role) => {
            const isLoading = loading === role.key
            return (
              <button
                key={role.key}
                onClick={() => handleSelect(role)}
                disabled={isDisabled}
                className={`group relative text-left bg-white rounded-[24px] p-6 border shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-200
                  ${isDisabled ? 'opacity-60 cursor-not-allowed border-black/[0.03]' : 'hover:scale-[1.02] cursor-pointer border-black/[0.03]'}
                  ${isLoading ? 'ring-2 ring-[#0071E3]/30' : ''}
                `}
              >
                <div className="flex items-start gap-5">
                  <div className={`w-12 h-12 rounded-2xl ${role.iconBg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                    <role.Icon size={22} className={role.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-[18px] text-gray-900 mb-1">{role.label}</p>
                    <p className="text-[13px] text-gray-500 leading-relaxed mb-4">{role.description}</p>
                    <div className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full border ${role.pill}`}>
                      {isLoading ? (
                        <><Loader2 size={12} className="animate-spin" /> Menyiapkan...</>
                      ) : (
                        <>Preview sebagai {role.label} <ArrowRight size={12} /></>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {error && (
          <div role="alert" aria-live="polite" className="mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-medium text-center">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Sudah punya akun?{' '}
            <a href="/auth/login" className="font-bold text-[#0071E3] hover:text-blue-700 transition-colors">Masuk →</a>
          </p>
          <p className="text-sm text-gray-500">
            Butuh bantuan?{' '}
            <a href={WA_HREF} target="_blank" rel="noopener noreferrer" className="font-bold text-[#0071E3] hover:underline">
              Chat Admin WA 💬
            </a>
          </p>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-4">
            © {new Date().getFullYear()} Webzoka · Webzoka Rental
          </p>
        </div>
      </div>
    </div>
  )
}
