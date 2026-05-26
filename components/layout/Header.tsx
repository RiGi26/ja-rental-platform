import { createCoreClient } from '@/lib/supabase/server'
import HeaderClient from './HeaderClient'

export default async function Header() {
  const supabase = await createCoreClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userData = user
    ? {
        id:        user.id,
        email:     user.email ?? '',
        full_name: (user.user_metadata as { full_name?: string })?.full_name ?? null,
      }
    : null

  return <HeaderClient initialUser={userData} />
}
