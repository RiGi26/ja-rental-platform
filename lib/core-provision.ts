// ============================================================
// lib/core-provision.ts — register a rental tenant in the superadmin Core (billing
// SoR = hxhus) so it can be billed. SAME-ID model: the rental tenant id (mmwud) is
// mirrored verbatim into Core, so Core.tenants.id == rental tenants.id and the
// billing sync webhook (rental-sync) resolves the local row by tenant_id directly.
//
// HMAC-SHA256 over `${ts}\n${nonce}\n${rawBody}` with BILLING_SYNC_SECRET (same
// scheme as /api/billing/sync). Idempotent on (platform, linked_tenant_id) — safe to
// call again on checkout as a provisioning backstop. Server-only. Never throws:
// returns null on any failure so the caller can degrade gracefully (tenant keeps
// legacy full-access until Core is reachable).
// ============================================================
import { superadminBaseUrl } from '@/lib/billing-link'
import { signPayload, newNonce, newTimestamp, SIG_HEADERS } from '@/lib/portal/sign'

type ProvisionArgs = {
  tenantId: string
  name: string
  slug?: string
  email?: string | null
  phone?: string | null
}

/**
 * Provision (or reuse) the Core tenant for a rental tenant. Returns the Core tenant
 * id (== tenantId for SAME-ID) or null on failure.
 */
export async function provisionCoreTenant(args: ProvisionArgs): Promise<string | null> {
  const secret = process.env.BILLING_SYNC_SECRET?.trim()
  if (!secret) {
    console.error('[core-provision] BILLING_SYNC_SECRET belum di-set')
    return null
  }

  const body = JSON.stringify({
    platform: 'rental',
    // SAME-ID: send both so Core creates tenants.id = tenantId and can also match on
    // linked_tenant_id (the endpoint requires linked_tenant_id).
    tenant_id: args.tenantId,
    linked_tenant_id: args.tenantId,
    name: args.name,
    slug: args.slug,
    email: args.email ?? null,
    phone: args.phone ?? null,
  })

  const ts = newTimestamp()
  const nonce = newNonce()
  const sig = signPayload(secret, ts, nonce, body)

  try {
    const res = await fetch(`${superadminBaseUrl()}/api/tenants/provision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [SIG_HEADERS.timestamp]: ts,
        [SIG_HEADERS.nonce]: nonce,
        [SIG_HEADERS.signature]: sig,
      },
      body,
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      console.error('[core-provision] provision failed:', res.status, await res.text().catch(() => ''))
      return null
    }
    const data = (await res.json()) as { core_tenant_id?: string }
    return data.core_tenant_id ?? null
  } catch (err) {
    console.error('[core-provision] error:', err instanceof Error ? err.message : err)
    return null
  }
}
