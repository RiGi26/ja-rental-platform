import { createServiceClient } from '@/lib/supabase/service'
import { createSnapToken, isMockMode } from '@/lib/midtrans'

export async function POST(req: Request) {
  try {
    const { bookingCode } = await req.json()
    if (!bookingCode) {
      return Response.json({ error: 'bookingCode diperlukan' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        *,
        passengers(*),
        schedule:schedules(*, route:routes(origin, destination))
      `)
      .eq('booking_code', bookingCode)
      .single()

    if (!booking) {
      return Response.json({ error: 'Booking tidak ditemukan' }, { status: 404 })
    }

    if (booking.payment_status === 'paid') {
      return Response.json({ error: 'Booking sudah dibayar' }, { status: 400 })
    }

    if (new Date(booking.expires_at) < new Date()) {
      await supabase
        .from('bookings')
        .update({ status: 'expired', payment_status: 'failed' })
        .eq('id', booking.id)
      return Response.json({ error: 'Booking sudah kadaluarsa' }, { status: 410 })
    }

    const passengers = (booking.passengers ?? []) as { name: string; phone: string }[]
    const passenger  = passengers[0]
    const route      = (booking.schedule as { route?: { origin: string; destination: string } } | null)?.route
    const origin      = route?.origin      ?? 'Asal'
    const destination = route?.destination ?? 'Tujuan'
    const passengerCount = passengers.length || 1
    const pricePerPax    = Math.round((booking.total_amount as number) / passengerCount)

    const { token, redirectUrl } = await createSnapToken({
      orderId:       bookingCode,
      amount:        booking.total_amount as number,
      customerName:  passenger?.name  ?? 'Customer',
      customerEmail: 'customer@japanarenatour.com',
      customerPhone: passenger?.phone ?? '08000000000',
      items: [{
        id:       `ticket-${bookingCode}`,
        name:     `Tiket Travel ${origin} → ${destination}`,
        price:    pricePerPax,
        quantity: passengerCount,
      }],
    })

    // Simpan snap_token dan midtrans_ref ke tabel payments
    await supabase
      .from('payments')
      .update({ snap_token: token, midtrans_ref: bookingCode })
      .eq('booking_id', booking.id)

    return Response.json({
      snapToken:  token,
      redirectUrl,
      clientKey:  process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '',
      isMockMode,
      bookingCode,
      amount:     booking.total_amount,
      expiresAt:  booking.expires_at,
    })
  } catch (err) {
    console.error('[create-token]', err)
    return Response.json({ error: 'Gagal membuat token pembayaran' }, { status: 500 })
  }
}
