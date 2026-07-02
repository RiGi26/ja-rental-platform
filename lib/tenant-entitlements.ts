// ============================================================
// lib/tenant-entitlements.ts — server-side tier gating for the Travel & Rental
// admin portal.
//
// Resolves a tenant's entitlement row (mirrored from Core into the Rental DB's
// `tenant_entitlements` table) and exposes a page guard + an API/action guard +
// a fleet-seat guard.
//
// Dual-DB note: the tenant id comes from the Core JWT claim (auth hub), but
// `tenant_entitlements` + `vehicles` live in the Rental DB (same DB as `tenants`),
// so both are read via createRentalServiceClient().
//
// A tenant WITHOUT a row falls back to ALL_FEATURES with status 'legacy' → keeps
// its exact current access (behaviour-preserving). Only synced tenants get gated.
// A missing table (migration not yet applied) also resolves to legacy — safe.
// ============================================================
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { createCoreClient } from '@/lib/supabase/server'
import { createCoreServiceClient, createRentalServiceClient } from '@/lib/supabase/service'
import {
  ALL_FEATURES,
  FEATURE_LABEL,
  isSubscriptionActive,
  tierSeatLimit,
  type EntitlementKey,
} from '@/lib/entitlements'

export type TenantEntitlements = {
  tier: string | null
  entitlements: EntitlementKey[]
  /** Active fleet/unit quota; null = unlimited. */
  maxActiveUnits: number | null
  /** active | trialing | trial | past_due | suspended | cancelled | expired | legacy */
  status: string
}

const LEGACY: TenantEntitlements = {
  tier: null,
  entitlements: ALL_FEATURES,
  maxActiveUnits: null,
  status: 'legacy',
}

export type ActiveMember = { tenantId: string; role: string | null }

/**
 * Resolve the active tenant + role for the logged-in user. JWT-first (claims injected
 * by the jexp custom_access_token hook), with a DB fallback to jexp tenant_members
 * when the hook isn't injecting claims — same resilience the /admin layouts use, so
 * billing works whether or not the auth hook is enabled. Returns null when there is
 * no session or the user isn't a member of any tenant.
 */
export const getActiveMember = cache(async (): Promise<ActiveMember | null> => {
  const supabase = await createCoreClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return null

  // JWT-first.
  try {
    const payload = JSON.parse(atob(session.access_token.split('.')[1]))
    const tid = (payload.tenant_id ?? payload.linked_tenant_id) as string | undefined
    if (tid) return { tenantId: tid, role: (payload.user_role as string) ?? null }
  } catch {
    /* fall through to DB */
  }

  // Fallback: hook not injecting claims → read tenant_members from the auth hub (jexp).
  const uid = session.user?.id
  if (!uid) return null
  const core = createCoreServiceClient()
  const { data } = await core
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', uid)
    .maybeSingle()
  if (!data?.tenant_id) return null
  return { tenantId: data.tenant_id as string, role: (data.role as string) ?? null }
})

/** Resolve the active tenant id (JWT claim or jexp tenant_members fallback). */
export const getActiveTenantId = cache(async (): Promise<string | null> => {
  return (await getActiveMember())?.tenantId ?? null
})

/**
 * Resolve a tenant's entitlement cache. Wrapped in React cache() so the layout
 * (nav) and the page guard share one DB round-trip per request. Reads via the
 * Rental service-role client (bypasses RLS). A missing row OR a missing table
 * (migration not yet applied) → LEGACY (full access), so shipping the code before
 * the migration is non-breaking.
 */
export const getTenantEntitlements = cache(async (tenantId: string): Promise<TenantEntitlements> => {
  if (!tenantId) return LEGACY
  const db = createRentalServiceClient()
  const { data, error } = await db
    .from('tenant_entitlements')
    .select('tier, entitlements, max_active_units, status')
    .eq('tenant_id', tenantId)
    .maybeSingle()

  if (error || !data) return LEGACY

  return {
    tier: (data.tier as string) ?? null,
    entitlements: (data.entitlements as EntitlementKey[]) ?? [],
    maxActiveUnits: (data.max_active_units as number | null) ?? null,
    status: (data.status as string) ?? 'active',
  }
})

