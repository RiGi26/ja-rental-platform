// ============================================================
// POST /api/booking/[slug]/submit — buat booking rental dari situs publik.
// Bayar PENUH via Midtrans Snap: insert bookings(pending_payment) + rental_details
// + payments(pending), lalu balikan redirect_url Snap. Konfirmasi jadi paid/confirmed
// lewat webhook /api/webhooks/midtrans (sudah type-agnostic) atau lazy via
// /api/payment/check-status/[bookingCode] yang dipoll halaman status situs.
//
// Harga & durasi dihitung server-side (JANGAN percaya angka dari browser).
// Anti-race: re-check bentrok setelah insert; kalah cepat → rollback + 409.
// Booking tak dibayar kedaluwarsa 2 jam (trigger set_booking_code ↔ Snap expiry 2h)
// dan otomatis melepas kalender (fetchBookedRanges melewati pending kedaluwarsa).
// ============================================================
import { NextResponse } from 'next/server'
import { createRentalServiceClient } from '@/lib/supabase/service'
import { resolvePublicTenant, PUBLIC_VEHICLE_STATUSES, isIsoDate, todayJakarta } from '@/lib/rental/public'
import { fetchBookedRanges, findOverlap, genBookingCode } from '@/lib/rental/booking'
import { rateLimit, clientIp, tooManyRequests } from '@/lib/rate-limit'
import { createSnapToken, isMockMode } from '@/lib/midtrans'
import { daysBetween } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const MAX_RENTAL_DAYS = 30
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// finish URL hanya boleh balik ke domain milik kita (situs tenant / preview Vercel).
const RETURN_URL_RE = /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.(webzoka\.com|vercel\.app)(\/[^\s]*)?$/i

