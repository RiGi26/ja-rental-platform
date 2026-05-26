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

function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'JA-'
  for (let i = 0; i < 7; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
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

  console.log('[createBooking] STEP 3 — insert booking, customer_id:', user?.id ?? 'GUEST')

  // STEP 3: Insert booking
  const bookingCode = generateBookingCode()
  const expiresAt   = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 jam
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      tenant_id:        schedule.tenant_id,
      schedule_id:      data.scheduleId,
      customer_id:      user?.id ?? null,
      booking_code:     bookingCode,
      type:             'travel',
      status:           'pending',
      payment_status:   'pending',
      seats:            data.seats,
      pickup_point_id:  data.pickupPointId,
      total:            data.totalAmount,
      total_amount:     data.totalAmount,
      expires_at:       expiresAt,
    })
    .select('id, booking_code')
    .single()

  console.log('[createBooking] STEP 3 result — booking:', booking, 'error:', bookingError)

  if (bookingError || !booking) {
    const msg = bookingError?.message ?? 'booking row is null (insert may have succeeded but trigger/select failed)'
    const code = bookingError?.code ?? ''
    console.error('[createBooking] booking insert FAILED:', code, msg)
    return { error: `[DB] ${code} — ${msg}` }
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
    await supabase.from('bookings').delete().eq('id', booking.id)
    console.error('[createBooking] passengers insert:', paxError.code, paxError.message)
    return { error: `[PAX] ${paxError.code} — ${paxError.message}` }
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
