import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { createRentalServiceClient } from '@/lib/supabase/service'
import { generateQRDataURL } from '@/lib/utils/qr'
import { InvoicePDF } from '@/components/ticket/InvoicePDF'
import type { PickupPoint } from '@/lib/types'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookingCode: string }> }
) {
  try {
    const { bookingCode } = await params
    const supabase = createRentalServiceClient()

    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        booking_code, seats, total_amount, total, created_at,
        passengers(*),
        schedule:schedules(
          depart_at, price_adult, pickup_points,
          route:routes(origin, destination, duration_minutes),
          vehicle:vehicles(brand, model, plate)
        ),
        payment:payments(status, paid_at, method)
      `)
      .eq('booking_code', bookingCode)
      .single()

    if (!booking) {
      return new Response('Booking tidak ditemukan', { status: 404 })
    }

    const raw      = booking as Record<string, unknown>
    const schedule = raw.schedule as {
      depart_at: string
      price_adult: number
      pickup_points: PickupPoint[]
      route: { origin: string; destination: string; duration_minutes: number }
      vehicle: { brand: string; model: string; plate: string }
    } | null

    if (!schedule?.route || !schedule?.vehicle) {
      return new Response('Data jadwal tidak lengkap', { status: 422 })
    }

    const passengers = (raw.passengers ?? []) as {
      name: string
      phone: string
      seat_number: string
      pickup_point_id: string | null
    }[]

    const paymentRaw = raw.payment
    const payment = Array.isArray(paymentRaw)
      ? (paymentRaw[0] as { status: string; paid_at: string | null; method: string | null } | null) ?? null
      : paymentRaw as { status: string; paid_at: string | null; method: string | null } | null

    const totalAmount = (raw.total_amount as number | null) ?? (raw.total as number | null) ?? 0

    const qrDataUrl = await generateQRDataURL(bookingCode)

    const element = React.createElement(InvoicePDF, {
      booking: {
        booking_code: booking.booking_code as string,
        seats:        (raw.seats as string[]) ?? [],
        total_amount: totalAmount,
        created_at:   booking.created_at as string,
      },
      schedule: {
        depart_at:     schedule.depart_at,
        price_adult:   schedule.price_adult,
        pickup_points: schedule.pickup_points ?? [],
        route:         schedule.route,
        vehicle:       schedule.vehicle,
      },
      passengers,
      payment,
      qrDataUrl,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any

    const buffer = await renderToBuffer(element)

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${bookingCode}.pdf"`,
        'Cache-Control':       'no-store',
      },
    })
  } catch (err) {
    console.error('[ticket/invoice]', err)
    return new Response('Gagal generate invoice', { status: 500 })
  }
}
