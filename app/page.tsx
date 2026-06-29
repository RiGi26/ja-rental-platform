import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createCoreClient } from '@/lib/supabase/server'
import HeroSection from '@/components/home/HeroSection'
import StatsSection from '@/components/home/StatsSection'
import ServicesSection from '@/components/home/ServicesSection'
import HowItWorks from '@/components/home/HowItWorks'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import UseCases from '@/components/home/UseCases'
import FaqSection from '@/components/home/FaqSection'
import CtaSection from '@/components/home/CtaSection'
import SiteFooter from '@/components/home/SiteFooter'

export const metadata: Metadata = {
  title: 'JaMobility — Travel Antar Kota & Rental Mobil Terpercaya',
  description: 'Pesan tiket travel antar kota dan rental mobil premium secara online. Kursi realtime, e-ticket otomatis, tracking langsung.',
  openGraph: {
    title: 'JaMobility — Travel & Rental Mobil',
    description: 'Platform booking travel antar kota & rental mobil Webzoka Travel.',
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
      <ServicesSection />
      <HowItWorks />
      <WhyChooseUs />
      <UseCases />
      <FaqSection />
      <CtaSection />
      <SiteFooter />
    </main>
  )
}
