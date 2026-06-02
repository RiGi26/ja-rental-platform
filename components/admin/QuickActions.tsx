import Link from 'next/link'

const actions = [
  { label: '+ Booking Baru',  color: 'blue',   href: '/admin/bookings' },
  { label: 'Input Armada',    color: 'purple',  href: '/admin/fleet' },
  { label: 'Kelola Jadwal',   color: 'green',   href: '/admin/schedules' },
  { label: 'Monitoring GPS',  color: 'orange',  href: '/admin/tracking' },
  { label: 'Kirim Invoice',   color: 'blue',    href: '/admin/bookings?tab=invoice' },
  { label: 'Lihat Laporan',   color: 'green',   href: '/admin/reports' },
] as const

type Color = 'blue' | 'purple' | 'green' | 'orange'

const colorMap: Record<Color, { bg: string; text: string; hover: string }> = {
  blue:   { bg: '#eff6ff', text: '#2563eb', hover: '#dbeafe' },
  purple: { bg: '#faf5ff', text: '#7c3aed', hover: '#ede9fe' },
  green:  { bg: '#f0fdf4', text: '#16a34a', hover: '#dcfce7' },
  orange: { bg: '#fff7ed', text: '#ea580c', hover: '#ffedd5' },
}

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3.5">
      {actions.map(a => {
        const { bg, text } = colorMap[a.color as Color]
        return (
          <Link
            key={a.label}
            href={a.href}
            className="flex items-center justify-center text-center text-sm font-bold
                       py-[18px] px-4 transition-all duration-200 hover:-translate-y-0.5
                       active:scale-[0.96] shadow-sm hover:shadow-md"
            style={{ background: bg, color: text, borderRadius: 12 }}
          >
            {a.label}
          </Link>
        )
      })}
    </div>
  )
}
