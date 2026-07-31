'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { createCoreClient } from '@/lib/supabase/client'
import { PortalLoginCard } from '@/components/auth/PortalLoginCard'
import { isConnectionError, CONNECTION_ERROR_MESSAGE } from '@/lib/auth-error'

export function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const next         = searchParams.get('next') ?? '/'

  async function onSubmit(email: string, password: string) {
    const supabase = createCoreClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      // Server tumbang ≠ password salah. Menyamakan keduanya membuat pengguna
      // mengulang-ulang password yang sebenarnya sudah benar.
      return {
        error: isConnectionError(authError)
          ? CONNECTION_ERROR_MESSAGE
          : 'Email atau password salah. Silakan coba lagi.',
      }
    }

    // Smart redirect berdasarkan role. Utamakan klaim JWT `user_role` (dari auth-hook
    // jexp), fallback ke `user_metadata.role` yang SELALU ada di token (ditulis saat
    // register, app/api/register/route.ts) — supaya owner tetap diarahkan ke /admin
    // walau hook custom_access_token belum aktif. Pelanggan (tanpa role) → /account.
    const { data: { session } } = await supabase.auth.getSession()
    const claims = session?.access_token ? JSON.parse(atob(session.access_token.split('.')[1])) : {}
    const role: string | undefined = claims.user_role ?? claims.user_metadata?.role

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
