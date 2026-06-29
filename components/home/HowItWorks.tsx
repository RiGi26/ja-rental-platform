'use client'

import { useHomeStore } from '@/store/useHomeStore'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Armchair, Smartphone, CalendarDays, CreditCard, KeyRound, type LucideIcon } from 'lucide-react'

type Step = { step: string; icon: LucideIcon; title: string; desc: string }

const travelSteps: Step[] = [
  {
    step: '01',
    icon: MapPin,
    title: 'Pilih Rute Keberangkatan',
    desc: 'Masukkan titik asal dan tujuan. Temukan jadwal keberangkatan armada yang sesuai dengan agenda Anda.',
  },
  {
    step: '02',
    icon: Armchair,
    title: 'Amankan Kursi Favorit',
    desc: 'Pilih posisi tempat duduk secara visual. Selesaikan pembayaran dengan aman sebelum waktu habis.',
  },
  {
    step: '03',
    icon: Smartphone,
    title: 'Berangkat Lebih Tenang',
    desc: 'Anda menerima E-Ticket dan tautan untuk melacak posisi sopir secara real-time menjelang keberangkatan.',
  },
]

const rentalSteps: Step[] = [
  {
    step: '01',
    icon: CalendarDays,
    title: 'Tentukan Jadwal & Lokasi',
    desc: 'Pilih mobil sesuai kebutuhan, lengkapi dengan opsi "Lepas Kunci" atau tambahan Driver profesional.',
  },
  {
    step: '02',
    icon: CreditCard,
    title: 'Verifikasi & Bayar',
    desc: 'Lengkapi dokumen secara online. Selesaikan pembayaran dengan aman melalui beragam metode bayar lokal.',
  },
  {
    step: '03',
    icon: KeyRound,
    title: 'Ambil Kunci & Jalan',
    desc: 'Tunjukkan E-Ticket di lokasi penjemputan atau bandara. Armada Anda sudah siap dan telah dibersihkan.',
  },
]

export default function HowItWorks() {
  const { searchMode } = useHomeStore()
  const steps = searchMode === 'travel' ? travelSteps : rentalSteps
  const title = searchMode === 'travel' ? 'Cara Pesan Travel' : 'Cara Sewa Mobil'

  return (
    <section className="bg-bg px-4 py-20 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Alurnya simpel</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h2
              key={title}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl"
            >
              {title}
            </motion.h2>
          </AnimatePresence>
          <p className="mt-4 text-slate-500">Tiga langkah, selesai dalam hitungan menit.</p>
        </div>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Connector line (desktop) */}
          <div className="absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-[#1A56DB]/10 via-[#1A56DB]/50 to-[#1A56DB]/10 md:block" />

          <AnimatePresence mode="wait" initial={false}>
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="relative mb-5">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-slate-100 bg-white text-[#1A56DB] shadow-card">
                      <Icon size={30} aria-hidden />
                    </div>
                    <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#1A56DB] text-xs font-bold text-white shadow">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="mb-2 font-display text-lg font-bold text-slate-800">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{step.desc}</p>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
