import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CtaSection() {
  return (
    <section className="px-4 py-20 md:py-24" style={{ background: 'linear-gradient(135deg, #1A56DB 0%, #1447C0 100%)' }}>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
          Siap jalan? Mulai dari pencarian.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/80">
          Cek jadwal travel atau mobil yang tersedia sekarang. Konfirmasi instan, tanpa antre,
          tanpa menunggu balasan manual.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/search"
            className="glow-btn inline-flex items-center justify-center gap-2 rounded-full bg-white px-9 py-3.5 font-bold text-[#1A56DB] transition-colors hover:bg-slate-50 active:scale-[0.97]"
          >
            Lihat jadwal tersedia
            <ArrowRight size={18} aria-hidden />
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-full border border-white/30 px-9 py-3.5 font-bold text-white transition-colors hover:bg-white/10 active:scale-[0.97]"
          >
            Buat akun
          </Link>
        </div>
      </div>
    </section>
  )
}
