import type { Metadata } from 'next'
import HeroSection from '@/components/home/HeroSection'
import StatsSection from '@/components/home/StatsSection'
import HowItWorks from '@/components/home/HowItWorks'

export const metadata: Metadata = {
  title: 'JaTravel — Travel Antar Kota & Rental Mobil Terpercaya',
  description: 'Pesan tiket travel antar kota dan rental mobil premium secara online. Kursi realtime, e-ticket otomatis, tracking langsung.',
  openGraph: {
    title: 'JaTravel — Travel & Rental Mobil',
    description: 'Platform booking travel antar kota & rental mobil JapanarEna Corp.',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      <HowItWorks />

      {/* CTA Bottom */}
      <section className="bg-primary py-16 px-4 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
          Siap Berangkat?
        </h2>
        <p className="text-white/75 mb-8 text-base">
          Gabung dengan 10.000+ penumpang yang sudah mempercayai JaTravel.
        </p>
        <a
          href="#hero"
          className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-pill hover:bg-slate-100 transition-colors shadow-glow"
        >
          Pesan Sekarang →
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div>
            <p className="text-white font-bold text-base mb-1">JaTravel</p>
            <p>Platform travel antar kota &amp; rental mobil JapanarEna Corp.</p>
          </div>
          <div className="flex gap-6">
            <a href="/auth/login" className="hover:text-white transition-colors">Masuk</a>
            <a href="/register" className="hover:text-white transition-colors">Daftar</a>
            <a href="/search" className="hover:text-white transition-colors">Cari Tiket</a>
          </div>
          <p className="text-xs">© 2026 JapanarEna Corp. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
