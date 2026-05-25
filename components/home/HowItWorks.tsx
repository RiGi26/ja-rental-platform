'use client'

import { useHomeStore } from '@/store/useHomeStore'
import { motion, AnimatePresence } from 'framer-motion'

const travelSteps = [
  {
    step: '01',
    icon: '🔍',
    title: 'Cari Jadwal Travel',
    desc: 'Masukkan kota asal, tujuan, tanggal, dan jumlah penumpang. Kami tampilkan jadwal realtime dengan armada terbaik.',
  },
  {
    step: '02',
    icon: '💺',
    title: 'Pilih Kursi & Bayar',
    desc: 'Pilih kursi favoritmu secara visual. Bayar via QRIS, Virtual Account, atau e-wallet dalam hitungan detik.',
  },
  {
    step: '03',
    icon: '🎫',
    title: 'E-Ticket Langsung',
    desc: 'E-ticket dan link live tracking supir dikirim otomatis ke WA & email. Tinggal tunggu jemputan!',
  },
]

const rentalSteps = [
  {
    step: '01',
    icon: '🚗',
    title: 'Pilih Mobil',
    desc: 'Tentukan lokasi ambil, tanggal sewa, dan pilih "Lepas Kunci" atau "Dengan Driver".',
  },
  {
    step: '02',
    icon: '📄',
    title: 'Upload Dokumen',
    desc: 'Bila lepas kunci, upload SIM Internasional Anda. Kami tampilkan rincian harga transparan termasuk deposit.',
  },
  {
    step: '03',
    icon: '🔑',
    title: 'Serah Terima Kendaraan',
    desc: 'Tunjukkan QR Code pemesanan di loket bandara/stasiun untuk serah terima armada yang siap pakai.',
  },
]

export default function HowItWorks() {
  const { searchMode } = useHomeStore()
  const steps = searchMode === 'travel' ? travelSteps : rentalSteps
  const title = searchMode === 'travel' ? 'Cara Pesan Travel' : 'Cara Sewa Mobil'

  return (
    <section className="bg-slate-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <AnimatePresence mode="wait">
            <motion.h2 
              key={title}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-3xl font-display font-bold text-slate-800 mb-3"
            >
              {title}
            </motion.h2>
          </AnimatePresence>
          <p className="text-slate-500">3 langkah mudah, selesai dalam hitungan menit.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20" />

          <AnimatePresence mode="wait">
            {steps.map((step, i) => (
              <motion.div 
                key={step.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center relative"
              >
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-full bg-white shadow-card flex items-center justify-center text-4xl border border-slate-100">
                    {step.icon}
                  </div>
                  <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-display font-bold text-slate-800 text-lg mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
