import { cache } from 'react'
import { createCoreClient } from '@/lib/supabase/server'
import { createRentalServiceClient } from '@/lib/supabase/service'
import { getActiveMember, getTenantEntitlements } from '@/lib/tenant-entitlements'
import { STEPS_BY_TRACK, trackForRole, type OnboardingTrack } from './steps'

// ============================================================
// Onboarding state — computed server-side on admin load. Derived steps run their
// real-data resolvers in parallel; wrapped in React cache() so the layout (launcher
// flags) and the dashboard page (full checklist) share one computation per request.
//
// Dual-DB: identity comes from the Core hub (jexp) via getActiveMember(); the
// user_onboarding table + ops tables live in the Rental DB (mmwud) and are read
// via the service client — same split as tenant_entitlements.
// ============================================================

/** JaTravel Demo — shared demo tenant (same-id across jexp/mmwud). */
const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001'

export interface ChecklistItem {
  key: string
  title: string
  desc: string
  ctaLabel: string
  href: string
  done: boolean
  /** true = completion is marked by the user (not derived from data) */
  manual: boolean
}

export interface OnboardingState {
  track: OnboardingTrack
  items: ChecklistItem[]
  total: number
  completed: number
  progress: number // 0..100
  allDone: boolean
  checklistVisible: boolean
  showWelcome: boolean
  showTour: boolean
}

interface OnboardingContext {
  userId: string
  tenantId: string
  isDemo: boolean
  entitlements: string[]
}

const EMPTY_STATE: OnboardingState = {
  track: 'owner',
  items: [],
  total: 0,
  completed: 0,
  progress: 0,
  allDone: false,
  checklistVisible: false,
  showWelcome: false,
  showTour: false,
}

/** Resolved onboarding context, or null when there is no admin-capable session. */
export const getOnboardingContext = cache(async (): Promise<OnboardingContext | null> => {
  const supabase = await createCoreClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const member = await getActiveMember()
  if (!member?.tenantId) return null

  const ent = await getTenantEntitlements(member.tenantId)

  return {
    userId: user.id,
    tenantId: member.tenantId,
    isDemo: member.tenantId === DEMO_TENANT_ID,
    entitlements: ent.entitlements,
  }
})

/** Keys of contextual coachmarks / feature announcements this user has already seen. */
export const getSeenCoachmarks = cache(async (): Promise<string[]> => {
  const ctx = await getOnboardingContext()
  if (!ctx) return []

  const db = createRentalServiceClient()
  const { data } = await db
    .from('user_onboarding')
    .select('seen_coachmarks')
    .eq('user_id', ctx.userId)
    .maybeSingle()
  return Array.isArray(data?.seen_coachmarks) ? (data!.seen_coachmarks as string[]) : []
})

export const getOnboardingState = cache(async (): Promise<OnboardingState> => {
  const ctx = await getOnboardingContext()
  if (!ctx) return EMPTY_STATE

  const track = trackForRole('admin')
  const defs = STEPS_BY_TRACK[track].filter(
    (s) => !s.feature || ctx.entitlements.includes(s.feature)
  )

  const db = createRentalServiceClient()
  const { data: row, error } = await db
    .from('user_onboarding')
    .select('completed_steps, welcome_dismissed_at, tour_completed_at, checklist_dismissed_at')
    .eq('user_id', ctx.userId)
    .maybeSingle()

  // Missing table (migration not yet applied) → stay silent instead of greeting
  // every request; mirrors the tenant_entitlements "safe before migration" pattern.
  if (error) return EMPTY_STATE

  const showWelcome = !row?.welcome_dismissed_at
  const showTour = !row?.tour_completed_at
  const checklistDismissed = !!row?.checklist_dismissed_at

  // Skip the checklist entirely when:
  //  - demo tenant: data is pre-seeded, a "misi pertama" reads as ~done and confuses
  //    prospects — demo keeps only welcome + tour (feature discovery);
  //  - already dismissed: never show again, and skip the resolver queries;
  //  - no applicable steps for this track/entitlements.
  if (ctx.isDemo || checklistDismissed || defs.length === 0) {
    return { ...EMPTY_STATE, track, showWelcome, showTour }
  }

  const completedManual: string[] = Array.isArray(row?.completed_steps)
    ? (row!.completed_steps as string[])
    : []

  // Derived resolvers are independent → run in parallel.
  const resolved = await Promise.all(
    defs.map((d) => (d.resolver ? d.resolver(db, ctx.tenantId) : Promise.resolve<boolean | null>(null)))
  )

  const items: ChecklistItem[] = defs.map((d, i) => {
    const manual = !d.resolver
    const done = manual ? completedManual.includes(d.key) : !!resolved[i]
    return { key: d.key, title: d.title, desc: d.desc, ctaLabel: d.ctaLabel, href: d.href, done, manual }
  })

  const total = items.length
  const completed = items.filter((i) => i.done).length
  const allDone = total > 0 && completed === total

  return {
    track,
    items,
    total,
    completed,
    progress: total ? Math.round((completed / total) * 100) : 0,
    allDone,
    checklistVisible: !allDone,
    showWelcome,
    showTour,
  }
})