/** Pure check: does this resolved tenant hold the given feature (and is it in good standing)? */
export function hasEntitlement(ent: TenantEntitlements, key: EntitlementKey): boolean {
  return isSubscriptionActive(ent.status) && ent.entitlements.includes(key)
}

/**
 * Page guard for an /admin server component. Resolves the tenant from the session,
 * then requires the feature or redirects to /admin with an upsell/billing query
 * param (UpsellBanner picks it up). Returns the resolved entitlements for reuse.
 *
 *   await assertEntitled('reports')
 */
export async function assertEntitled(
  key: EntitlementKey,
  redirectTo = '/admin',
): Promise<TenantEntitlements> {
  const tenantId = await getActiveTenantId()
  // No tenant resolvable (e.g. JWT hook not active) → don't gate (auth layer handles access).
  if (!tenantId) return LEGACY

  const ent = await getTenantEntitlements(tenantId)
  if (!isSubscriptionActive(ent.status)) {
    redirect(`${redirectTo}?billing=${ent.status}`)
  }
  if (!ent.entitlements.includes(key)) {
    redirect(`${redirectTo}?upsell=${key}`)
  }
  return ent
}

/**
 * Action/route guard. Returns a ready 403 NextResponse when the tenant lacks the
 * feature (or the subscription is not in good standing), otherwise null — so a route
 * handler can do:  const g = await guardEntitlementApi(tenantId, 'online_payment'); if (g) return g
 *
 * Takes an explicit tenantId because customer-facing routes (payment, notify)
 * derive the tenant from the booking, not from an admin session.
 */
export async function guardEntitlementApi(
  tenantId: string,
  key: EntitlementKey,
): Promise<NextResponse | null> {
  const ent = await getTenantEntitlements(tenantId)
  if (!isSubscriptionActive(ent.status)) {
    return NextResponse.json(
      { error: 'Langganan sedang tidak aktif. Perbarui pembayaran untuk melanjutkan.', billing: ent.status },
      { status: 403 },
    )
  }
  if (!ent.entitlements.includes(key)) {
    return NextResponse.json(
      {
        error: `Fitur "${FEATURE_LABEL[key] ?? key}" tidak tersedia di paket langganan tenant ini.`,
        upsell: key,
      },
      { status: 403 },
    )
  }
  return null
}

/**
 * Block adding a vehicle once the tenant's fleet quota (TIER_SEATS) is hit.
 * Returns a ready 403 or null. Legacy tenants (no entitlement row) and Pro (null
 * limit) are unlimited — behaviour-preserving. Uses the synced max_active_units
 * when present, else the tier default. (Ready for when a vehicle-create flow ships.)
 */
export async function guardVehicleSeat(tenantId: string): Promise<NextResponse | null> {
  const ent = await getTenantEntitlements(tenantId)
  if (!isSubscriptionActive(ent.status)) {
    return NextResponse.json(
      { error: 'Langganan sedang tidak aktif.', billing: ent.status },
      { status: 403 },
    )
  }
  if (ent.status === 'legacy') return null // never billed here → unlimited

  const limit = ent.maxActiveUnits ?? tierSeatLimit(ent.tier)
  if (limit == null) return null // Pro / unlimited

  const db = createRentalServiceClient()
  const { count } = await db
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  if ((count ?? 0) >= limit) {
    return NextResponse.json(
      {
        error: `Kuota armada paket Anda (${limit}) sudah penuh. Tingkatkan paket untuk menambah kendaraan.`,
        upsell: 'fleet',
      },
      { status: 403 },
    )
  }
  return null
}
