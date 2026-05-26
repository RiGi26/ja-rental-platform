const isMockMode = !process.env.WHATSAPP_TOKEN

export type WAEvent =
  | 'booking_created'
  | 'payment_success'
  | 'payment_reminder'
  | 'departure_reminder'
  | 'driver_otw'
  | 'trip_completed'

export interface WAParams {
  bookingCode:       string
  passengerName:     string
  origin?:           string
  destination?:      string
  departAt?:         string
  pickupPoint?:      string
  driverName?:       string
  estimatedArrival?: string
}

function normalizePhone(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.startsWith('0'))  return '62' + d.slice(1)
  if (d.startsWith('62')) return d
  return '62' + d
}

function buildMessage(event: WAEvent, p: WAParams): string {
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ja-rental-platform.vercel.app'
  const ticketUrl  = `${appUrl}/booking/confirm/${p.bookingCode}`
  const trackingUrl = `${appUrl}/tracking/${p.bookingCode}`

  const templates: Record<WAEvent, string> = {
    booking_created: [
      `Halo ${p.passengerName}! 🎉`,
      ``,
      `Booking kamu sudah dibuat:`,
      `📍 ${p.origin} → ${p.destination}`,
      `📅 ${p.departAt}`,
      `🎫 Kode: *${p.bookingCode}*`,
      ``,
      `Segera selesaikan pembayaran dalam 2 jam:`,
      ticketUrl,
      ``,
      `_JaTravel_`,
    ].join('\n'),

    payment_success: [
      `✅ Pembayaran berhasil! Halo ${p.passengerName},`,
      ``,
      `Tiket perjalananmu sudah siap:`,
      `📍 ${p.origin} → ${p.destination}`,
      `📅 ${p.departAt}`,
      `🚏 Jemput di: ${p.pickupPoint ?? '-'}`,
      `🎫 Kode: *${p.bookingCode}*`,
      ``,
      `Download e-ticket:`,
      ticketUrl,
      ``,
      `Selamat menikmati perjalanan! 🚌`,
    ].join('\n'),

    payment_reminder: [
      `⏰ Reminder pembayaran, ${p.passengerName}!`,
      ``,
      `Booking *${p.bookingCode}* belum dibayar.`,
      `Segera bayar sebelum kedaluwarsa:`,
      ticketUrl,
    ].join('\n'),

    departure_reminder: [
      `🚌 Reminder keberangkatan besok, ${p.passengerName}!`,
      ``,
      `📍 ${p.origin} → ${p.destination}`,
      `📅 ${p.departAt}`,
      `🚏 Titik jemput: ${p.pickupPoint ?? '-'}`,
      ``,
      `Harap hadir 15 menit sebelum jadwal.`,
      `Tracking: ${trackingUrl}`,
    ].join('\n'),

    driver_otw: [
      `🚗 Driver sedang dalam perjalanan, ${p.passengerName}!`,
      ``,
      `Driver *${p.driverName ?? '-'}* menuju titik jemputmu.`,
      `Estimasi tiba: ${p.estimatedArrival ?? '-'}`,
      ``,
      `Pantau posisi: ${trackingUrl}`,
    ].join('\n'),

    trip_completed: [
      `✅ Perjalanan selesai! Terima kasih, ${p.passengerName}.`,
      ``,
      `${p.origin} → ${p.destination} telah tuntas.`,
      `Bagikan pengalamanmu dengan memberi rating! ⭐`,
      ticketUrl,
    ].join('\n'),
  }

  return templates[event]
}

export async function sendWhatsApp(
  to: string,
  event: WAEvent,
  params: WAParams,
): Promise<{ success: boolean; mock?: boolean; error?: string }> {
  const phone   = normalizePhone(to)
  const message = buildMessage(event, params)

  if (isMockMode) {
    console.log(`[WA MOCK] To: ${phone} | Event: ${event}`)
    console.log(`[WA MOCK] Message:\n${message}\n`)
    return { success: true, mock: true }
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to:   phone,
          type: 'text',
          text: { body: message },
        }),
      },
    )
    const data = await res.json() as { error?: { message?: string } }
    if (!res.ok) throw new Error(data.error?.message ?? 'WA API error')
    return { success: true }
  } catch (err) {
    console.error('[WA ERROR]', err)
    return { success: false, error: String(err) }
  }
}
