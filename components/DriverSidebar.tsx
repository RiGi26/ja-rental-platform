'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { label: 'Jadwal Hari Ini', href: '/driver', icon: '📅' },
  { label: 'Absensi', href: '/driver/attendance', icon: '✅' },
  { label: 'Laporan BBM', href: '/driver/fuel', icon: '⛽' },
  { label: 'Panic Button', href: '/driver/panic', icon: '🆘' },
]

export default function DriverSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-bg-card border-r border-slate-100 shadow-card z-40 flex flex-col">
      <div className="p-6 border-b border-slate-100">
        <p className="font-display font-bold text-primary text-lg">JA Travel</p>
        <p className="text-text-muted text-xs">Driver App</p>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {nav.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === item.href
                ? 'bg-primary/10 text-primary'
                : 'text-text-muted hover:bg-slate-50 hover:text-text'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
