const stats = [
  { icon: '🚌', value: '10.000+', label: 'Tiket Terjual', desc: 'Perjalanan aman setiap bulan' },
  { icon: '🗺️', value: '50+', label: 'Rute Antar Kota', desc: 'Menghubungkan Jawa, Bali, & Sumatra' },
  { icon: '⭐', value: '4.8', label: 'Rating Aplikasi', desc: 'Berdasarkan 5.000+ ulasan asli' },
  { icon: '⚡', value: '< 2 mnt', label: 'Proses Booking', desc: 'Dari cari rute hingga e-ticket' },
]

export default function StatsSection() {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(stat => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <span className="text-3xl mb-3">{stat.icon}</span>
              <span className="text-3xl font-display font-bold text-primary mb-1">{stat.value}</span>
              <span className="font-semibold text-slate-700 text-sm mb-1">{stat.label}</span>
              <span className="text-slate-400 text-xs">{stat.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
