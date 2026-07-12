import Link from 'next/link'
import { Bus, Car, CheckCircle2, ArrowRight } from 'lucide-react'

// Dua model usaha yang ditopang portal ini. Poin-poin di bawah hanya menyebut yang
// benar-benar ada di sistem (armada, rute/jadwal + kursi, rental harian, pembayaran).
const services = [
  {
    icon: Bus,
    tag: 'Travel & Shuttle',
    title: 'Rute, jadwal, dan kursi terkelola',
    desc: 'Atur rute keberangkatan dan jadwal armada. Kursi berkurang otomatis saat pelanggan memesan — tidak ada lagi dobel booking karena catatan terlambat diperbarui.',
    points: ['Rute & jadwal keberangkatan', 'Kapasitas + kursi tersisa otomatis', 'Titik jemput & kelas layanan'],
    accent: 'text-[#1A56DB]',
    badge: 'bg-blue-50 text-[#1A56DB]',
    glow: 'from-[#1A56DB]/[0.07]',
  },
  {
    icon: Car,
    tag: 'Rental Mobil Harian',
    title: 'Unit, tarif, dan dokumen rapi',
    desc: 'Catat tiap unit lengkap dengan foto, tarif harian, transmisi, dan kapasitas. Masa berlaku STNK, KIR, pajak, sampai jadwal servis tersimpan di kartu unitnya.',
    points: ['Foto & tarif harian per unit', 'Status unit: tersedia / disewa', 'Catatan STNK, KIR, pajak, servis'],
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
            Dua model usaha
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Travel antar kota, rental harian, atau keduanya
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500">
            Portalnya sama — kamu tinggal pakai bagian yang dibutuhkan usahamu.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {services.map(({ icon: Icon, tag, title, desc, points, accent, badge, glow }) => (
            <div
              key={tag}
              className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-panel"
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
                href="/demo"
                className={`relative inline-flex min-h-[44px] items-center gap-2 text-sm font-bold ${accent} transition-all hover:gap-3`}
              >
                Lihat di demo portal
                <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
