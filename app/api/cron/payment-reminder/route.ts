import { createServiceClient } from '@/lib/supabase/service'
import { notifyPaymentReminder } from '@/lib/notifications'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase   = createServiceClient()
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const now        = new Date().toISOString()

    const { data: pending } = await supabase
      .from('bookings')
      .select('id, booking_code')
      .eq('payment_status', 'pending')
      .lt('created_at', oneHourAgo)
      .gt('expires_at', now)

    const results = await Promise.allSettled(
      (pending ?? []).map((b: { id: string }) => notifyPaymentReminder(b.id))
    )

    const failed = results.filter(r => r.status === 'rejected').length
    console.log(`[CRON] payment-reminder: ${pending?.length ?? 0} bookings, ${failed} failed`)

    return Response.json({ ok: true, count: pending?.length ?? 0, failed })
  } catch (err) {
    console.error('[CRON] payment-reminder error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
