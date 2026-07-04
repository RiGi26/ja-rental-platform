// ============================================================
// GET /api/booking/[slug]/info — profil tenant + armada untuk situs publik
// (Website Builder). Tanpa sesi; gate entitlement di resolvePublicTenant.
// Dipanggil browser via proxy same-origin di WB (tanpa CORS).
// ============================================================
import { NextResponse } from 'next/server'
import { createRentalServiceClient } from '@/lib/supabase/service'
import { resolvePublicTenant, PUBLIC_VEHICLE_STATUSES } from '@/lib/rental/public'
import { rateLimit, clientIp, tooManyRequests } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const rl = rateLimit(`pub-info:${clientIp(req)}`, 60, 60_000)
  if (!rl.allowed) return tooManyRequests(rl.retryAfter)

  const { slug } = await params
  const db = createRentalServiceClient()

  const resolved = await resolvePublicTenant(db, slug)
  if ('response' in resolved) return resolved.response

  const { data: vehicles, error } = await db
    .from('vehicles')
    .select('id, brand, model, type, capacity, year, transmission, fuel_type, description, photos, price_per_day')
    .eq('tenant_id', resolved.tenant.id)
    .in('status', PUBLIC_VEHICLE_STATUSES)
    .gt('price_per_day', 0)
    .order('price_per_day', { ascending: true })

  if (error) {
    console.error('[booking/info]', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }

  return NextResponse.json(
    {
      tenant: { name: resolved.tenant.name, slug: resolved.tenant.slug },
      modes: ['self_drive', 'with_driver'],
      vehicles: (vehicles ?? []).map((v) => ({
        id: v.id,
        brand: v.brand ?? null,
        model: v.model ?? null,
        type: v.type,
        capacity: v.capacity,
        year: v.year ?? null,
        transmission: v.transmission ?? null,
        fuel_type: v.fuel_type ?? null,
        description: v.description ?? null,
        photos: (v.photos as string[] | null) ?? [],
        price_per_day: Number(v.price_per_day) || 0,
      })),
    },
    { headers: { 'cache-control': 'no-store' } },
  )
}
