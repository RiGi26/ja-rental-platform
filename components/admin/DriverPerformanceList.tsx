interface Driver {
  id:         string
  name:       string
  status:     string
  avg_rating: number
}

interface Props {
  drivers: Driver[]
}

function badge(rating: number): { label: string; bg: string; text: string } {
  if (rating >= 4.8) return { label: 'Top',       bg: '#fefce8', text: '#ca8a04' }
  if (rating >= 4.5) return { label: 'Good',      bg: '#f0fdf4', text: '#16a34a' }
  return               { label: 'Efficient',  bg: '#eff6ff', text: '#2563eb' }
}

export default function DriverPerformanceList({ drivers }: Props) {
  if (drivers.length === 0) {
    return (
      <p className="text-center text-sm text-slate-400 py-8">
        Belum ada data driver.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {drivers.map((d, i) => {
        const b = badge(d.avg_rating)
        return (
          <div key={d.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
              style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}
            >
              {(i + 1)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{d.name}</p>
              <p className="text-xs text-slate-400">Rating: ⭐ {d.avg_rating?.toFixed(1) ?? '-'}</p>
            </div>
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: b.bg, color: b.text }}
            >
              {b.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
