import { createCoreServiceClient, createRentalServiceClient } from '@/lib/supabase/service'
import { sendWhatsApp } from './whatsapp'
import { sendBookingConfirmationEmail, sendPaymentReminderEmail, sendDepartureReminderEmail } from './email'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rent.webzoka.com'

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(iso)) + ' WIB'
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface Passenger { name: string; phone: string; seat_number: string; pickup_point_id: string | null }
interface PickupPointRow { id: string; label: string }

// ── notifyPaymentSuccess ───────────────────────────────────────────────────────

export async function notifyPaymentSuccess(bookingId: string): Promise<void> {
  const supabase     = createRentalServiceClient()
  const coreSupabase = createCoreServiceClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, booking_code, customer_id, tenant_id, pickup_point_id,
      total_amount, total,
      passengers(*),
      schedule:schedules(
        depart_at, pickup_points,
        route:routes(origin, destination)
      )
    `)
    .eq('id', bookingId)
    .single()

  if (!booking) {
    console.error('[NOTIFY] Booking not found:', bookingId)
    return
  }

  const raw        = booking as Record<string, unknown>
  const passengers = (raw.passengers ?? []) as Passenger[]
  const firstPax   = passengers[0]
  if (!firstPax) return

  const schedule     = raw.schedule as { depart_at: string; pickup_points: PickupPointRow[]; route?: { origin: string; destination: string } } | null
  const route        = schedule?.route
  const pickupPoints = (schedule?.pickup_points ?? []) as PickupPointRow[]
  const pickupPoint  = pickupPoints.find(p => p.id === (raw.pickup_point_id as string))?.label ?? '-'
  const departAt     = schedule?.depart_at ? formatDateTime(schedule.depart_at) : '-'
  const totalAmount  = (raw.total_amount as number | null) ?? (raw.total as number | null) ?? 0
  const seats        = passengers.map(p => p.seat_number)

  // Send WA to all passengers (mock if token not set)
  await Promise.allSettled(
    passengers.map(p =>
      sendWhatsApp(p.phone, 'payment_success', {
        bookingCode:   booking.booking_code as string,
        passengerName: p.name,
        origin:        route?.origin ?? '-',
        destination:   route?.destination ?? '-',
        departAt,
        pickupPoint,
      })
    )
  )

  // Send email to logged-in customer (if we can resolve their email)
  const customerId = raw.customer_id as string | null
  if (customerId) {
    try {
      const { data: { user } } = await coreSupabase.auth.admin.getUserById(customerId)
      if (user?.email) {
        await sendBookingConfirmationEmail({
          to:            user.email,
          passengerName: firstPax.name,
          bookingCode:   booking.booking_code as string,
          origin:        route?.origin ?? '-',
          destination:   route?.destination ?? '-',
          departAt,
          pickupPoint,
          seats,
          totalAmount,
        })
      }
    } catch (err) {
      console.error('[NOTIFY] Failed to get customer email:', err)
    }
  }

  // Log to notifications table in Rental DB (non-fatal)
  try {
    await supabase.from('notifications').insert({
      tenant_id:      raw.tenant_id,
      recipient_type: 'customer',
      recipient_id:   customerId ?? firstPax.phone,
      channel:        'whatsapp',
      content:        `payment_success: ${booking.booking_code}`,
      sent_at:        new Date().toISOString(),
    })
  } catch (err) {
    console.error('[NOTIFY] Failed to log notification:', err)
  }

  console.log(`[NOTIFY] payment_success sent for ${booking.booking_code}`)
}

// ── notifyPaymentReminder ──────────────────────────────────────────────────────

export async function notifyPaymentReminder(bookingId: string): Promise<void> {
  const supabase     = createRentalServiceClient()
  const coreSupabase = createCoreServiceClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, booking_code, customer_id, tenant_id, expires_at,
      passengers(*),
      schedule:schedules(route:routes(origin, destination))
    `)
    .eq('id', bookingId)
    .single()

  if (!booking) return

  const raw        = booking as Record<string, unknown>
  const passengers = (raw.passengers ?? []) as Passenger[]
  const firstPax   = passengers[0]
  if (!firstPax) return

  const schedule = raw.schedule as { route?: { origin: string; destination: string } } | null
  const route    = schedule?.route
  const expiresAt = raw.expires_at as string | null

  await Promise.allSettled(
    passengers.map(p =>
      sendWhatsApp(p.phone, 'payment_reminder', {
        bookingCode:   booking.booking_code as string,
        passengerName: p.name,
        origin:        route?.origin ?? '-',
        destination:   route?.destination ?? '-',
      })
    )
  )

  const customerId = raw.customer_id as string | null
  if (customerId && expiresAt) {
    try {
      const { data: { user } } = await coreSupabase.auth.admin.getUserById(customerId)
      if (user?.email) {
        await sendPaymentReminderEmail({
          to:            user.email,
          passengerName: firstPax.name,
          bookingCode:   booking.booking_code as string,
          origin:        route?.origin ?? '-',
          destination:   route?.destination ?? '-',
          expiresAt,
        })
      }
    } catch { /* non-fatal */ }
  }
}

// ── notifyDepartureReminder ────────────────────────────────────────────────────

export async function notifyDepartureReminder(bookingId: string): Promise<void> {
  const supabase     = createRentalServiceClient()
  const coreSupabase = createCoreServiceClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, booking_code, customer_id, pickup_point_id,
      passengers(*),
      schedule:schedules(
        depart_at, pickup_points,
        route:routes(origin, destination)
      )
    `)
    .eq('id', bookingId)
    .single()

  if (!booking) return

  const raw        = booking as Record<string, unknown>
  const passengers = (raw.passengers ?? []) as Passenger[]
  const firstPax   = passengers[0]
  if (!firstPax) return

  const schedule     = raw.schedule as { depart_at: string; pickup_points: PickupPointRow[]; route?: { origin: string; destination: string } } | null
  const route        = schedule?.route
  const pickupPoints = (schedule?.pickup_points ?? []) as PickupPointRow[]
  const pickupPoint  = pickupPoints.find(p => p.id === (raw.pickup_point_id as string))?.label ?? '-'
  const departAt     = schedule?.depart_at ? formatDateTime(schedule.depart_at) : '-'

  await Promise.allSettled(
    passengers.map(p =>
      sendWhatsApp(p.phone, 'departure_reminder', {
        bookingCode:   booking.booking_code as string,
        passengerName: p.name,
        origin:        route?.origin ?? '-',
        destination:   route?.destination ?? '-',
        departAt,
        pickupPoint,
      })
    )
  )

  const customerId = raw.customer_id as string | null
  if (customerId) {
    try {
      const { data: { user } } = await coreSupabase.auth.admin.getUserById(customerId)
      if (user?.email) {
        await sendDepartureReminderEmail({
          to:            user.email,
          passengerName: firstPax.name,
          bookingCode:   booking.booking_code as string,
          origin:        route?.origin ?? '-',
          destination:   route?.destination ?? '-',
          departAt,
          pickupPoint,
        })
      }
    } catch { /* non-fatal */ }
  }

  console.log(`[NOTIFY] departure_reminder sent for ${booking.booking_code}`)
}
