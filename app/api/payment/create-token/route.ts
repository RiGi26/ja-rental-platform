import { createRentalServiceClient } from '@/lib/supabase/service'
import { guardEntitlementApi } from '@/lib/tenant-entitlements'
import { createSnapToken, isMockMode } from '@/lib/midtrans'

export async function POST(req: Request) {
  try {
    const { bookingCode } = await req.json()
    if (!bookingCode) {
      return Response.json({ error: 'bookingCode diperlukan' }, { status: 400 })
    }

    const supabase = createRentalServiceClient()

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

    // Tier gate: pembayaran online (Midtrans) = Growth+. Starter pakai konfirmasi
    // bayar manual saja. Tenant diturunkan dari booking.
    const tenantId = (booking as Record<string, unknown>).tenant_id as string | undefined
    if (tenantId) {
      const payGuard = await guardEntitlementApi(tenantId, 'online_payment')
      if (payGuard) return payGuard
    }

    if (booking.payment_status === 'paid') {
      return Response.json({ error: 'Booking sudah dibayar' }, { status: 400 })
    }

    const expiresAt = (booking as Record<string, unknown>).expires_at as string | null
    if (expiresAt && new Date(expiresAt) < new Date()) {
      await supabase
        .from('bookings')
        .update({ status: 'expired', payment_status: 'failed' })
        .eq('id', booking.id)
      return Response.json({ error: 'Booking sudah kadaluarsa' }, { status: 410 })
    }

    const passengers     = (booking.passengers ?? []) as { name: string; phone: string }[]
    const passenger      = passengers[0]
    const route          = (booking.schedule as { route?: { origin: string; destination: string } } | null)?.route
    const origin         = route?.origin      ?? 'Asal'
    const destination    = route?.destination ?? 'Tujuan'
    const passengerCount = passengers.length || 1

    // Fallback: DB memakai kolom "total" atau "total_amount"
    const raw    = booking as Record<string, unknown>
    const amount = (raw.total_amount as number | null) ?? (raw.total as number | null) ?? 0
    const pricePerPax = Math.round(amount / passengerCount)

    console.log('[create-token] isMockMode:', isMockMode, '| amount:', amount, '| pax:', passengerCount)

    const { token, redirectUrl } = await createSnapToken({
      orderId:       bookingCode,
      amount,
      customerName:  passenger?.name  ?? 'Customer',
      customerEmail: 'customer@japanarenatour.com',
      customerPhone: passenger?.phone ?? '08000000000',
      items: [{
        id:       `ticket-${bookingCode}`,
        name:     `Tiket Travel ${origin} - ${destination}`,
        price:    pricePerPax,
        quantity: passengerCount,
      }],
    })

    console.log('[create-token] token ok:', token)

    await supabase
      .from('payments')
      .update({ snap_token: token })
      .eq('booking_id', booking.id)

    return Response.json({
      snapToken:  token,
      redirectUrl,
      clientKey:  process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '',
      isMockMode,
      bookingCode,
      amount,
      expiresAt,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[create-token] THREW:', msg)
    return Response.json({ error: `[create-token] ${msg}` }, { status: 500 })
  }
}
