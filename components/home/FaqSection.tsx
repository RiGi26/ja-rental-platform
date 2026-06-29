import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Bagaimana cara membayarnya?',
    a: 'Pembayaran dilakukan online lewat gateway tepercaya dengan beragam metode lokal — transfer bank, e-wallet, hingga kartu. Pesanan otomatis terkonfirmasi begitu pembayaran berhasil.',
  },
  {
    q: 'Apakah saya langsung dapat tiket?',
    a: 'Ya. E-ticket terbit otomatis ke email dan tersimpan di akun Anda segera setelah pembayaran selesai. Tidak perlu menunggu konfirmasi manual.',
  },
  {
    q: 'Bisakah memilih kursi sendiri untuk travel?',
    a: 'Bisa. Denah kursi ditampilkan realtime saat memesan, jadi Anda bisa memilih posisi favorit selama masih tersedia.',
  },
  {
    q: 'Untuk rental, apa bisa tanpa sopir?',
    a: 'Bisa. Tersedia opsi lepas kunci (tanpa sopir) maupun dengan driver profesional. Lengkapi dokumen verifikasi secara online sebelum pengambilan unit.',
  },
  {
    q: 'Bagaimana kalau perlu ubah atau batalkan pesanan?',
    a: 'Ketentuan perubahan dan pembatalan mengikuti kebijakan masing-masing armada/rute, dan ditampilkan jelas sebelum Anda membayar. Kelola pesanan langsung dari akun Anda.',
  },
]

export default function FaqSection() {
  return (
    <section className="bg-bg px-4 py-20 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Tanya jawab</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Hal yang sering ditanyakan
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-[16px] border border-slate-100 bg-white px-5 shadow-card open:shadow-panel"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-base font-bold text-slate-800 [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown
                  size={20}
                  className="shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="pb-5 pr-8 text-[15px] leading-relaxed text-slate-500">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
