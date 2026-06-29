import Link from 'next/link'
import { Bus } from 'lucide-react'

const linkGroups = [
  {
    title: 'Layanan',
    links: [
      { label: 'Cari travel', href: '/search?mode=travel' },
      { label: 'Sewa mobil', href: '/search?mode=rental' },
      { label: 'Lacak pesanan', href: '/account/bookings' },
    ],
  },
  {
    title: 'Akun',
    links: [
      { label: 'Masuk', href: '/auth/login' },
      { label: 'Daftar', href: '/auth/register' },
      { label: 'Akun saya', href: '/account' },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 px-4 py-14 text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A56DB] text-white">
              <Bus size={18} aria-hidden />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-white">JaMobility</span>
          </div>
          <p className="text-sm leading-relaxed">
            Platform reservasi travel antar kota dan rental mobil dari{' '}
            <span className="font-medium text-white">Webzoka Travel</span>. Pesan kursi, sewa mobil,
            dan kelola perjalanan dalam satu tempat.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-16 gap-y-8">
          {linkGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">{group.title}</p>
              <ul className="space-y-2.5 text-sm">
                {group.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-start justify-between gap-2 border-t border-slate-900 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
        <p>© 2026 Webzoka Travel. Semua hak dilindungi.</p>
        <p>Dibuat untuk perjalanan yang lebih tenang.</p>
      </div>
    </footer>
  )
}
