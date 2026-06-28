import { NextResponse } from 'next/server'
import { createCoreClient } from '@/lib/supabase/server'
import { getActiveTenantId } from '@/lib/tenant-entitlements'
import { signBillingToken, superadminBaseUrl } from '@/lib/billing-link'

// ============================================================
// GET /api/billing/upgrade — mint a checkout token for the logged-in tenant and
// redirect to the superadmin payment page (mint side of the cross-DB billing link).
//
// Dual-DB: Core is the auth hub, so the JWT tenant_id claim IS the Core tenant id —
// mint directly from it. Admin/owner only; demo accounts can't subscribe.
// ============================================================
export const dynamic = 'force-dynamic'

const DEMO_EMAILS = new Set(['admin@demo.com', 'driver@demo.com'])

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const supabase = await createCoreClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login?next=/admin/langganan', origin))
  }

  // Role from JWT custom claims (injected by Core DB hook).
  const { data: { session } } = await supabase.auth.getSession()
  const claims = session?.access_token
    ? JSON.parse(atob(session.access_token.split('.')[1]))
    : {}
  const role = claims.user_role as string | undefined
  if (!['admin', 'owner', 'superadmin'].includes(role ?? '')) {
    return NextResponse.redirect(new URL('/admin/langganan?error=forbidden', origin))
  }

  if (user.email && DEMO_EMAILS.has(user.email)) {
    return NextResponse.redirect(new URL('/admin/langganan?error=demo', origin))
  }

  const coreTenantId = await getActiveTenantId()
  if (!coreTenantId) {
    return NextResponse.redirect(new URL('/admin/langganan?error=not_provisioned', origin))
  }

  let token: string
  try {
    token = signBillingToken(coreTenantId)
  } catch (err) {
    console.error('[billing/upgrade] mint token failed:', err instanceof Error ? err.message : err)
    return NextResponse.redirect(new URL('/admin/langganan?error=billing_link_unavailable', origin))
  }

  const dest = new URL('/billing/langganan', superadminBaseUrl())
  dest.searchParams.set('token', token)
  return NextResponse.redirect(dest)
}
