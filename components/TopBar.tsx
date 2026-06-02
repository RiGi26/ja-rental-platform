'use client'

import { Menu, Bell } from 'lucide-react'
import { useLayoutStore } from '@/store/useLayoutStore'

interface Props {
  userName?: string
}

export default function TopBar({ userName = 'Admin' }: Props) {
  const { toggleSidebar } = useLayoutStore()

  const hour     = new Date().getHours()
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
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu size={22} />
        </button>
        <div className="hidden sm:block">
          <p className="font-semibold text-slate-800 text-sm">
            {greeting}, {userName}!
          </p>
          <p className="text-slate-400 text-xs">Admin Panel · JaMobility</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <Bell size={19} />
        </button>
        <div
          className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