function bad(msg: string): NextResponse {
  return NextResponse.json({ error: msg }, { status: 400 })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const rl = rateLimit(`pub-submit:${clientIp(req)}`, 5, 60_000)
  if (!rl.allowed) return tooManyRequests(rl.retryAfter)

  const { slug } = await params

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return bad('Body tidak valid.')
  }

  // Honeypot — field "website" tak pernah diisi manusia (hidden di form).
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return bad('Body tidak valid.')
  }

  const vehicleId = String(body.vehicle_id ?? '')
  const mode = String(body.mode ?? '')
  const startDate = String(body.start_date ?? '')
  const endDate = String(body.end_date ?? '')
  const renterName = String(body.renter_name ?? '').trim()
  const renterPhone = String(body.renter_phone ?? '').trim()
  const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 500) || null : null
  const returnUrl = typeof body.return_url === 'string' ? body.return_url : ''

  if (!UUID_RE.test(vehicleId)) return bad('Kendaraan tidak valid.')
  if (mode !== 'self_drive' && mode !== 'with_driver') return bad('Mode sewa tidak valid.')
  if (!isIsoDate(startDate) || !isIsoDate(endDate)) return bad('Format tanggal tidak valid.')
  const today = todayJakarta()
  if (startDate < today) return bad('Tanggal mulai sudah lewat.')
  if (endDate < startDate) return bad('Tanggal selesai tidak boleh sebelum tanggal mulai.')
  const days = Math.max(1, daysBetween(startDate, endDate))
  if (days > MAX_RENTAL_DAYS) return bad(`Durasi sewa maksimal ${MAX_RENTAL_DAYS} hari.`)
  if (renterName.length < 3 || renterName.length > 80) return bad('Nama lengkap 3–80 karakter.')
  const phoneDigits = renterPhone.replace(/\D/g, '')
  if (phoneDigits.length < 9 || phoneDigits.length > 15) return bad('Nomor WhatsApp tidak valid.')

  const db = createRentalServiceClient()
  const resolved = await resolvePublicTenant(db, slug)
  if ('response' in resolved) return resolved.response
  const tenant = resolved.tenant

  const { data: vehicle } = await db
    .from('vehicles')
    .select('id, brand, model, plate, status, price_per_day')
    .eq('id', vehicleId)
    .eq('tenant_id', tenant.id)
    .maybeSingle()
  if (!vehicle) return NextResponse.json({ error: 'Kendaraan tidak ditemukan.' }, { status: 404 })

  const dailyRate = Number(vehicle.price_per_day) || 0
  if (!PUBLIC_VEHICLE_STATUSES.includes(vehicle.status as string) || dailyRate <= 0) {
    return NextResponse.json({ error: 'Kendaraan sedang tidak bisa dibooking.' }, { status: 422 })
  }
  const total = days * dailyRate

  const preRanges = await fetchBookedRanges(db, { tenantId: tenant.id, vehicleId })
  const conflict = findOverlap(preRanges, startDate, endDate)
  if (conflict) {
    return NextResponse.json({ error: 'date_conflict', conflict }, { status: 409 })
  }

  const bookingCode = genBookingCode()
  const { data: booking, error: bErr } = await db
    .from('bookings')
    .insert({
      tenant_id: tenant.id,
      type: 'rental',
      vehicle_id: vehicleId,
      status: 'pending_payment',
      payment_status: 'pending',
      booking_code: bookingCode,
      total,
      total_amount: total,
      seats: [],
      source: 'web',
    })
    .select('id, expires_at')
    .single()
  if (bErr || !booking) {
    console.error('[booking/submit] insert booking:', bErr)
    return NextResponse.json({ error: 'Gagal membuat booking. Coba lagi.' }, { status: 500 })
  }

  const rollback = async () => {
    await db.from('rental_details').delete().eq('booking_id', booking.id)
    await db.from('bookings').delete().eq('id', booking.id).eq('tenant_id', tenant.id)
  }

  const { error: rErr } = await db.from('rental_details').insert({
    booking_id: booking.id,
    mode,
    start_date: startDate,
    end_date: endDate,
    daily_rate: dailyRate,
    deposit_amount: 0,
    deposit_status: 'held',
    renter_name: renterName,
    renter_phone: renterPhone,
    notes,
  })
  if (rErr) {
    await rollback()
    console.error('[booking/submit] insert rental_details:', rErr)
    return NextResponse.json({ error: 'Gagal menyimpan detail sewa. Coba lagi.' }, { status: 500 })
  }

  // Anti-race optimistic: dua submit bersamaan bisa sama-sama lolos cek awal;
  // yang kalah mundur di sini.
  const postRanges = await fetchBookedRanges(db, {
    tenantId: tenant.id,
    vehicleId,
    excludeBookingId: booking.id as string,
  })
  const race = findOverlap(postRanges, startDate, endDate)
  if (race) {
    await rollback()
    return NextResponse.json({ error: 'date_conflict', conflict: race }, { status: 409 })
  }

  const vehicleLabel = `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim() || (vehicle.plate as string)
  const finishUrl = RETURN_URL_RE.test(returnUrl) ? returnUrl : undefined

  let snapToken = ''
  let redirectUrl = ''
  try {
    const snap = await createSnapToken({
      orderId: bookingCode,
      amount: total,
      customerName: renterName,
      customerEmail: '',
      customerPhone: phoneDigits,
      items: [{
        id: vehicle.id as string,
        // Midtrans membatasi nama item 50 karakter.
        name: `Sewa ${vehicleLabel} ${days} hari`.slice(0, 50),
        price: total,
        quantity: 1,
      }],
      finishUrl,
    })
    snapToken = snap.token
    redirectUrl = snap.redirectUrl
  } catch (err) {
    await rollback()
    console.error('[booking/submit] snap error:', err)
    return NextResponse.json({ error: 'Gagal membuka pembayaran. Coba lagi.' }, { status: 502 })
  }

  // Mode mock (tanpa server key): redirect travel-shaped tidak relevan utk rental —
  // langsung ke halaman status situs (booking tetap pending_payment).
  if (isMockMode && finishUrl) redirectUrl = finishUrl

  const { error: pErr } = await db.from('payments').insert({
    booking_id: booking.id,
    amount: total,
    status: 'pending',
    snap_token: snapToken || null,
  })
  if (pErr) console.error('[booking/submit] insert payments (non-fatal):', pErr)

  return NextResponse.json(
    {
      booking_code: bookingCode,
      total,
      days,
      daily_rate: dailyRate,
      redirect_url: redirectUrl,
      expires_at: booking.expires_at ?? null,
      is_mock: isMockMode,
    },
    { status: 201 },
  )
}
