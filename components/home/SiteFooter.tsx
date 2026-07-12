import Link from 'next/link'
import { Bus } from 'lucide-react'

// Identitas tunggal: Webzoka Rental & Travel (sebelumnya campur "JaMobility" /
// "Webzoka Travel" / logo "J" dalam satu funnel).
const CORP_PRICING = 'https://japanarena.com/pricing?platform=rental'
const WA_HREF = 'https://wa.me/6281296917963?text=' + encodeURIComponent('Halo Webzoka, saya ingin tanya soal Portal Rental & Travel.')

const linkGroups = [
  {
    title: 'Portal',
    links: [
      { label: 'Coba demo', href: '/demo' },
      { label: 'Mulai trial 14 hari', href: '/register' },
      { label: 'Masuk portal', href: '/auth/login' },
    ],
  },
  {
    title: 'Webzoka',
    links: [
      { label: 'Harga & paket', href: CORP_PRICING },
      { label: 'Semua portal bisnis', href: 'https://japanarena.com' },
      { label: 'Chat tim kami', href: WA_HREF },
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
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Webzoka Rental &amp; Travel
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            Portal operasional untuk usaha rental mobil dan travel antar kota: armada, rute,
            jadwal, booking pelanggan, dan pembayaran dalam satu dashboard.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-16 gap-y-8">
          {linkGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">{group.title}</p>
              <ul className="space-y-2.5 text-sm">
                {group.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="inline-flex min-h-[44px] items-center transition-colors hover:text-white">
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
        <p>© {new Date().getFullYear()} Webzoka. Semua hak dilindungi.</p>
        <p>Bagian dari ekosistem portal bisnis Webzoka.</p>
      </div>
    </footer>
  )
}
