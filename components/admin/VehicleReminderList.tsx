interface VehicleAlert {
  id:                string
  plate:             string
  brand:             string
  model:             string
  next_service_date: string | null
  stnk_expiry:       string | null
  kir_expiry:        string | null
  tax_expiry:        string | null
}

interface ReminderItem {
  vehicleLabel: string
  type:         string
  daysLeft:     number
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function buildReminders(vehicles: VehicleAlert[]): ReminderItem[] {
  const reminders: ReminderItem[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const v of vehicles) {
    const label = `${v.brand} ${v.model} (${v.plate})`
    const checks: [string | null, string][] = [
      [v.next_service_date, 'Servis'],
      [v.stnk_expiry,       'STNK'],
      [v.kir_expiry,        'KIR'],
      [v.tax_expiry,        'Pajak'],
    ]
    for (const [date, type] of checks) {
      const d = daysUntil(date)
      if (d !== null && d <= 30) {
        reminders.push({ vehicleLabel: label, type, daysLeft: d })
      }
    }
  }

  return reminders.sort((a, b) => a.daysLeft - b.daysLeft)
}

interface Props {
  vehicles: VehicleAlert[]
}

export default function VehicleReminderList({ vehicles }: Props) {
  const reminders = buildReminders(vehicles)

  if (reminders.length === 0) {
    return (
      <p className="text-center text-sm text-slate-400 py-8">
        Tidak ada reminder dalam 30 hari ke depan.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {reminders.slice(0, 5).map((r, i) => {
        const isUrgent = r.daysLeft <= 7
        return (
          <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{r.vehicleLabel}</p>
              <p className="text-xs text-slate-400 mt-0.5">{r.type}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-semibold text-slate-600">
                {r.daysLeft <= 0 ? 'Kadaluarsa' : `${r.daysLeft} hari`}
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={isUrgent
                  ? { background: '#fef2f2', color: '#dc2626' }
                  : { background: '#eff6ff', color: '#2563eb' }}
              >
                {isUrgent ? 'Urgent' : 'Reminder'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
