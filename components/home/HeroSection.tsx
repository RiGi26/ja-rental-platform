import { Sparkles, Ticket, Armchair, Navigation, ShieldCheck } from 'lucide-react'
import SearchBox from '@/components/search/SearchBox'

const trustChips = [
  { icon: Ticket, label: 'E-ticket otomatis' },
  { icon: Armchair, label: 'Pilih kursi realtime' },
  { icon: Navigation, label: 'Tracking driver' },
  { icon: ShieldCheck, label: 'Pembayaran aman' },
]

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
    >
      {/* Base gradient */}
      <div
        className="absolute inset-0 -z-30"
        style={{ background: 'linear-gradient(150deg, #0B1220 0%, #13225C 52%, #1A56DB 100%)' }}
      />

      {/* Decorative route / map motif */}
      <svg
        aria-hidden
        className="absolute inset-0 -z-20 h-full w-full opacity-[0.18]"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
        fill="none"
      >
        <defs>
          <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" stroke="white" strokeOpacity="0.10" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1440" height="900" fill="url(#hero-grid)" />
        {/* dotted travel route */}
        <path
          d="M120 720 C 360 560, 480 640, 720 470 S 1100 300, 1340 200"
          stroke="#7DD3FC"
          strokeWidth="2.5"
          strokeDasharray="2 14"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <circle cx="120" cy="720" r="9" fill="#7DD3FC" />
        <circle cx="720" cy="470" r="7" fill="#60A5FA" />
        <circle cx="1340" cy="200" r="9" fill="#7DD3FC" />
      </svg>

      {/* Soft glow blobs */}
      <div
        className="absolute -right-[8%] -top-[12%] -z-10 h-[620px] w-[620px] rounded-full opacity-25"
        style={{ background: 'radial-gradient(circle, #60A5FA, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-[8%] -left-[6%] -z-10 h-[440px] w-[440px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #38BDF8, transparent 70%)' }}
      />

      {/* Content */}
      <div className="animate-fade-up relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-28 pt-28 md:pt-24">
        {/* Eyebrow */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
          <Sparkles size={15} className="text-sky-300" aria-hidden />
          Travel antar kota &amp; rental mobil — Webzoka
        </div>

        {/* Headline */}
        <h1
          className="text-balance text-center font-display font-extrabold leading-[1.08] tracking-tight text-white"
          style={{ fontSize: 'clamp(2.25rem, 5.4vw, 4rem)' }}
        >
          Satu pencarian, perjalanan beres.
          <br />
          <span className="bg-gradient-to-r from-sky-300 to-blue-200 bg-clip-text text-transparent">
            Pesan kursi &amp; sewa mobil
          </span>{' '}
          tanpa drama.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-white/75 md:text-lg">
          Cari jadwal travel atau mobil, amankan kursi favorit, bayar aman, lalu terima
          e-ticket otomatis dengan tracking langsung. Selesai dalam hitungan menit.
        </p>

        {/* SearchBox */}
        <div className="mt-10 w-full">
          <SearchBox />
        </div>

        {/* Trust chips (honest, icon-based) */}
        <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-3 gap-y-2.5">
          {trustChips.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-1.5 text-sm font-medium text-white/85 backdrop-blur-sm"
            >
              <Icon size={15} className="text-sky-300" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom wave into the light section */}
      <div className="absolute bottom-0 left-0 right-0 -z-10 leading-[0]">
        <svg viewBox="0 0 1440 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 90L1440 90L1440 34C1080 90 360 0 0 34L0 90Z" fill="#F8FAFC" />
        </svg>
      </div>
    </section>
  )
}
