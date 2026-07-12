import { Car, Bus, Plane, Users } from 'lucide-react'

// "Cocok untuk" versi pemilik usaha — bukan alasan orang bepergian.
const cases = [
  {
    icon: Car,
    title: 'Rental mobil harian',
    desc: 'Unit lepas kunci maupun dengan sopir. Tarif per hari, status unit, dan dokumen kendaraan terpantau.',
  },
  {
    icon: Bus,
    title: 'Travel & shuttle antar kota',
    desc: 'Rute tetap dengan jadwal berangkat. Kursi terisi otomatis dari pemesanan online.',
  },
  {
    icon: Plane,
    title: 'Antar-jemput bandara',
    desc: 'Jadwal penjemputan dengan titik jemput jelas, kode booking dipegang penumpang.',
  },
  {
    icon: Users,
    title: 'Sewa dengan sopir untuk acara',
    desc: 'Rombongan, kantor, atau acara keluarga — unit dan supir ditugaskan dari dashboard.',
  },
]

export default function UseCases() {
  return (
    <section className="bg-white px-4 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Cocok untuk</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Usaha yang armadanya mulai susah dicatat manual
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500">
            Mulai dari beberapa unit sampai puluhan — portalnya tetap satu.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cases.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-[20px] border border-slate-100 bg-bg p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-card"
            >
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1A56DB]">
                <Icon size={20} aria-hidden />
              </span>
              <h3 className="mb-1.5 font-display text-base font-bold text-slate-800">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
