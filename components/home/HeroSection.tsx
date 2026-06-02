import SearchBox from '@/components/search/SearchBox'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #1D4ED8 100%)',
        }}
      />

      {/* Decorative blobs */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full -z-10 opacity-20"
        style={{ background: 'radial-gradient(circle, #60A5FA, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full -z-10 opacity-15"
        style={{ background: 'radial-gradient(circle, #818CF8, transparent 70%)' }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-20 flex flex-col items-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Platform Travel Terpercaya #1 di Indonesia
        </div>

        {/* Headline */}
        <h1 className="text-center text-white font-display font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
          Pesan Travel & Sewa Mobil,<br />
          <span className="text-sky-300">Pilih Kursi Realtime</span>
        </h1>

        <p className="text-center text-white/70 text-base md:text-lg max-w-xl mb-10">
          Lupakan antre dan konfirmasi manual. Amankan jadwal perjalanan Anda dalam 2 menit dengan e-ticket otomatis dan tracking driver langsung.
        </p>

        {/* SearchBox */}
        <div className="w-full">
          <SearchBox />
        </div>

        {/* Social Proof */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-white/60 text-sm">
          {[
            { value: 'Ribuan', label: 'Perjalanan Sukses' },
            { value: '15+', label: 'Kota Tersedia' },
            { value: 'Terpercaya', label: 'Oleh Pelanggan' },
            { value: '24/7', label: 'Dukungan' },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center gap-0.5">
              <span className="text-white font-bold text-xl">{item.value}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 -z-10">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L1440 80L1440 30C1080 80 360 0 0 30L0 80Z" fill="#F8FAFC" />
        </svg>
      </div>
    </section>
  )
}
