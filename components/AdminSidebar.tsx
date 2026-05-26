'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLayoutStore } from '@/store/useLayoutStore'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const menuItems = [
  { icon: '📊', label: 'Dashboard',        href: '/admin' },
  { icon: '🚐', label: 'Armada',           href: '/admin/fleet' },
  { icon: '📍', label: 'Live Tracking',    href: '/admin/tracking' },
  { icon: '🛣️', label: 'Rute Tetap',      href: '/admin/routes' },
  { icon: '👨‍✈️', label: 'Driver & Karyawan', href: '/admin/drivers' },
  { icon: '📅', label: 'Jadwal',           href: '/admin/schedules' },
  { icon: '📋', label: 'Booking',          href: '/admin/bookings' },
  { icon: '💳', label: 'Pembayaran',       href: '/admin/bookings?tab=payment' },
  { icon: '📈', label: 'Laporan',          href: '/admin/reports' },
  { icon: '🔧', label: 'Reminder Servis',  href: '/admin/fleet?tab=reminder' },
  { icon: '⚙️', label: 'Pengaturan',      href: '/admin/settings' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { isSidebarOpen, setSidebarOpen } = useLayoutStore()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function isActive(href: string) {
    const path = href.split('?')[0]
    if (path === '/admin') return pathname === '/admin'
    return pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-[280px] bg-white z-[60] flex flex-col
                    transition-transform duration-300 lg:translate-x-0
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ boxShadow: '4px 0 24px rgba(15,23,42,0.06)' }}
      >
        {/* Logo area */}
        <div className="px-6 pt-7 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-[52px] h-[52px] rounded-[16px] flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}
            >
              🚐
            </div>
            <div>
              <p className="font-display font-extrabold text-xl text-slate-900 leading-tight">
                JaTravel
              </p>
              <p
                className="text-[9px] font-bold tracking-[3px] uppercase"
                style={{ color: '#2563eb' }}
              >
                JAPANARA CORP
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-[18px] py-3.5 rounded-[18px] text-sm
                            font-semibold transition-all duration-200 group
                            ${active ? 'text-white shadow-md' : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'}`}
                style={active
                  ? { background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }
                  : {}}
              >
                <span className={`text-base leading-none ${active ? '' : 'grayscale group-hover:grayscale-0'}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-5 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between px-4 py-2">
            <div>
              <p className="text-xs font-bold text-slate-700">JapanarEna Corp</p>
              <p className="text-[10px] text-slate-400">Admin Panel</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs font-semibold text-red-500 hover:text-red-700
                         px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
