import { Armchair, Ticket, Navigation, ShieldCheck, Car, Headphones } from 'lucide-react'

const features = [
  {
    icon: Armchair,
    title: 'Pilih kursi sendiri, realtime',
    desc: 'Denah kursi yang selalu sinkron — tidak ada lagi cerita kursi bentrok atau dobel booking. Pilih, kunci, beres.',
    big: true,
  },
  { icon: Ticket, title: 'E-ticket otomatis', desc: 'Terbit seketika setelah bayar, langsung ke email & akun.' },
  { icon: Navigation, title: 'Tracking langsung', desc: 'Pantau posisi armada menjelang keberangkatan.' },
  { icon: ShieldCheck, title: 'Pembayaran aman', desc: 'Gateway tepercaya, banyak metode bayar lokal.' },
  { icon: Car, title: 'Pilihan armada', desc: 'Travel antar kota sampai rental harian, satu tempat.' },
  { icon: Headphones, title: 'Dukungan 24/7', desc: 'Ada yang membantu kapan pun perjalanan butuh.' },
]

export default function WhyChooseUs() {
  return (
    <section
      className="px-4 py-20 md:py-24"
      style={{ background: 'linear-gradient(160deg, #0B1220 0%, #0F1B3D 100%)' }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-sky-300/80">Kenapa di sini</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            Dibangun supaya Anda tenang
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/65">
            Setiap detail dirancang untuk memangkas keraguan sebelum jalan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc, big }) => (
            <div
              key={title}
              className={`rounded-[20px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.07] ${
                big ? 'sm:col-span-2 lg:row-span-2 lg:flex lg:flex-col lg:justify-between' : ''
              }`}
            >
              <span
                className={`inline-flex items-center justify-center rounded-2xl bg-[#1A56DB]/20 text-sky-300 ${
                  big ? 'h-14 w-14' : 'h-11 w-11'
                }`}
              >
                <Icon size={big ? 26 : 20} aria-hidden />
              </span>
              <div className={big ? 'lg:mt-auto' : ''}>
                <h3 className={`mb-1.5 mt-4 font-display font-bold text-white ${big ? 'text-2xl' : 'text-base'}`}>
                  {title}
                </h3>
                <p className={`leading-relaxed text-white/60 ${big ? 'text-[15px] lg:max-w-md' : 'text-sm'}`}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
