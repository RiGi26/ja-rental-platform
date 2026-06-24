import React from 'react'
import { Resend } from 'resend'
import { BookingConfirmationEmail } from '@/emails/BookingConfirmationEmail'
import { PaymentReminderEmail } from '@/emails/PaymentReminderEmail'
import { DepartureReminderEmail } from '@/emails/DepartureReminderEmail'

// Lazy so build-time static analysis doesn't throw when env var is absent
function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    // Return a mock if key is missing (e.g. during build)
    return { emails: { send: async () => ({ data: null, error: { message: 'Missing API Key' } }) } } as any
  }
  return new Resend(key)
}

const FROM = process.env.RESEND_DOMAIN_VERIFIED === 'true'
  ? 'noreply@webzoka.com'
  : 'onboarding@resend.dev'

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

// ── Booking Confirmation ───────────────────────────────────────────────────────

export async function sendBookingConfirmationEmail(params: {
  to:            string
  passengerName: string
  bookingCode:   string
  origin:        string
  destination:   string
  departAt:      string
  pickupPoint:   string
  seats:         string[]
  totalAmount:   number
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const ticketUrl  = `${APP_URL}/booking/confirm/${params.bookingCode}`
  const invoiceUrl = `${APP_URL}/api/ticket/${params.bookingCode}/invoice`

  try {
    const { data, error } = await getResend().emails.send({
      from:    FROM,
      to:      params.to,
      subject: `✅ Konfirmasi Booking ${params.bookingCode} — ${params.origin} → ${params.destination}`,
      react:   React.createElement(BookingConfirmationEmail, { ...params, ticketUrl, invoiceUrl }),
    })
    if (error) {
      console.error('[EMAIL ERROR] booking_confirmation:', error)
      return { success: false, error: error.message }
    }
    console.log('[EMAIL SENT] booking_confirmation:', data?.id)
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('[EMAIL THROW] booking_confirmation:', err)
    return { success: false, error: String(err) }
  }
}

// ── Payment Reminder ───────────────────────────────────────────────────────────

export async function sendPaymentReminderEmail(params: {
  to:            string
  passengerName: string
  bookingCode:   string
  origin:        string
  destination:   string
  expiresAt:     string
}): Promise<{ success: boolean; error?: string }> {
  const paymentUrl = `${APP_URL}/booking/pay/${params.bookingCode}`
  const expiresAt  = formatDateTime(params.expiresAt)

  try {
    const { error } = await getResend().emails.send({
      from:    FROM,
      to:      params.to,
      subject: `⏰ Segera bayar booking ${params.bookingCode} sebelum kedaluwarsa`,
      react:   React.createElement(PaymentReminderEmail, { ...params, expiresAt, paymentUrl }),
    })
    if (error) {
      console.error('[EMAIL ERROR] payment_reminder:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    console.error('[EMAIL THROW] payment_reminder:', err)
    return { success: false, error: String(err) }
  }
}

// ── Departure Reminder ─────────────────────────────────────────────────────────

export async function sendDepartureReminderEmail(params: {
  to:            string
  passengerName: string
  bookingCode:   string
  origin:        string
  destination:   string
  departAt:      string
  pickupPoint:   string
}): Promise<{ success: boolean; error?: string }> {
  const trackingUrl = `${APP_URL}/tracking/${params.bookingCode}`
  const departAt    = formatDateTime(params.departAt)

  try {
    const { error } = await getResend().emails.send({
      from:    FROM,
      to:      params.to,
      subject: `🗓 Pengingat keberangkatan besok — ${params.origin} → ${params.destination}`,
      react:   React.createElement(DepartureReminderEmail, { ...params, departAt, trackingUrl }),
    })
    if (error) {
      console.error('[EMAIL ERROR] departure_reminder:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    console.error('[EMAIL THROW] departure_reminder:', err)
    return { success: false, error: String(err) }
  }
}
