import { NextResponse } from 'next/server'
import { createCoreServiceClient, createRentalServiceClient } from '@/lib/supabase/service'
import { rateLimit, clientIp, tooManyRequests } from '@/lib/rate-limit'
import { provisionCoreTenant } from '@/lib/core-provision'
import { tierFeatures } from '@/lib/entitlements'

// ============================================================
// POST /api/register — self-service signup for a rental business (owner).
//
// Single-DB reality: auth.users + tenants + tenant_members + tenant_entitlements all
// live in the rental project (mmwud); the JWT hook custom_jwt_claims injects
// tenant_id/user_role from tenant_members ⋈ tenants. Runs server-side with the
// service role (the old client-side anon insert hit tenant RLS). Steps:
//   1) create tenant (mmwud)  2) create owner auth user (email pre-confirmed so the
//   client can sign in immediately)  3) link via tenant_members (role 'owner')
//   4) provision the billing mirror in Core (hxhus, SAME-ID) — best-effort
//   5) seed a trial entitlement row ONLY when provisioning succeeded
//      (behaviour-preserving: no Core → tenant stays legacy/full-access, not a
//       trial that expires without any checkout path).
// The client then signs in and, for a subscribe intent, is sent to
// /api/billing/checkout. Public route (proxy guards only /admin,/owner,/account,/driver).
// ============================================================
export const dynamic = 'force-dynamic'

const TRIAL_DAYS = 14

function slugify(input: string): string {
  return input.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '').slice(0, 40)
}

export async function POST(request: Request) {
  const rl = rateLimit(`register:${clientIp(request)}`, 5, 10 * 60_000)
  if (!rl.allowed) return tooManyRequests(rl.retryAfter)

  let body: { businessName?: string; slug?: string; email?: string; whatsapp?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid.' }, { status: 400 })
  }

  const name = (body.businessName ?? '').trim()
  const email = (body.email ?? '').trim().toLowerCase()
  const phone = (body.whatsapp ?? '').trim() || null
  const password = body.password ?? ''
  let slug = body.slug ? slugify(body.slug) : slugify(name)

  if (!name || !email || password.length < 8 || !slug) {
    return NextResponse.json({ error: 'Lengkapi nama usaha, email, dan password (min 8 karakter).' }, { status: 400 })
  }

  const core = createCoreServiceClient()

  // 1. Unique slug (globally unique in tenants).
  for (let i = 0; i < 5; i++) {
    const { data: clash } = await core.from('tenants').select('id').eq('slug', slug).maybeSingle()
    if (!clash) break
    slug = `${slugify(name) || 'rental'}-${Math.random().toString(36).slice(2, 6)}`
  }

  // 2. Create tenant (mmwud generates the id → used verbatim as the SAME-ID everywhere).
  const { data: tenant, error: tErr } = await core
    .from('tenants')
    .insert({ name, slug, plan: 'starter', status: 'trial' })
    .select('id')
    .single()
  if (tErr || !tenant) {
    console.error('[register] tenant insert failed:', tErr)
    return NextResponse.json({ error: 'Gagal membuat akun. Coba lagi.' }, { status: 500 })
  }
  const tenantId = tenant.id as string

  // 3. Create the owner auth user (email pre-confirmed for immediate sign-in).
  const { data: created, error: uErr } = await core.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `${name} Admin`, role: 'owner', tenant_id: tenantId },
  })
  if (uErr || !created?.user) {
    // Roll back the orphan tenant so a retry with the same slug/email is clean.
    await core.from('tenants').delete().eq('id', tenantId)
    const dup = (uErr?.message ?? '').toLowerCase().includes('already')
    return NextResponse.json(
      { error: dup ? 'Email sudah terdaftar. Silakan login.' : 'Gagal membuat akun pengguna.' },
      { status: dup ? 409 : 500 },
    )
  }

  // 4. Link user → tenant so the JWT hook injects tenant_id/user_role.
  const { error: mErr } = await core
    .from('tenant_members')
    .insert({ tenant_id: tenantId, user_id: created.user.id, role: 'owner' })
  if (mErr) {
    console.error('[register] tenant_members insert failed:', mErr)
    await core.auth.admin.deleteUser(created.user.id).catch(() => {})
    await core.from('tenants').delete().eq('id', tenantId)
    return NextResponse.json({ error: 'Gagal menautkan akun. Coba lagi.' }, { status: 500 })
  }

  // 5. Provision the billing mirror in Core (SAME-ID, best-effort).
  const coreTenantId = await provisionCoreTenant({ tenantId, name, slug, email, phone })

  // 6. Seed a trial entitlement ONLY when Core provisioning succeeded (else stay legacy).
  if (coreTenantId) {
    const planExpiresAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const rental = createRentalServiceClient()
    const { error: eErr } = await rental.from('tenant_entitlements').upsert(
      {
        tenant_id: tenantId,
        tier: 'pro', // trial = full Pro (Core enterprise → rental "pro")
        entitlements: tierFeatures('pro'),
        max_active_units: null,
        status: 'trial',
        linked_tenant_id: coreTenantId,
        synced_at: new Date().toISOString(),
        expires_at: planExpiresAt,
      },
      { onConflict: 'tenant_id' },
    )
    if (eErr) console.error('[register] entitlement seed failed (non-fatal):', eErr.message)
  }

  return NextResponse.json({ ok: true, provisioned: !!coreTenantId })
}
