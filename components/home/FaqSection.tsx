import { ChevronDown } from 'lucide-react'

const WA_HREF = 'https://wa.me/6281296917963?text=' + encodeURIComponent('Halo Webzoka, saya ingin tanya soal Portal Rental & Travel.')

// FAQ untuk calon pengguna portal (pemilik usaha). Jawaban hanya menyebut yang
// benar-benar berlaku — kalau belum ada, jangan dijanjikan di sini.
const faqs = [
  {
    q: 'Bisa coba dulu tanpa daftar?',
    a: 'Bisa. Buka Demo Portal — kamu masuk sebagai admin dengan data contoh, bebas klik-klik semua menunya. Tidak perlu email, tidak perlu kartu kredit.',
  },
  {
    q: 'Berapa lama sampai portal saya siap dipakai?',
    a: 'Begitu daftar, portal langsung aktif dengan trial 14 hari. Waktu terlama justru mengisi data armada dan tarif — dan itu bisa dicicil.',
  },
  {
    q: 'Pelanggan saya memesan lewat mana?',
    a: 'Lewat halaman pemesanan online milik usahamu: pelanggan memilih jadwal atau unit, lalu membayar. Pesanan langsung tercatat di dashboard beserta kode booking-nya.',
  },
  {
    q: 'Pembayaran diproses lewat apa?',
    a: 'Lewat Midtrans — transfer bank, e-wallet, dan kartu. Status pembayaran masuk otomatis ke pesanan, jadi tidak perlu cek mutasi satu per satu.',
  },
  {
    q: 'Saya cuma rental harian, tidak punya rute travel. Tetap cocok?',
    a: 'Cocok. Bagian rute dan jadwal boleh dibiarkan kosong — pakai saja modul armada, tarif harian, dan booking. Sebaliknya juga berlaku untuk travel yang tidak menyewakan unit harian.',
  },
  {
    q: 'Berapa harga langganannya?',
    a: 'Ada beberapa paket, dan trial 14 hari berlaku tanpa kartu kredit. Rincian harga per paket ada di halaman harga Webzoka — atau tanya langsung ke tim kami.',
  },
]

export default function FaqSection() {
  return (
    <section className="bg-bg px-4 py-20 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Tanya jawab</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Hal yang sering ditanyakan pemilik usaha
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

        <p className="mt-8 text-center text-sm text-slate-500">
          Pertanyaan lain?{' '}
          <a
            href={WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#1A56DB] hover:underline"
          >
            Chat tim kami
          </a>
        </p>
      </div>
    </section>
  )
}
