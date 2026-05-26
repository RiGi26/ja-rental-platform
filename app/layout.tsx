import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans, Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";
import Header from '@/components/layout/Header'
import { Toaster } from '@/components/ui/sonner'

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
  title: {
    default: 'JaTravel — Travel & Rental Mobil',
    template: '%s | JaTravel',
  },
  description: 'Platform booking travel antar kota & rental mobil premium JapanArena Corp.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={cn("h-full", "antialiased", inter.variable, plusJakartaSans.variable, "font-sans", geist.variable)}>
      <body className="min-h-full bg-bg text-text font-sans">
        <Header />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
