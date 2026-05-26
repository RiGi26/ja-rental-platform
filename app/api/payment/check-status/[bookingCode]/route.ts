import { createRentalServiceClient } from '@/lib/supabase/service'
import { isMockMode } from '@/lib/midtrans'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookingCode: string }> }
) {
  const { bookingCode } = await params
  const supabase = createRentalServiceClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, payment_status, total_amount')
    .eq('booking_code', bookingCode)
    .single()

  if (!booking) {
    return Response.json({ error: 'Booking tidak ditemukan' }, { status: 404 })
  }

  // Already paid — short-circuit
  if (booking.payment_status === 'paid') {
    return Response.json({ status: 'paid' })
  }

  // Mock mode — client polling tidak diperlukan (MockPaymentWidget langsung redirect)
  if (isMockMode) {
    return Response.json({ status: 'pending' })
  }

  // Production: tanya Midtrans
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? ''
  const base      = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://api.midtrans.com/v2'
    : 'https://api.sandbox.midtrans.com/v2'

  try {
    const res = await fetch(`${base}/${bookingCode}/status`, {
      headers: {
        Authorization: `Basic ${Buffer.from(serverKey + ':').toString('base64')}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return Response.json({ status: 'pending' })
    }

    const data = await res.json() as { transaction_status?: string; fraud_status?: string }
    const ts   = data.transaction_status
    const fs   = data.fraud_status

    if (ts === 'settlement' || (ts === 'capture' && fs === 'accept')) {
      await supabase
        .from('bookings')
        .update({ status: 'confirmed', payment_status: 'paid' })
        .eq('id', booking.id)

      await supabase
        .from('payments')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('booking_id', booking.id)

      // Non-blocking notification
      import('@/lib/notifications')
        .then(({ notifyPaymentSuccess }) => notifyPaymentSuccess(booking.id))
        .catch(err => console.error('[check-status] notify error:', err))

      return Response.json({ status: 'paid' })
    }

    if (ts === 'expire' || ts === 'cancel' || ts === 'deny') {
      await supabase
        .from('bookings')
        .update({ status: 'cancelled', payment_status: 'failed' })
        .eq('id', booking.id)

      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('booking_id', booking.id)

      return Response.json({ status: 'expired' })
    }

    return Response.json({ status: 'pending' })
  } catch (err) {
    console.error('[check-status]', err)
    return Response.json({ status: 'pending' })
  }
}
