'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLayoutStore } from '@/store/useLayoutStore'
import { X, LayoutGrid } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  role?: 'admin' | 'owner'
}

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Booking', href: '/admin/bookings', icon: '📋' },
  { label: 'Rute & Jadwal', href: '/admin/routes', icon: '🗺️' },
  { label: 'Armada', href: '/admin/fleet', icon: '🚐' },
  { label: 'Driver', href: '/admin/drivers', icon: '👤' },
  { label: 'Rental', href: '/admin/rental', icon: '🚗' },
  { label: 'Live Tracking', href: '/admin/tracking', icon: '📍' },
]

const ownerNav = [
  { label: 'Dashboard', href: '/owner', icon: '📊' },
  { label: 'Laporan', href: '/owner/reports', icon: '📈' },
]

export default function AdminSidebar({ role = 'admin' }: Props) {
  const pathname = usePathname()
  const { isSidebarOpen, setSidebarOpen } = useLayoutStore()
  const nav = role === 'owner' ? ownerNav : adminNav

  return (
    <>
      {/* Backdrop (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-bg-card border-r border-slate-100 shadow-card z-[60] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="font-display font-bold text-primary text-lg">JA Travel</p>
            <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest">{role} panel</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {nav.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-text-muted hover:bg-slate-50 hover:text-text'
                }`}
              >
                <span className={active ? '' : 'grayscale'}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <Link
            href="https://ja-landingpage-platform.vercel.app"
            className="flex items-center gap-2.5 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
          >
            <LayoutGrid size={14} />
            Portal Utama
          </Link>
        </div>
      </aside>
    </>
  )
}

