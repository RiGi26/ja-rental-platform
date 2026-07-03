'use server'

import { revalidatePath } from 'next/cache'
import { createRentalServiceClient } from '@/lib/supabase/service'
import { getOnboardingContext } from '@/lib/onboarding/state'

// ============================================================
// Onboarding state mutations. Scoped to the resolved user via
// getOnboardingContext() (Core-hub identity); silently no-ops when there is no
// admin-capable session. Writes go to the RENTAL DB via the service client — the
// standard ops-write pattern in this repo — keyed strictly on the context userId.
// (The table has RLS enabled with no policies: service-role only by design, since
// browser sessions are jexp-issued and never authenticate against mmwud.)
// ============================================================

type Patch = {
  welcome_dismissed_at?: string
  tour_completed_at?: string
  checklist_dismissed_at?: string
  completed_steps?: string[]
  seen_coachmarks?: string[]
}

async function upsertOnboarding(patch: Patch): Promise<{ error?: string; success?: boolean }> {
  const ctx = await getOnboardingContext()
  if (!ctx) return { success: true } // no session → nothing to persist

  const db = createRentalServiceClient()
  const { error } = await db
    .from('user_onboarding')
    .upsert(
      {
        user_id: ctx.userId,
        tenant_id: ctx.tenantId,
        updated_at: new Date().toISOString(),
        ...patch,
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('upsertOnboarding error:', error)
    return { error: 'Gagal menyimpan status onboarding.' }
  }
  revalidatePath('/admin')
  return { success: true }
}

/** Dismiss the one-time welcome modal. */
export async function dismissWelcome() {
  return upsertOnboarding({ welcome_dismissed_at: new Date().toISOString() })
}

/** Mark the product tour as seen/skipped so it doesn't auto-run again. */
export async function completeTour() {
  return upsertOnboarding({ tour_completed_at: new Date().toISOString() })
}

/** Hide the "Misi Pertama" checklist for this user. */
export async function dismissChecklist() {
  return upsertOnboarding({ checklist_dismissed_at: new Date().toISOString() })
}

/** Mark a manual (non-derived) checklist step complete. */
export async function markStepDone(key: string) {
  if (!key || typeof key !== 'string') return { error: 'Langkah tidak valid.' }

  const ctx = await getOnboardingContext()
  if (!ctx) return { success: true }

  const db = createRentalServiceClient()
  const { data } = await db
    .from('user_onboarding')
    .select('completed_steps')
    .eq('user_id', ctx.userId)
    .maybeSingle()

  const current: string[] = Array.isArray(data?.completed_steps) ? (data!.completed_steps as string[]) : []
  if (current.includes(key)) return { success: true }

  return upsertOnboarding({ completed_steps: [...current, key] })
}

/** Mark a one-time contextual coachmark (or feature announcement) as seen. */
export async function markCoachmarkSeen(key: string) {
  if (!key || typeof key !== 'string') return { error: 'Key tidak valid.' }

  const ctx = await getOnboardingContext()
  if (!ctx) return { success: true }

  const db = createRentalServiceClient()
  const { data } = await db
    .from('user_onboarding')
    .select('seen_coachmarks')
    .eq('user_id', ctx.userId)
    .maybeSingle()

  const current: string[] = Array.isArray(data?.seen_coachmarks) ? (data!.seen_coachmarks as string[]) : []
  if (current.includes(key)) return { success: true }

  return upsertOnboarding({ seen_coachmarks: [...current, key] })
}
