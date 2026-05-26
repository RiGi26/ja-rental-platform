import { createRentalServiceClient } from '@/lib/supabase/service'
import { notifyPaymentSuccess, notifyPaymentReminder, notifyDepartureReminder } from '@/lib/notifications'

type NotifyEvent = 'payment_success' | 'payment_reminder' | 'departure_reminder'

export async function POST(req: Request) {
  try {
    const { bookingCode, event } = await req.json() as { bookingCode?: string; event?: NotifyEvent }

    if (!bookingCode || !event) {
      return Response.json({ error: 'bookingCode dan event diperlukan' }, { status: 400 })
    }

    const supabase = createRentalServiceClient()
    const { data: booking } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_code', bookingCode)
      .single()

    if (!booking) {
      return Response.json({ error: 'Booking tidak ditemukan' }, { status: 404 })
    }

    switch (event) {
      case 'payment_success':
        await notifyPaymentSuccess(booking.id)
        break
      case 'payment_reminder':
        await notifyPaymentReminder(booking.id)
        break
      case 'departure_reminder':
        await notifyDepartureReminder(booking.id)
        break
      default:
        return Response.json({ error: 'Event tidak valid' }, { status: 400 })
    }

    return Response.json({ ok: true, event, bookingCode })
  } catch (err) {
    console.error('[notifications/send]', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
