'use client'

import { Menu, Bell, HelpCircle } from 'lucide-react'
import { useLayoutStore } from '@/store/useLayoutStore'

interface Props {
  userName?: string
}

export default function TopBar({ userName = 'Admin' }: Props) {
  const { toggleSidebar } = useLayoutStore()

  // Jam dihitung di zona Jakarta, bukan zona mesin. Render server berjalan di UTC
  // sementara browser pengguna di WIB, jadi `new Date().getHours()` menghasilkan dua
  // sapaan berbeda untuk render yang sama → hydration mismatch (React #418) dan
  // sapaan yang sempat salah sekejap sebelum diperbaiki klien.
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone : 'Asia/Jakarta',
      hour     : 'numeric',
      hourCycle: 'h23',
    }).format(new Date()),
  )
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam'
  const initials = userName.slice(0, 2).toUpperCase()

  return (
    <header
      className="h-16 bg-white border-b border-slate-100 flex items-center
                 justify-between px-4 md:px-6 sticky top-0 z-30"
      style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.04)' }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Buka menu"
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu size={22} />
        </button>
        <div className="hidden sm:block">
          <p className="font-semibold text-slate-800 text-sm">
            {greeting}, {userName}!
          </p>
          <p className="text-slate-500 text-xs">Admin Panel · JaMobility</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Help — replay the onboarding tour anytime (OnboardingLauncher listens) */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('onboarding:replay-tour'))}
          data-coach="help-button"
          aria-label="Panduan — putar ulang tur"
          title="Panduan portal"
          className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <HelpCircle size={19} />
        </button>
        <button aria-label="Notifikasi" className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <Bell size={19} />
        </button>
        <div
          className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1A56DB, #3b82f6)' }}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
