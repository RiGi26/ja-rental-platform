import type { createRentalServiceClient } from '@/lib/supabase/service'
import type { EntitlementKey } from '@/lib/entitlements'

// ============================================================
// Onboarding "Misi Pertama" — step catalogue (SSOT).
// The rental admin area is reached only by admin/owner/superadmin, so only the
// owner track has steps; the operator track is empty (checklist hidden). All owner
// steps are DERIVED from real tenant data so the checklist can never lie.
// Steps are further filtered by tenant entitlements at read time (see state.ts).
// ============================================================

type SB = ReturnType<typeof createRentalServiceClient>

export type OnboardingTrack = 'owner' | 'operator'

export interface StepDef {
  key: string
  title: string
  desc: string
  ctaLabel: string
  href: string
  /** Only show this step when the tenant holds this entitlement (omit = always). */
  feature?: EntitlementKey
  /** Derived completion check against real tenant data (Rental DB). */
  resolver?: (db: SB, tenantId: string) => Promise<boolean>
}

// ---- derived resolvers (Rental service client + explicit tenant filter — the
// standard ops-query pattern in this repo) ----

function hasRows(table: string) {
  return async (db: SB, tenantId: string): Promise<boolean> => {
    const { count } = await db
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
    return (count ?? 0) > 0
  }
}

// ---- step catalogues per track ----

const OWNER_STEPS: StepDef[] = [
  {
    key: 'add_vehicle',
    title: 'Input armada pertama',
    desc: 'Masukkan minimal satu kendaraan supaya bisa mulai menerima booking.',
    ctaLabel: 'Buka armada',
    href: '/admin/fleet',
    feature: 'fleet',
    resolver: hasRows('vehicles'),
  },
  {
    key: 'add_route',
    title: 'Buat rute tetap',
    desc: 'Tentukan rute perjalanan yang kamu layani beserta tarifnya.',
    ctaLabel: 'Buka rute',
    href: '/admin/routes',
    feature: 'routes',
    resolver: hasRows('routes'),
  },
  {
    key: 'add_driver',
    title: 'Daftarkan driver',
    desc: 'Tambahkan driver yang akan menjalankan armada dan jadwalmu.',
    ctaLabel: 'Buka driver',
    href: '/admin/drivers',
    feature: 'drivers',
    resolver: hasRows('drivers'),
  },
  {
    key: 'first_booking',
    title: 'Catat booking pertama',
    desc: 'Buat atau terima satu booking untuk menyelesaikan penyiapan.',
    ctaLabel: 'Buka booking',
    href: '/admin/bookings',
    feature: 'booking',
    resolver: hasRows('bookings'),
  },
]

export const STEPS_BY_TRACK: Record<OnboardingTrack, StepDef[]> = {
  owner: OWNER_STEPS,
  operator: [],
}

/** Map a portal role to an onboarding track. Only admin/owner/superadmin reach /admin. */
export function trackForRole(role: string): OnboardingTrack {
  return role === 'admin' || role === 'owner' || role === 'superadmin' ? 'owner' : 'operator'
}
