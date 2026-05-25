import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Schedule } from '@/lib/types'

export interface PassengerInput {
  name: string
  phone: string
  seat_number: string
}

interface BookingState {
  scheduleId: string | null
  schedule: Schedule | null
  passengers: number            // jumlah penumpang (count)
  selectedSeats: string[]
  pickupPointId: string | null
  passengerDetails: PassengerInput[]
  totalAmount: number
  bookingCode: string | null
}

interface BookingActions {
  setSchedule: (id: string, schedule: Schedule, passengers: number) => void
  setSeats: (seats: string[]) => void
  setPickupPoint: (id: string) => void
  setPassengers: (details: PassengerInput[]) => void
  setPassengerDetails: (details: PassengerInput[]) => void
  setTotal: (amount: number) => void
  setBookingCode: (code: string) => void
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
  bookingCode: null,
}

export const useBookingStore = create<BookingState & BookingActions>()(
  persist(
    (set) => ({
      ...initial,
      setSchedule: (id, schedule, passengers) =>
        set({ scheduleId: id, schedule, passengers }),
      setSeats: (seats) => set({ selectedSeats: seats }),
      setPickupPoint: (id) => set({ pickupPointId: id }),
      setPassengers: (details) => set({ passengerDetails: details }),
      setPassengerDetails: (details) => set({ passengerDetails: details }),
      setTotal: (amount) => set({ totalAmount: amount }),
      setBookingCode: (code) => set({ bookingCode: code }),
      reset: () => set(initial),
    }),
    {
      name: 'ja-booking-session',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
