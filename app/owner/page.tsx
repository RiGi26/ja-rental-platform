export default function OwnerDashboardPage() {
  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-display font-bold text-text mb-6">Dashboard Owner</h1>
      {/* KPI ringkasan eksekutif */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Booking Bulan Ini', value: '—' },
          { label: 'Pemasukan Bulan Ini', value: '—' },
          { label: 'Rating Rata-rata Driver', value: '—' },
        ].map(card => (
          <div key={card.label} className="bg-bg-card rounded-2xl shadow-card p-5">
            <p className="text-text-muted text-sm">{card.label}</p>
            <p className="text-2xl font-bold text-text mt-1">{card.value}</p>
          </div>
        ))}
      </div>
      {/* TODO: chart pemasukan, alert dokumen kadaluarsa, jadwal 6 jam ke depan */}
    </div>
  )
}
