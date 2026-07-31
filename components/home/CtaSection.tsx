import Link from 'next/link'
import { ArrowRight, PlayCircle } from 'lucide-react'

export default function CtaSection() {
  return (
    <section className="px-4 py-20 md:py-24" style={{ background: 'linear-gradient(135deg, #1A56DB 0%, #1447C0 100%)' }}>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
          Lihat dulu portalnya, baru putuskan.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/80">
          Demo terbuka tanpa daftar. Kalau cocok, mulai trial 14 hari — tanpa kartu kredit,
          tanpa biaya setup.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href="/demo"
            className="glow-btn inline-flex items-center justify-center gap-2 rounded-full bg-white px-9 py-3.5 font-bold text-[#1A56DB] transition-colors hover:bg-slate-50 active:scale-[0.97]"
          >
            <PlayCircle size={18} aria-hidden />
            Coba Demo Portal
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-9 py-3.5 font-bold text-white transition-colors hover:bg-white/10 active:scale-[0.97]"
          >
            Mulai Trial 14 Hari
            <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
        <p className="mt-6 text-sm font-medium text-white/70">
          Sudah punya portal?{' '}
          <Link href="/auth/login" className="font-bold text-white hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </section>
  )
}
