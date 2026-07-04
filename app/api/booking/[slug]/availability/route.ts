// ============================================================
// GET /api/booking/[slug]/availability?vehicle_id=&from=&to=
// Rentang tanggal yang sudah tersewa untuk satu unit (kalender wizard men-disable
// tanggal ini). pending_payment kedaluwarsa tidak dihitung (lihat lib/rental/booking).
// ============================================================
import { NextResponse } from 'next/server'
import { createRentalServiceClient } from '@/lib/supabase/service'
import { resolvePublicTenant, isIsoDate, todayJakarta, addDays } from '@/lib/rental/public'
import { fetchBookedRanges } from '@/lib/rental/booking'
import { rateLimit, clientIp, tooManyRequests } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const rl = rateLimit(`pub-avail:${clientIp(req)}`, 60, 60_000)
  if (!rl.allowed) return tooManyRequests(rl.retryAfter)

  const { slug } = await params
  const { searchParams } = new URL(req.url)

  const vehicleId = searchParams.get('vehicle_id') ?? ''
  if (!UUID_RE.test(vehicleId)) {
    return NextResponse.json({ error: 'vehicle_id tidak valid.' }, { status: 400 })
  }

  const from = searchParams.get('from') ?? todayJakarta()
  const to = searchParams.get('to') ?? addDays(from, 90)
  if (!isIsoDate(from) || !isIsoDate(to) || to < from || addDays(from, 366) < to) {
    return NextResponse.json({ error: 'Rentang tanggal tidak valid.' }, { status: 400 })
  }

  const db = createRentalServiceClient()
  const resolved = await resolvePublicTenant(db, slug)
  if ('response' in resolved) return resolved.response

  const { data: vehicle } = await db
    .from('vehicles')
    .select('id')
    .eq('id', vehicleId)
    .eq('tenant_id', resolved.tenant.id)
    .maybeSingle()
  if (!vehicle) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const ranges = await fetchBookedRanges(db, { tenantId: resolved.tenant.id, vehicleId })
  const booked = ranges.filter((r) => r.start_date <= to && r.end_date >= from)

  return NextResponse.json(
    { vehicle_id: vehicleId, from, to, booked },
    { headers: { 'cache-control': 'no-store' } },
  )
}
