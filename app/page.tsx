import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createCoreClient } from '@/lib/supabase/server'
import HeroSection from '@/components/home/HeroSection'
import ServicesSection from '@/components/home/ServicesSection'
import HowItWorks from '@/components/home/HowItWorks'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import UseCases from '@/components/home/UseCases'
import FaqSection from '@/components/home/FaqSection'
import CtaSection from '@/components/home/CtaSection'
import SiteFooter from '@/components/home/SiteFooter'

// Landing root = etalase Portal Rental & Travel untuk PEMILIK USAHA. Alur booking
// pelanggan (/search, /booking, /tracking) tetap berjalan untuk tenant yang punya
// armada & jadwal sendiri — halaman ini bukan storefront tiket.
export const metadata: Metadata = {
  title: 'Portal Rental & Travel — Webzoka | Kelola armada, jadwal & booking',
  description:
    'Portal operasional untuk usaha rental mobil dan travel antar kota: armada, rute, jadwal, booking pelanggan, dan pembayaran dalam satu dashboard. Coba demo, trial 14 hari tanpa kartu kredit.',
  openGraph: {
    title: 'Portal Rental & Travel — Webzoka',
    description:
      'Armada, rute, jadwal, booking, dan pembayaran dalam satu dashboard. Demo terbuka tanpa daftar.',
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
      <ServicesSection />
      <WhyChooseUs />
      <HowItWorks />
      <UseCases />
      <FaqSection />
      <CtaSection />
      <SiteFooter />
    </main>
  )
}
