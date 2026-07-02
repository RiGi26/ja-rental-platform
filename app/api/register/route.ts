import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createCoreServiceClient, createRentalServiceClient } from '@/lib/supabase/service'
import { rateLimit, clientIp, tooManyRequests } from '@/lib/rate-limit'
import { provisionCoreTenant } from '@/lib/core-provision'
import { tierFeatures } from '@/lib/entitlements'

// ============================================================
// POST /api/register — self-service signup for a rental business (owner).
//
// Dual-project auth topology (verified 2026-07-02):
//   • jexp (NEXT_PUBLIC_SUPABASE_CORE_URL) = AUTH hub: auth.users + tenants
//     (Core-like schema: platform + plan_tier) + tenant_members. The JWT hook
//     custom_jwt_claims runs HERE and injects tenant_id/user_role from
//     tenant_members ⋈ tenants — so login + tenant resolution depend on jexp.
//   • mmwud (…RENTAL…) = ops + tenant_entitlements (gating read cache; FK → its tenants).
//   • hxhus (superadmin) = billing SoR, reached via HMAC only.
// SAME-ID: one uuid is used across jexp + mmwud + hxhus.
//
// Server-side, service-role keys (bypass RLS). Order:
//   1) jexp tenant  2) jexp auth user (email pre-confirmed)  3) jexp tenant_members
//   4) mmwud tenant mirror  5) provision Core mirror (best-effort)
//   6) seed mmwud trial entitlement ONLY if provisioning succeeded (else legacy).
// Public route (proxy guards only /admin,/owner,/account,/driver).
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

  const auth = createCoreServiceClient()   // jexp: auth.users + tenants + tenant_members
  const ops = createRentalServiceClient()  // mmwud: tenants mirror + tenant_entitlements
  const tenantId = randomUUID()            // shared SAME-ID across jexp / mmwud / hxhus

  // Unique slug in the auth hub (jexp tenants.slug is unique across platforms).
  for (let i = 0; i < 5; i++) {
    const { data: clash } = await auth.from('tenants').select('id').eq('slug', slug).maybeSingle()
    if (!clash) break
    slug = `${slugify(name) || 'rental'}-${Math.random().toString(36).slice(2, 6)}`
  }

  // 1. jexp tenant (auth hub). Core-like schema → platform + plan_tier.
  const { error: jtErr } = await auth.from('tenants').insert({
    id: tenantId,
    name,
    slug,
    platform: 'rental',
    status: 'trial',
    plan_tier: 'enterprise', // trial = full Pro
    email,
    phone,
  })
  if (jtErr) {
    console.error('[register] jexp tenant insert failed:', jtErr)
    return NextResponse.json({ error: 'Gagal membuat akun. Coba lagi.' }, { status: 500 })
  }

  // 2. jexp auth user (email pre-confirmed → immediate sign-in).
  const { data: created, error: uErr } = await auth.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `${name} Admin`, role: 'owner', tenant_id: tenantId },
  })
  if (uErr || !created?.user) {
    await auth.from('tenants').delete().eq('id', tenantId)
    const dup = (uErr?.message ?? '').toLowerCase().includes('already')
    return NextResponse.json(
      { error: dup ? 'Email sudah terdaftar. Silakan login.' : 'Gagal membuat akun pengguna.' },
      { status: dup ? 409 : 500 },
    )
  }
  const userId = created.user.id

  // 3. jexp tenant_members → JWT hook injects tenant_id/user_role on login.
  const { error: mErr } = await auth
    .from('tenant_members')
    .insert({ tenant_id: tenantId, user_id: userId, role: 'owner' })
  if (mErr) {
    console.error('[register] jexp tenant_members insert failed:', mErr)
    await auth.auth.admin.deleteUser(userId).catch(() => {})
    await auth.from('tenants').delete().eq('id', tenantId)
    return NextResponse.json({ error: 'Gagal menautkan akun. Coba lagi.' }, { status: 500 })
  }

  // 4. mmwud tenant mirror (same id) — FK target for entitlements + ops data.
  const { error: rtErr } = await ops
    .from('tenants')
    .insert({ id: tenantId, name, slug, plan: 'starter', status: 'trial' })
  if (rtErr) {
    console.error('[register] mmwud tenant insert failed:', rtErr)
    await auth.auth.admin.deleteUser(userId).catch(() => {})
    await auth.from('tenant_members').delete().eq('tenant_id', tenantId)
    await auth.from('tenants').delete().eq('id', tenantId)
    return NextResponse.json({ error: 'Gagal menyiapkan akun. Coba lagi.' }, { status: 500 })
  }

  // 5. Provision the billing mirror in Core (SAME-ID, best-effort).
  const coreTenantId = await provisionCoreTenant({ tenantId, name, slug, email, phone })

  // 6. Seed a trial entitlement ONLY when Core provisioning succeeded (else legacy/full access).
  if (coreTenantId) {
    const planExpiresAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const { error: eErr } = await ops.from('tenant_entitlements').upsert(
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
