export default function AdminDashboardPage() {
  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-display font-bold text-text mb-6">Dashboard Admin</h1>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Booking Hari Ini', value: '—' },
          { label: 'Pemasukan Hari Ini', value: '—' },
          { label: 'Armada Aktif', value: '—' },
          { label: 'Pending Pembayaran', value: '—' },
        ].map(card => (
          <div key={card.label} className="bg-bg-card rounded-2xl shadow-card p-5">
            <p className="text-text-muted text-sm">{card.label}</p>
            <p className="text-2xl font-bold text-text mt-1">{card.value}</p>
          </div>
        ))}
      </div>
      {/* TODO: jadwal 6 jam ke depan, rating driver, alert servis */}
    </div>
  )
}
