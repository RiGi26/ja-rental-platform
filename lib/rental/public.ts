// ============================================================
// lib/rental/public.ts — helper endpoint booking PUBLIK (tanpa sesi).
// Tenant di-resolve dari slug (tabel `tenants`, DB rental/mmwud) lalu digate
// entitlement `selfdrive` + `online_payment` (booking web = bayar penuh Midtrans).
// ============================================================
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { guardEntitlementApi } from '@/lib/tenant-entitlements'

export type PublicTenant = { id: string; name: string; slug: string }

/** Status kendaraan yang boleh tampil & dibooking publik. `on_trip` tetap tampil —
 *  unit yang jalan hari ini masih bisa dibooking untuk tanggal lain; ketersediaan
 *  per-tanggal ditangani endpoint availability, bukan status operasional. */
export const PUBLIC_VEHICLE_STATUSES = ['available', 'on_trip']

export async function resolvePublicTenant(
  db: SupabaseClient,
  slug: string,
): Promise<{ tenant: PublicTenant } | { response: NextResponse }> {
  const clean = (slug ?? '').trim()
  if (!clean || clean.length > 64) {
    return { response: NextResponse.json({ error: 'not_found' }, { status: 404 }) }
  }

  const { data: tenant } = await db
    .from('tenants')
    .select('id, name, slug, status')
    .eq('slug', clean)
    .maybeSingle()

  if (!tenant) return { response: NextResponse.json({ error: 'not_found' }, { status: 404 }) }
  if (tenant.status === 'suspended') {
    return { response: NextResponse.json({ error: 'tenant_suspended' }, { status: 403 }) }
  }

  for (const key of ['selfdrive', 'online_payment'] as const) {
    const guard = await guardEntitlementApi(tenant.id as string, key)
    if (guard) return { response: guard }
  }

  return { tenant: { id: tenant.id as string, name: tenant.name as string, slug: tenant.slug as string } }
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function isIsoDate(s: string): boolean {
  return DATE_RE.test(s) && !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime())
}

/** Tanggal "hari ini" menurut zona operasional (WIB), format YYYY-MM-DD. */
export function todayJakarta(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
