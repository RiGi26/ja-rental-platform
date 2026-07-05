import { createRentalServiceClient } from '@/lib/supabase/service'
import { guardEntitlementApi } from '@/lib/tenant-entitlements'
import { notifyPaymentSuccess, notifyPaymentReminder, notifyDepartureReminder } from '@/lib/notifications'
import { rateLimit, clientIp, tooManyRequests } from '@/lib/rate-limit'

type NotifyEvent = 'payment_success' | 'payment_reminder' | 'departure_reminder'

export async function POST(req: Request) {
  try {
    const { bookingCode, event } = await req.json() as { bookingCode?: string; event?: NotifyEvent }

    if (!bookingCode || !event) {
      return Response.json({ error: 'bookingCode dan event diperlukan' }, { status: 400 })
    }

    // Abuse hardening (audit 2026-07-05): endpoint ini memicu WA/email berbiaya dan
    // hanya "dijaga" booking_code (bearer yang muncul di URL publik). Batasi laju
    // per-code dan per-IP agar tak bisa dipakai spam / menghabiskan kredit Fonnte.
    // Gate HMAC internal (seperti /api/billing/sync) = follow-up begitu caller sah
    // dipastikan.
    const rlCode = rateLimit(`notify:${bookingCode}`, 3, 60 * 60_000)
    if (!rlCode.allowed) return tooManyRequests(rlCode.retryAfter)
    const rlIp = rateLimit(`notify-ip:${clientIp(req)}`, 20, 60 * 60_000)
    if (!rlIp.allowed) return tooManyRequests(rlIp.retryAfter)

    const supabase = createRentalServiceClient()
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, tenant_id')
      .eq('booking_code', bookingCode)
      .single()

    // Jangan bocorkan keberadaan booking (existence oracle 404-vs-200): balas generik
    // untuk code yang tak ditemukan, tanpa mengirim notifikasi apa pun.
    if (!booking) {
      return Response.json({ ok: true })
    }

    // Tier gate: notifikasi WhatsApp otomatis = Growth+ (legacy/Pro allowed).
    const tenantId = (booking as { tenant_id?: string }).tenant_id
    if (tenantId) {
      const waGuard = await guardEntitlementApi(tenantId, 'wa_notif')
      if (waGuard) return waGuard
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
