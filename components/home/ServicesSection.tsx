import Link from 'next/link'
import { Bus, Car, CheckCircle2, ArrowRight } from 'lucide-react'

const services = [
  {
    icon: Bus,
    tag: 'Travel Antar Kota',
    title: 'Berangkat terjadwal, kursi pasti',
    desc: 'Pesan tiket travel antar kota dengan jadwal jelas. Pilih kursi sendiri, terima e-ticket, dan pantau armada menjelang berangkat.',
    points: ['Jadwal & rute realtime', 'Pilih kursi visual', 'E-ticket + tracking driver'],
    href: '/search?mode=travel',
    cta: 'Cari jadwal travel',
    accent: 'text-[#1A56DB]',
    badge: 'bg-blue-50 text-[#1A56DB]',
    glow: 'from-[#1A56DB]/[0.07]',
  },
  {
    icon: Car,
    tag: 'Rental Mobil',
    title: 'Mobil siap, tinggal jalan',
    desc: 'Sewa mobil harian dengan opsi lepas kunci atau dengan sopir. Unit bersih dan terverifikasi, dokumen beres secara online.',
    points: ['Lepas kunci atau dengan sopir', 'Verifikasi & bayar online', 'Ambil di lokasi atau bandara'],
    href: '/search?mode=rental',
    cta: 'Cari mobil sewa',
    accent: 'text-[#0EA5E9]',
    badge: 'bg-sky-50 text-[#0EA5E9]',
    glow: 'from-[#0EA5E9]/[0.07]',
  },
]

export default function ServicesSection() {
  return (
    <section className="bg-white px-4 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            Dua layanan
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Satu platform untuk dua kebutuhan jalan
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500">
            Mau ke luar kota atau butuh mobil sendiri — semuanya dalam satu pencarian.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {services.map(({ icon: Icon, tag, title, desc, points, href, cta, accent, badge, glow }) => (
            <div
              key={tag}
              className={`group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-panel`}
            >
              <div
                className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${glow} to-transparent`}
                aria-hidden
              />
              <span className={`relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${badge}`}>
                <Icon size={26} aria-hidden />
              </span>
              <p className={`relative mb-1 text-xs font-bold uppercase tracking-wider ${accent}`}>{tag}</p>
              <h3 className="relative mb-3 font-display text-2xl font-bold text-slate-900">{title}</h3>
              <p className="relative mb-6 text-[15px] leading-relaxed text-slate-500">{desc}</p>

              <ul className="relative mb-7 space-y-3">
                {points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle2 size={18} className={accent} aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>

              <Link
                href={href}
                className={`relative inline-flex items-center gap-2 text-sm font-bold ${accent} transition-all hover:gap-3`}
              >
                {cta}
                <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
