'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getOccupiedSeats } from '@/lib/actions/schedule.actions'
import { generateSeatMap } from '@/lib/utils/seat'
import SeatLegend from './SeatLegend'
import type { SeatMap } from '@/lib/types'

interface Props {
  scheduleId: string
  capacity: number
  initialOccupied: string[]
  maxSelectable: number
  onSeatsChange: (seats: string[]) => void
}

// Layout: 2-1 (3 kolom, kapasitas ≤12) atau 2-2 (4 kolom, >12)
function buildRows(seatMap: SeatMap[], cols: number): SeatMap[][] {
  const rows: SeatMap[][] = []
  for (let i = 0; i < seatMap.length; i += cols) {
    rows.push(seatMap.slice(i, i + cols))
  }
  return rows
}

export default function SeatPicker({
  scheduleId,
  capacity,
  initialOccupied,
  maxSelectable,
  onSeatsChange,
}: Props) {
  const cols = capacity <= 12 ? 3 : 4      // 2-1 atau 2-2
  const aisleAfter = capacity <= 12 ? 2 : 2 // aisle setelah kolom ke-N

  const [occupied, setOccupied] = useState<string[]>(initialOccupied)
  const [selected, setSelected] = useState<string[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const seatMap = generateSeatMap(capacity, occupied)
  const rows = buildRows(seatMap, cols)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }, [])

  // Realtime: subscribe ke perubahan bookings untuk jadwal ini
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`seats-${scheduleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `schedule_id=eq.${scheduleId}` },
        async () => {
          const fresh = await getOccupiedSeats(scheduleId)
          setOccupied(fresh)

          // Jika kursi yang sedang dipilih baru saja terpesan orang lain
          const stolen = selected.filter(s => fresh.includes(s))
          if (stolen.length > 0) {
            setSelected(prev => prev.filter(s => !fresh.includes(s)))
            showToast(`Kursi ${stolen.join(', ')} baru saja dipesan orang lain`)
          }
        }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [scheduleId, selected, showToast])

  // Propagate selected seats ke parent
  useEffect(() => {
    onSeatsChange(selected)
  }, [selected, onSeatsChange])

  function toggleSeat(seat: SeatMap) {
    if (seat.status === 'unavailable' || occupied.includes(seat.seat_number)) return

    setSelected(prev => {
      if (prev.includes(seat.seat_number)) {
        return prev.filter(s => s !== seat.seat_number)
      }
      if (prev.length >= maxSelectable) return prev
      return [...prev, seat.seat_number]
    })
  }

  function getSeatStatus(seat: SeatMap): 'available' | 'selected' | 'unavailable' | 'disabled' {
    if (occupied.includes(seat.seat_number)) return 'unavailable'
    if (selected.includes(seat.seat_number)) return 'selected'
    if (seat.status === 'unavailable') return 'unavailable'
    if (selected.length >= maxSelectable) return 'disabled'
    return 'available'
  }

  const seatClass: Record<string, string> = {
    available:   'bg-blue-50 border-2 border-blue-300 hover:bg-blue-100 cursor-pointer',
    selected:    'bg-blue-600 border-2 border-blue-700 text-white cursor-pointer shadow-glow',
    unavailable: 'bg-gray-200 border-2 border-gray-300 opacity-60 cursor-not-allowed',
    disabled:    'bg-blue-50 border-2 border-blue-100 opacity-40 cursor-not-allowed',
  }

  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  return (
    <div>
      <SeatLegend />

      {/* Indikator kursi sopir */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-11 h-11 rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-xl">
          🚌
        </div>
        <span className="text-xs text-slate-400">Depan (Sopir)</span>
      </div>

      {/* Grid kursi */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-max">
          {rows.map((row, ri) => (
            <div key={ri} className="flex items-center gap-1 mb-1.5">
              {/* Row label */}
              <span className="w-5 text-xs text-slate-400 text-right mr-1">
                {rowLabels[ri]}
              </span>

              {row.map((seat, ci) => {
                const status = getSeatStatus(seat)
                return (
                  <div key={seat.seat_number} className="flex items-center gap-1">
                    {/* Aisle gap */}
                    {ci === aisleAfter && (
                      <div className="w-4 border-dashed border-r-2 border-slate-200 h-11 mx-0.5" />
                    )}
                    <button
                      type="button"
                      onClick={() => toggleSeat(seat)}
                      disabled={status === 'unavailable' || status === 'disabled'}
                      title={status === 'unavailable' ? 'Kursi sudah dipesan' : seat.seat_number}
                      className={`
                        w-11 h-11 rounded-xl text-xs font-bold
                        flex items-center justify-center
                        transition-all duration-150
                        ${seatClass[status]}
                      `}
                    >
                      {status === 'unavailable' ? '✕' : seat.seat_number}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Counter */}
      <div className="mt-5 flex items-center gap-3">
        <div className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm">
          <span className="font-bold text-primary">{selected.length}</span>
          <span className="text-slate-500"> dari </span>
          <span className="font-bold text-slate-700">{maxSelectable}</span>
          <span className="text-slate-500"> kursi dipilih</span>
          {selected.length > 0 && (
            <span className="text-slate-400 ml-2">({selected.sort().join(', ')})</span>
          )}
        </div>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => setSelected([])}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="mt-3 bg-orange-50 border border-orange-200 text-orange-700 text-sm px-4 py-2.5 rounded-xl">
          ⚠ {toast}
        </div>
      )}
    </div>
  )
}
