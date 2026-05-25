import type { SeatMap } from '@/lib/types'

export function generateSeatMap(
  capacity: number,
  bookedSeats: string[]
): SeatMap[] {
  // capacity ≤ 12 → layout 2-1 (3 kursi per baris)
  // capacity > 12 → layout 2-2 (4 kursi per baris)
  const colsPerSide = capacity <= 12 ? [2, 1] : [2, 2]
  const totalCols = colsPerSide.reduce((a, b) => a + b, 0)
  const rows = Math.ceil(capacity / totalCols)

  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const seats: SeatMap[] = []
  let seatCount = 0

  for (let r = 0; r < rows && seatCount < capacity; r++) {
    for (let c = 1; c <= totalCols && seatCount < capacity; c++) {
      const seatId = `${rowLabels[r]}${c}`
      seats.push({
        seat_number: seatId,
        status: bookedSeats.includes(seatId) ? 'unavailable' : 'available',
      })
      seatCount++
    }
  }

  return seats
}

export function getSeatLayout(capacity: number): { cols: number; hasAisle: boolean } {
  if (capacity <= 12) return { cols: 3, hasAisle: true }  // 2-1
  return { cols: 4, hasAisle: true }                       // 2-2
}
