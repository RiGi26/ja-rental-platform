import { createCoreClient } from '@/lib/supabase/server'
import HeaderClient from './HeaderClient'

export default async function Header() {
  let userData = null

  try {
    const supabase = await createCoreClient()
    const { data: { user } } = await supabase.auth.getUser()

    userData = user
      ? {
          id:        user.id,
          email:     user.email ?? '',
          full_name: (user.user_metadata as { full_name?: string })?.full_name ?? null,
        }
      : null
  } catch {
    // Supabase unreachable — render guest header rather than crashing the page
  }

  return <HeaderClient initialUser={userData} />
}
