// ============================================================
// lib/billing-link.ts — MINT side of the subscription-checkout link (stateless HMAC).
//
// Travel & Rental uses Core as the auth hub, so the admin JWT already carries the
// tenant's *Core* id (claim tenant_id / linked_tenant_id). The portal MINTS a
// short-lived signed token carrying that Core id, then redirects the tenant to the
// superadmin `/billing/langganan?token=...`. Superadmin VERIFIES the token → Core
// tenant id → resolves platform → shows that tenant's plans → Snap checkout.
//
// Scheme MUST match ja-superadmin-platform/lib/billing-link.ts (verify side):
//   secret  : env BILLING_LINK_SECRET (identical in both repos)
//   token   : <base64url(payloadJson)>.<base64url(HMAC_SHA256(payloadB64, secret))>
//   payload : {"v":1,"t":"<coreTenantId>","iat":<unix_s>,"exp":<unix_s>}
//   HMAC over the base64url payload string (no JSON re-serialization).
// Server-only (node crypto + secret) — never import from a client component.
// ============================================================
import crypto from 'crypto'

const TOKEN_VERSION = 1
export const DEFAULT_LINK_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 hari (= masa link Snap)

type TokenPayload = { v: number; t: string; iat: number; exp: number }

function secret(): string | null {
  const s = process.env.BILLING_LINK_SECRET?.trim()
  return s && s.length > 0 ? s : null
}

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function sign(payloadB64: string, key: string): string {
  return b64url(crypto.createHmac('sha256', key).update(payloadB64).digest())
}

/**
 * Mint a checkout token for a tenant's Core id. Throws when BILLING_LINK_SECRET is
 * unset (fail loud, never emit a weak token).
 */
export function signBillingToken(coreTenantId: string, ttlSeconds = DEFAULT_LINK_TTL_SECONDS): string {
  const key = secret()
  if (!key) throw new Error('BILLING_LINK_SECRET belum di-set.')
  const now = Math.floor(Date.now() / 1000)
  const payload: TokenPayload = { v: TOKEN_VERSION, t: coreTenantId, iat: now, exp: now + ttlSeconds }
  const payloadB64 = b64url(Buffer.from(JSON.stringify(payload), 'utf8'))
  return `${payloadB64}.${sign(payloadB64, key)}`
}

/** Base URL of the superadmin Core app (checkout + provisioning live there). */
export function superadminBaseUrl(): string {
  return (process.env.SUPERADMIN_BILLING_URL?.trim().replace(/\/+$/, '')) || 'https://ja-superadmin-platform.vercel.app'
}
