interface Props {
  current: 1 | 2 | 3
}

const steps = [
  { n: 1 as const, label: 'Pilih Kursi' },
  { n: 2 as const, label: 'Data Penumpang' },
  { n: 3 as const, label: 'Review & Bayar' },
]

export default function BookingSteps({ current }: Props) {
  return (
    <div className="bg-bg-card rounded-2xl shadow-card p-4">
      <div className="relative flex items-start justify-between">
        {/* Connector line behind circles */}
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-slate-100 -z-0 mx-8" />

        {steps.map((step) => {
          const done   = step.n < current
          const active = step.n === current
          return (
            <div key={step.n} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                  ${done   ? 'bg-primary text-white' : ''}
                  ${active ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                  ${!done && !active ? 'bg-slate-100 text-slate-400' : ''}
                `}
              >
                {done ? '✓' : step.n}
              </div>
              <p
                className={`text-xs font-medium hidden sm:block text-center leading-tight max-w-[80px]
                  ${active ? 'text-primary' : done ? 'text-slate-600' : 'text-slate-400'}
                `}
              >
                {step.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Mobile: tampilkan label step aktif */}
      <p className="sm:hidden text-center text-xs font-semibold text-primary mt-3">
        Langkah {current} dari 3 — {steps[current - 1].label}
      </p>
    </div>
  )
}
