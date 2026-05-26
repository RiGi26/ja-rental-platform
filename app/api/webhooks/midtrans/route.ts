import crypto from 'crypto'
import { createRentalServiceClient } from '@/lib/supabase/service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = createRentalServiceClient()

    const isMock = body.mock === true

    if (!isMock) {
      const serverKey = process.env.MIDTRANS_SERVER_KEY ?? ''
      const expected = crypto
        .createHash('sha512')
        .update(body.order_id + body.status_code + body.gross_amount + serverKey)
        .digest('hex')

      if (expected !== body.signature_key) {
        return Response.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const orderId           = body.order_id as string
    const transactionStatus = body.transaction_status as string
    const fraudStatus       = body.fraud_status as string | undefined

    const { data: booking } = await supabase
      .from('bookings')
      .select('id, payment_status, total_amount')
      .eq('booking_code', orderId)
      .single()

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Idempotent — sudah paid, skip
    if (booking.payment_status === 'paid') {
      return Response.json({ ok: true, skipped: true })
    }

    let newBookingStatus: string | null = null
    let newPaymentStatus: string | null = null
    let paidAt: string | null           = null

    if (
      (transactionStatus === 'capture' && fraudStatus === 'accept') ||
      transactionStatus === 'settlement'
    ) {
      newBookingStatus = 'confirmed'
      newPaymentStatus = 'paid'
      paidAt           = new Date().toISOString()
    } else if (
      transactionStatus === 'deny' ||
      transactionStatus === 'cancel' ||
      transactionStatus === 'expire'
    ) {
      newBookingStatus = 'cancelled'
      newPaymentStatus = 'failed'
    } else if (transactionStatus === 'pending') {
      return Response.json({ ok: true })
    }

    if (!newBookingStatus || !newPaymentStatus) {
      return Response.json({ ok: true })
    }

    await supabase
      .from('bookings')
      .update({ status: newBookingStatus, payment_status: newPaymentStatus })
      .eq('id', booking.id)

    await supabase
      .from('payments')
      .update({
        status:  newPaymentStatus,
        paid_at: paidAt,
        method:  (body.payment_type as string | undefined) ?? null,
      })
      .eq('booking_id', booking.id)

    if (newPaymentStatus === 'paid') {
      console.log(`✅ Booking ${orderId} PAID — Rp ${booking.total_amount}`)
      // Non-blocking — jangan tunggu notifikasi selesai
      import('@/lib/notifications')
        .then(({ notifyPaymentSuccess }) => notifyPaymentSuccess(booking.id))
        .catch(err => console.error('[NOTIFY ERROR]', err))
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[webhook/midtrans]', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
