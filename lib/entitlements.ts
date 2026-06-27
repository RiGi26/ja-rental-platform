// ============================================================
// lib/entitlements.ts — fine-grained per-tier feature contract for the
// Travel & Rental portal.
//
// Source of truth for the SHAPE of features. The actual tier a tenant holds is
// mirrored from the superadmin Core DB into the `tenant_entitlements` table (see
// lib/tenant-entitlements.ts). This file just defines which features each tier
// grants, plus seat limits and helpers. Server-only-safe (no client imports).
//
// Owner-approved matrix (TIER_MATRIX_PROPOSAL — "Portal Travel & Rental"):
//   Starter : armada + reminder servis, rute & jadwal, booking + konfirmasi
//             bayar manual, e-ticket & invoice PDF (QR), driver roster + rating · 5 armada
//   Growth  : + pembayaran online (Midtrans), notifikasi WhatsApp, laporan
//             & analitik                                                         · 25 armada
//   Pro     : + GPS live tracking, modul rental self-drive (deposit),
//             custom domain / white-label                                        · ∞ armada
//   Trial = akses penuh setara Pro. Tier kumulatif.
// ============================================================

export type EntitlementKey =
  // ── Starter (baseline, always granted) ──
  | 'fleet'           // manajemen armada + reminder servis
  | 'routes'          // rute & jadwal tetap
  | 'schedules'       // jadwal keberangkatan
  | 'booking'         // booking + konfirmasi bayar manual
  | 'eticket'         // e-ticket & invoice PDF (QR)
  | 'drivers'         // driver roster + rating
  // ── Growth ──
  | 'online_payment'  // pembayaran online (Midtrans)
  | 'wa_notif'        // notifikasi WhatsApp otomatis
  | 'reports'         // laporan & analitik
  // ── Pro ──
  | 'gps_tracking'    // GPS live tracking
  | 'selfdrive'       // modul rental self-drive (deposit)
  | 'white_label'     // custom domain / white-label

export type PlanTier = 'starter' | 'growth' | 'pro'

const STARTER: EntitlementKey[] = ['fleet', 'routes', 'schedules', 'booking', 'eticket', 'drivers']
const GROWTH: EntitlementKey[] = ['online_payment', 'wa_notif', 'reports']
const PRO: EntitlementKey[] = ['gps_tracking', 'selfdrive', 'white_label']

/** Cumulative feature set per tier (each tier includes the lower tiers'). */
export const TIER_FEATURES: Record<PlanTier, EntitlementKey[]> = {
  starter: STARTER,
  growth: [...STARTER, ...GROWTH],
  pro: [...STARTER, ...GROWTH, ...PRO],
}

/** Every key — granted to tenants without an entitlement row (legacy/full access). */
export const ALL_FEATURES: EntitlementKey[] = [...STARTER, ...GROWTH, ...PRO]

/** Active fleet/unit quota per tier (null = unlimited). */
export const TIER_SEATS: Record<PlanTier, number | null> = {
  starter: 5,
  growth: 25,
  pro: null,
}

export const DEFAULT_TIER: PlanTier = 'starter'

export function isPlanTier(tier: string | null | undefined): tier is PlanTier {
  return tier === 'starter' || tier === 'growth' || tier === 'pro'
}

export function tierFeatures(tier: string | null | undefined): EntitlementKey[] {
  return isPlanTier(tier) ? TIER_FEATURES[tier] : TIER_FEATURES[DEFAULT_TIER]
}

export function tierSeatLimit(tier: string | null | undefined): number | null {
  return isPlanTier(tier) ? TIER_SEATS[tier] : TIER_SEATS[DEFAULT_TIER]
}

// ────────────────────────────────────────────────────────────
// Core → travel tier map. Core's superadmin plans use a different vocabulary
// (starter/pro/enterprise) than the travel portal display (Starter/Growth/Pro).
//   Core starter     → travel starter (display "Starter")
//   Core pro         → travel growth  (display "Growth")
//   Core enterprise  → travel pro     (display "Pro")
// ────────────────────────────────────────────────────────────
export function coreTierToTravel(coreTier: string | null | undefined): PlanTier {
  switch (coreTier) {
    case 'pro':
      return 'growth'
    case 'enterprise':
      return 'pro'
    case 'starter':
    default:
      return 'starter'
  }
}

// ────────────────────────────────────────────────────────────
// Subscription status — "good standing" lets a tenant use the features its tier
// grants. 'legacy' = tenants without a tenant_entitlements row (never synced) →
// always allowed. Anything not in this set (past_due/suspended/cancelled/expired)
// revokes gated features even if the entitlements array still lists them.
// ────────────────────────────────────────────────────────────
export const ACTIVE_STATUSES = new Set(['active', 'trialing', 'trial', 'legacy'])

export function isSubscriptionActive(status: string | null | undefined): boolean {
  return ACTIVE_STATUSES.has(status ?? 'legacy')
}

/** Human label per key (upsell banner, errors). */
export const FEATURE_LABEL: Record<EntitlementKey, string> = {
  fleet:          'Manajemen Armada',
  routes:         'Rute & Jadwal',
  schedules:      'Jadwal Keberangkatan',
  booking:        'Booking',
  eticket:        'E-Ticket & Invoice',
  drivers:        'Driver Roster',
  online_payment: 'Pembayaran Online',
  wa_notif:       'Notifikasi WhatsApp',
  reports:        'Laporan & Analitik',
  gps_tracking:   'GPS Live Tracking',
  selfdrive:      'Rental Self-Drive',
  white_label:    'Custom Domain / White-label',
}
