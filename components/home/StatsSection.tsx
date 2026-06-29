import { Ticket, Armchair, Navigation, ShieldCheck } from 'lucide-react'

const items = [
  {
    icon: Ticket,
    title: 'E-Ticket Otomatis',
    desc: 'Bukti perjalanan langsung terbit ke email & dashboard begitu pembayaran selesai.',
  },
  {
    icon: Armchair,
    title: 'Pilih Kursi Realtime',
    desc: 'Lihat kursi yang tersisa secara langsung dan amankan posisi favorit Anda.',
  },
  {
    icon: Navigation,
    title: 'Tracking Langsung',
    desc: 'Pantau posisi armada menjelang keberangkatan, tanpa perlu menelepon agen.',
  },
  {
    icon: ShieldCheck,
    title: 'Pembayaran Aman',
    desc: 'Transaksi terenkripsi lewat gateway tepercaya dengan beragam metode lokal.',
  },
]

export default function StatsSection() {
  return (
    <section className="bg-bg px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-[20px] border border-slate-100 bg-white p-6 shadow-card transition-shadow duration-300 hover:shadow-panel"
            >
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1A56DB] transition-colors group-hover:bg-[#1A56DB] group-hover:text-white">
                <Icon size={22} aria-hidden />
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
