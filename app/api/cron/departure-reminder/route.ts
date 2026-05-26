import { createServiceClient } from '@/lib/supabase/service'
import { notifyDepartureReminder } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()

    // Bookings yang berangkat antara 20 jam dan 28 jam dari sekarang (window H-1)
    const from = new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString()
    const to   = new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString()

    const { data: departing } = await supabase
      .from('bookings')
      .select('id, booking_code')
      .eq('payment_status', 'paid')
      .gte('schedule.depart_at', from)
      .lte('schedule.depart_at', to)

    const results = await Promise.allSettled(
      (departing ?? []).map((b: { id: string }) => notifyDepartureReminder(b.id))
    )

    const failed = results.filter(r => r.status === 'rejected').length
    console.log(`[CRON] departure-reminder: ${departing?.length ?? 0} bookings, ${failed} failed`)

    return Response.json({ ok: true, count: departing?.length ?? 0, failed })
  } catch (err) {
    console.error('[CRON] departure-reminder error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
