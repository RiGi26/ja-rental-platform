import { createCoreClient } from '@/lib/supabase/server'
import HeaderClient from './HeaderClient'

// Header renders on EVERY route via the root layout (including public pages like
// /register and /auth/login — there's no route-group override for them). A plain
// `await supabase.auth.getUser()` has no timeout of its own: if the auth project
// (jexp) is slow/cold-starting, this call can hang past Vercel's function timeout
// and the whole page 504s — even pages that don't need auth at all. Race it against
// a short timeout so a slow/unreachable auth hub degrades to the guest header
// instead of hanging the request.
const AUTH_TIMEOUT_MS = 5000

export default async function Header() {
  let userData = null

  try {
    const supabase = await createCoreClient()
    const { data: { user } } = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('auth.getUser() timed out')), AUTH_TIMEOUT_MS),
      ),
    ])

    userData = user
      ? {
          id:        user.id,
          email:     user.email ?? '',
          full_name: (user.user_metadata as { full_name?: string })?.full_name ?? null,
        }
      : null
  } catch {
    // Supabase unreachable or slow — render guest header rather than hanging the page
  }

  return <HeaderClient initialUser={userData} />
}
