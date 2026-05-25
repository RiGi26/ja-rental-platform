const steps = [
  {
    step: '01',
    icon: '🔍',
    title: 'Cari Jadwal',
    desc: 'Masukkan kota asal, tujuan, tanggal, dan jumlah penumpang. Kami tampilkan jadwal realtime dengan harga terbaik.',
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
    desc: 'E-ticket dengan QR code dikirim otomatis ke WA dan email. Tinggal scan saat naik, selesai.',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-slate-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-display font-bold text-slate-800 mb-3">Cara Pesan Tiket</h2>
          <p className="text-slate-500">3 langkah mudah, selesai dalam 3 menit.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20" />

          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center relative">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
