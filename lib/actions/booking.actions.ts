'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

interface CreateBookingInput {
  scheduleId: string
  seats: string[]
  pickupPointId: string | null
  passengers: { name: string; phone: string; seat_number: string }[]
  totalAmount: number
}

interface CreateBookingResult {
  success?: boolean
  bookingId?: string
  bookingCode?: string
  error?: string
}

export async function createBooking(data: CreateBookingInput): Promise<CreateBookingResult> {
  // Guest checkout: user boleh null, customer_id disimpan NULL di DB
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  // Service client untuk bypass RLS pada operasi DB
  const supabase = createServiceClient()

  // STEP 1: Validasi ulang kursi masih available (cegah race condition)
  const { data: activeBookings } = await supabase
    .from('bookings')
    .select('passengers(seat_number)')
    .eq('schedule_id', data.scheduleId)
    .not('status', 'in', '(cancelled,expired)')

  const takenSeats: string[] = []
  for (const booking of activeBookings ?? []) {
    const pax = (booking as { passengers: { seat_number: string }[] }).passengers
    for (const p of pax ?? []) {
      if (p.seat_number) takenSeats.push(p.seat_number)
    }
  }

  const conflictSeats = data.seats.filter(s => takenSeats.includes(s))
  if (conflictSeats.length > 0) {
    return {
      error: `Kursi ${conflictSeats.join(', ')} baru saja dipesan orang lain. Silakan pilih kursi lain.`,
    }
  }

  // STEP 2: Ambil data schedule (tenant_id + seats_available)
  const { data: schedule } = await supabase
    .from('schedules')
    .select('tenant_id, seats_available')
    .eq('id', data.scheduleId)
    .single()

  if (!schedule) return { error: 'Jadwal tidak ditemukan.' }
  if (schedule.seats_available < data.seats.length) {
    return { error: 'Kursi tidak cukup, silakan pilih jadwal lain.' }
  }

  // STEP 3: Insert booking (booking_code di-generate trigger PostgreSQL)
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 jam
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      tenant_id:        schedule.tenant_id,
      schedule_id:      data.scheduleId,
      customer_id:      user?.id ?? null,
      type:             'travel',
      status:           'pending_payment',
      payment_status:   'pending',
      seats:            data.seats,
      pickup_point_id:  data.pickupPointId,
      total_amount:     data.totalAmount,
      expires_at:       expiresAt,
    })
    .select('id, booking_code')
    .single()

  if (bookingError || !booking) {
    const msg = bookingError?.message ?? 'unknown'
    console.error('[createBooking] booking insert:', msg)
    return {
      error: process.env.NODE_ENV === 'development'
        ? `Gagal membuat booking: ${msg}`
        : 'Gagal membuat booking. Silakan coba lagi.',
    }
  }

  // STEP 4: Insert passengers
  const passengersData = data.passengers.map(p => ({
    booking_id:       booking.id,
    name:             p.name,
    phone:            p.phone,
    seat_number:      p.seat_number,
    pickup_point_id:  data.pickupPointId,
  }))

  const { error: paxError } = await supabase
    .from('passengers')
    .insert(passengersData)

  if (paxError) {
    // Rollback booking
    await supabase.from('bookings').delete().eq('id', booking.id)
    console.error('[createBooking] passengers insert:', paxError.message)
    return { error: 'Gagal menyimpan data penumpang. Silakan coba lagi.' }
  }

  // STEP 5: Insert payment record (non-fatal)
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      booking_id: booking.id,
      amount:     data.totalAmount,
      status:     'pending',
    })

  if (paymentError) {
    console.error('[createBooking] payment insert:', paymentError.message)
  }

  // STEP 6: Kurangi seats_available
  await supabase
    .from('schedules')
    .update({ seats_available: schedule.seats_available - data.seats.length })
    .eq('id', data.scheduleId)

  return {
    success:     true,
    bookingId:   booking.id,
    bookingCode: booking.booking_code,
  }
}
