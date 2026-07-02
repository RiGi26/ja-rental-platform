import { NextResponse } from 'next/server'
import { createCoreClient } from '@/lib/supabase/server'
import { createRentalServiceClient } from '@/lib/supabase/service'
import { getActiveTenantId } from '@/lib/tenant-entitlements'
import { signBillingToken, superadminBaseUrl } from '@/lib/billing-link'
import { provisionCoreTenant } from '@/lib/core-provision'

// ============================================================
// GET /api/billing/checkout?tier=starter|pro|enterprise&period=monthly|yearly
// Direct-pay per tier: mint a checkout token for the logged-in tenant's Core id,
// POST it to the superadmin checkout-self endpoint, and 302 straight to the Midtrans
// Snap page. This is the paid-CTA landing from /pricing (register → auto-login →
// here), distinct from /api/billing/upgrade which lands on the in-app plan picker.
//
// Provisioning backstop: ensures the tenant exists in Core (SAME-ID, idempotent)
// before minting, so a tenant whose register-time provisioning didn't land can still
// check out. Admin/owner only; demo accounts blocked. Midtrans runs in Core (SoR),
// not here.
// ============================================================
export const dynamic = 'force-dynamic'

const DEMO_EMAILS = new Set(['admin@demo.com', 'driver@demo.com'])
const CORE_TIERS = new Set(['starter', 'pro', 'enterprise'])

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  const tier = (url.searchParams.get('tier') ?? '').trim()
  const period = (url.searchParams.get('period') ?? 'monthly').trim()
  const langganan = (q: string) => NextResponse.redirect(new URL(`/admin/langganan?${q}`, origin))

  if (!CORE_TIERS.has(tier)) return langganan('error=invalid_tier')
  if (period !== 'monthly' && period !== 'yearly') return langganan('error=invalid_period')

  const supabase = await createCoreClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login?next=/admin/langganan', origin))
  }

  const { data: { session } } = await supabase.auth.getSession()
  const claims = session?.access_token ? JSON.parse(atob(session.access_token.split('.')[1])) : {}
  const role = claims.user_role as string | undefined
  if (!['admin', 'owner', 'superadmin'].includes(role ?? '')) return langganan('error=forbidden')
  if (user.email && DEMO_EMAILS.has(user.email)) return langganan('error=demo')

  const tenantId = await getActiveTenantId()
  if (!tenantId) return langganan('error=not_provisioned')

  // Backstop: make sure the Core billing mirror exists (idempotent, SAME-ID).
  const rental = createRentalServiceClient()
  const { data: t } = await rental.from('tenants').select('name, slug').eq('id', tenantId).maybeSingle()
  const coreTenantId = await provisionCoreTenant({
    tenantId,
    name: t?.name ?? (claims.tenant_slug as string) ?? 'Rental',
    slug: t?.slug ?? (claims.tenant_slug as string) ?? undefined,
    email: user.email ?? null,
  })
  if (!coreTenantId) return langganan('error=not_provisioned')

  let token: string
  try {
    token = signBillingToken(coreTenantId)
  } catch (err) {
    console.error('[billing/checkout] mint token failed:', err instanceof Error ? err.message : err)
    return langganan('error=billing_link_unavailable')
  }

  try {
    const res = await fetch(`${superadminBaseUrl()}/api/billing/checkout-self`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, tier, period }),
      signal: AbortSignal.timeout(10_000),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.error('[billing/checkout] checkout-self failed:', res.status, data?.error)
      return langganan('error=checkout')
    }
    if (data.kind === 'checkout' && data.redirect_url) {
      return NextResponse.redirect(data.redirect_url)
    }
    if (data.kind === 'applied') return langganan('ok=applied')
    if (data.kind === 'scheduled') return langganan('ok=scheduled')
    return langganan('error=checkout')
  } catch (err) {
    console.error('[billing/checkout] error:', err instanceof Error ? err.message : err)
    return langganan('error=checkout')
  }
}
