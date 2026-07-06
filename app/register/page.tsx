'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createCoreClient } from '@/lib/supabase/client'
import { PortalRegisterCard, type RegisterData } from '@/components/auth/PortalRegisterCard'

// Core tier (from the pricing CTA) → display name, consistent with the pricing page.
const PLAN_LABEL: Record<string, string> = { starter: 'Starter', pro: 'Growth', enterprise: 'Pro' }

function RegisterForm() {
  const searchParams = useSearchParams()
  // From the pricing CTA (?intent=subscribe&tier=<coreTier>&period=). After signup we
  // auto-login and send the buyer STRAIGHT to Midtrans for that tier (no picker).
  const subscribe = searchParams.get('intent') === 'subscribe'
  const tier = searchParams.get('tier') // Core enum: starter|pro|enterprise
  const period = searchParams.get('period') === 'yearly' ? 'yearly' : 'monthly'
  const planLabel = (tier && PLAN_LABEL[tier]) || undefined
  const subscribing = subscribe && !!planLabel
  // Fallback target when auto sign-in fails and the buyer uses the manual "Masuk" card.
  const loginHref = subscribe ? `/auth/login?next=${encodeURIComponent('/admin/langganan')}` : '/auth/login'

  async function handleRegister(data: RegisterData): Promise<{ error?: string } | void> {
    // slug is derived + deduplicated server-side from businessName — not sent from here.
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: data.businessName,
        adminName: data.adminName,
        email: data.email,
        whatsapp: data.whatsapp,
        password: data.password,
      }),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      return { error: body.error || 'Terjadi kesalahan. Coba lagi.' }
    }

    // Account created (server seeds a 14-day trial as the safety net). Auto-login via
    // the Core auth hub so the buyer lands straight in the portal — or in payment —
    // with no manual login step. On the rare sign-in failure, fall back to "Masuk".
    const supabase = createCoreClient()
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (signInErr) {
      window.location.assign(loginHref)
      return
    }

    if (subscribe && tier) {
      // Paid plan picked on pricing → straight to Midtrans for that tier.
      window.location.assign(`/api/billing/checkout?tier=${encodeURIComponent(tier)}&period=${period}`)
    } else if (subscribe) {
      window.location.assign('/admin/langganan')
    } else {
      window.location.assign('/admin')
    }
  }

  return (
    <PortalRegisterCard
      subLabel="RENT PORTAL"
      portalLabel="Webzoka Rental"
      subscribe={subscribing}
      planLabel={planLabel}
      loginHref={loginHref}
      onSubmit={handleRegister}
    />
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Memuat…</div>}>
      <RegisterForm />
    </Suspense>
  )
}
