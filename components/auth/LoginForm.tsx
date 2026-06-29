'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { createCoreClient } from '@/lib/supabase/client'
import { PortalLoginCard } from '@/components/auth/PortalLoginCard'

export function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const next         = searchParams.get('next') ?? '/'

  async function onSubmit(email: string, password: string) {
    const supabase = createCoreClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      return { error: 'Email atau password salah. Silakan coba lagi.' }
    }

    // Smart redirect berdasarkan role di JWT claim.
    const { data: { session } } = await supabase.auth.getSession()
    const claims = session?.access_token ? JSON.parse(atob(session.access_token.split('.')[1])) : {}
    const role: string | undefined = claims.user_role

    if (next !== '/') {
      router.push(next)
    } else if (role === 'admin' || role === 'owner' || role === 'superadmin') {
      router.push('/admin')
    } else {
      router.push('/account')
    }
    router.refresh()
  }

  async function onDemo() {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error('demo failed')
    window.location.href = data.redirectTo
  }

  return (
    <PortalLoginCard
      subLabel="RENT PORTAL"
      portalLabel="Webzoka Rental"
      onSubmit={onSubmit}
      demo={{ onClick: onDemo }}
    />
  )
}
