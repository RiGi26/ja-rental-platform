import { UserPlus, Car, CalendarClock, type LucideIcon } from 'lucide-react'

type Step = { step: string; icon: LucideIcon; title: string; desc: string }

// Alur dari sisi PEMILIK USAHA (bukan penumpang). Tanpa toggle travel/rental —
// langkahnya sama untuk keduanya.
const steps: Step[] = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Daftar & buka portal',
    desc: 'Buat akun bisnis, portal langsung aktif dengan trial 14 hari. Tidak ada instalasi, tidak ada biaya setup.',
  },
  {
    step: '02',
    icon: Car,
    title: 'Isi armada & tarif',
    desc: 'Masukkan unit beserta foto dan tarif harian, atau buat rute dan jadwal keberangkatan lengkap dengan kapasitas kursi.',
  },
  {
    step: '03',
    icon: CalendarClock,
    title: 'Terima booking & pembayaran',
    desc: 'Pelanggan memesan online, pesanan masuk ke dashboard, pembayaran diproses lewat Midtrans, kode booking terbit otomatis.',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-bg px-4 py-20 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Cara mulainya</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Dari daftar sampai booking pertama
          </h2>
          <p className="mt-4 text-slate-500">Tiga langkah — bisa selesai hari ini juga.</p>
        </div>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Connector line (desktop) */}
          <div className="absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-[#1A56DB]/10 via-[#1A56DB]/50 to-[#1A56DB]/10 md:block" />

          {steps.map(({ step, icon: Icon, title, desc }) => (
            <div key={title} className="relative flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-slate-100 bg-white text-[#1A56DB] shadow-card">
                  <Icon size={30} aria-hidden />
                </div>
                <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#1A56DB] text-xs font-bold text-white shadow">
                  {step}
                </span>
              </div>
              <h3 className="mb-2 font-display text-lg font-bold text-slate-800">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
