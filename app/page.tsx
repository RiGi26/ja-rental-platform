import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createCoreClient } from '@/lib/supabase/server'
import HeroSection from '@/components/home/HeroSection'
import StatsSection from '@/components/home/StatsSection'
import HowItWorks from '@/components/home/HowItWorks'

export const metadata: Metadata = {
  title: 'JaTravel — Travel Antar Kota & Rental Mobil Terpercaya',
  description: 'Pesan tiket travel antar kota dan rental mobil premium secara online. Kursi realtime, e-ticket otomatis, tracking langsung.',
  openGraph: {
    title: 'JaTravel — Travel & Rental Mobil',
    description: 'Platform booking travel antar kota & rental mobil JapanArena Corp.',
    type: 'website',
  },
}

export default async function HomePage() {
  // Smart UX Redirect: Jika user sudah login sebagai portal user, langsung lempar ke dashboard
  const supabase = await createCoreClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const role = user.app_metadata?.role as string
    if (role === 'admin') redirect('/admin')
    if (role === 'owner') redirect('/owner')
    if (role === 'driver') redirect('/driver')
    // Customer tetap di landing page (default behavior)
  }

  return (
    <main>
      <HeroSection />
      <StatsSection />
      <HowItWorks />

      {/* CTA Bottom */}
      <section className="bg-primary py-20 px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
          Pesan Sekarang, Jalan Lebih Tenang
        </h2>
        <p className="text-white/80 mb-10 text-lg max-w-2xl mx-auto">
          Dapatkan konfirmasi instan dan pilih kursi favorit Anda. Tidak perlu lagi menunggu konfirmasi manual atau khawatir kursi penuh.
        </p>
        <a
          href="#hero"
          className="inline-flex items-center gap-2 bg-white text-primary font-bold px-10 py-4 rounded-xl hover:bg-slate-50 transition-colors shadow-glow"
        >
          Lihat Jadwal Tersedia →
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-14 px-4 border-t border-slate-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 text-sm">
          <div className="max-w-sm">
            <p className="text-white font-display font-bold text-xl mb-2 tracking-tight">JaTravel <span className="text-primary text-sm align-top">PRO</span></p>
            <p className="leading-relaxed">
              Infrastruktur reservasi travel dan rental mobil digital persembahan <span className="text-white font-medium">JapanArena Corp</span>. Solusi operasional transportasi dengan standar efisiensi global.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 font-medium">
            <a href="/auth/login" className="hover:text-white transition-colors">Client Portal</a>
            <a href="/register" className="hover:text-white transition-colors">Corporate Registration</a>
            <a href="/search" className="hover:text-white transition-colors">Fleet Availability</a>
          </div>
          <div className="md:text-right">
            <p className="text-xs text-slate-500">© 2026 JapanArena Corp.</p>
            <p className="text-xs text-slate-500 mt-1">All rights reserved worldwide.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
