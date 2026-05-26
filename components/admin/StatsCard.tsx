interface Props {
  label:   string
  value:   string
  subtext: string
  icon:    string
  color:   'blue' | 'green' | 'purple' | 'orange'
}

const colorMap = {
  blue:   { bg: '#eff6ff', text: '#2563eb' },
  green:  { bg: '#f0fdf4', text: '#16a34a' },
  purple: { bg: '#faf5ff', text: '#7c3aed' },
  orange: { bg: '#fff7ed', text: '#ea580c' },
}

export default function StatsCard({ label, value, subtext, icon, color }: Props) {
  const { bg, text } = colorMap[color]

  return (
    <div
      className="bg-white flex flex-col gap-4 p-6"
      style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-[52px] h-[52px] flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: bg, borderRadius: 16, color: text }}
        >
          {icon}
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
          Hari ini
        </span>
      </div>
      <div>
        <p
          className="font-extrabold leading-none mb-1"
          style={{ fontSize: 36, color: '#1e293b' }}
        >
          {value}
        </p>
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>
      </div>
    </div>
  )
}
