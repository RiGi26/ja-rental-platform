import { create } from 'zustand'
import type { Schedule } from '@/lib/types'

interface PassengerInput {
  name: string
  phone: string
  seat_number: string
  pickup_point_id: string | null
}

interface BookingState {
  scheduleId: string | null
  schedule: Schedule | null
  passengers: number
  selectedSeats: string[]
  pickupPointId: string | null
  passengerDetails: PassengerInput[]
  totalAmount: number
}

interface BookingActions {
  setSchedule: (id: string, schedule: Schedule, passengers: number) => void
  setSeats: (seats: string[]) => void
  setPickupPoint: (id: string) => void
  setPassengerDetails: (details: PassengerInput[]) => void
  setTotal: (amount: number) => void
  reset: () => void
}

const initial: BookingState = {
  scheduleId: null,
  schedule: null,
  passengers: 1,
  selectedSeats: [],
  pickupPointId: null,
  passengerDetails: [],
  totalAmount: 0,
}

export const useBookingStore = create<BookingState & BookingActions>((set) => ({
  ...initial,
  setSchedule: (id, schedule, passengers) =>
    set({ scheduleId: id, schedule, passengers }),
  setSeats: (seats) =>
    set({ selectedSeats: seats }),
  setPickupPoint: (id) =>
    set({ pickupPointId: id }),
  setPassengerDetails: (details) =>
    set({ passengerDetails: details }),
  setTotal: (amount) =>
    set({ totalAmount: amount }),
  reset: () =>
    set(initial),
}))
