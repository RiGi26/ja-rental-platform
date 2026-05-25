'use client'

type SeatStatus = 'available' | 'selected' | 'unavailable'

interface Seat {
  number: number
  status: SeatStatus
}

interface Props {
  seats: Seat[]
  maxSelect: number
  selected: number[]
  onChange: (selected: number[]) => void
}

const statusClass: Record<SeatStatus, string> = {
  available:   'bg-blue-100 text-blue-700 border-blue-300 cursor-pointer hover:bg-blue-200',
  selected:    'bg-green-500 text-white border-green-600 cursor-pointer',
  unavailable: 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed',
}

export default function SeatPicker({ seats, maxSelect, selected, onChange }: Props) {
  function toggleSeat(num: number, status: SeatStatus) {
    if (status === 'unavailable') return
    if (selected.includes(num)) {
      onChange(selected.filter(s => s !== num))
    } else if (selected.length < maxSelect) {
      onChange([...selected, num])
    }
  }

  return (
    <div>
      <div className="flex gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-blue-100 border border-blue-300 inline-block" /> Tersedia</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-green-500 inline-block" /> Dipilih</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-slate-200 border border-slate-300 inline-block" /> Terisi</span>
      </div>
      <div className="grid grid-cols-4 gap-2 max-w-xs">
        {seats.map(seat => {
          const currentStatus: SeatStatus = selected.includes(seat.number) ? 'selected' : seat.status
          return (
            <button
              key={seat.number}
              onClick={() => toggleSeat(seat.number, seat.status)}
              className={`w-10 h-10 rounded-lg border text-sm font-semibold transition-all ${statusClass[currentStatus]}`}
            >
              {seat.number}
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-text-muted text-sm">
        Dipilih: {selected.join(', ') || '—'} ({selected.length}/{maxSelect})
      </p>
    </div>
  )
}
