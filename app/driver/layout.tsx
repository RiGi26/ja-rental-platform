import { redirect } from 'next/navigation'
import { createCoreClient } from '@/lib/supabase/server'
import { createCoreServiceClient } from '@/lib/supabase/service'
import DriverSidebar from '@/components/DriverSidebar'

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createCoreClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/driver')

  const { data: { session } } = await supabase.auth.getSession()
  const claims = session?.access_token
    ? JSON.parse(atob(session.access_token.split('.')[1]))
    : {}
  let role = claims.user_role as string | undefined

  if (!role) {
    const db = createCoreServiceClient()
    const { data: member } = await db
      .from('tenant_members')
      .select('role')
      .eq('user_id', user.id)
      .single()
    role = member?.role ?? undefined
  }

  const canAccess = ['member', 'admin', 'owner', 'superadmin'].includes(role ?? '')
  if (!canAccess) redirect('/auth/login?next=/driver')

  return (
    <div className="min-h-screen bg-bg">
      <DriverSidebar />
      <div className="rental-content">
        <main className="p-4">{children}</main>
      </div>
    </div>
  )
}
