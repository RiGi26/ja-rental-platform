import { redirect } from 'next/navigation'
import { createCoreClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/AdminSidebar'
import TopBar from '@/components/TopBar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createCoreClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/admin')

  // Role from JWT custom claims (injected by Core DB hook)
  const { data: { session } } = await supabase.auth.getSession()
  const claims = session?.access_token
    ? JSON.parse(atob(session.access_token.split('.')[1]))
    : {}
  const role = claims.user_role as string | undefined
  const canAccess = ['admin', 'owner', 'superadmin'].includes(role ?? '')

  if (!canAccess) {
    redirect('/account?error=unauthorized')
  }

  const displayName =
    (user.user_metadata as { full_name?: string })?.full_name ??
    user.email?.split('@')[0] ??
    'Admin'

  return (
    <div className="min-h-screen" style={{ background: '#f5f7fb' }}>
      <AdminSidebar />
      <div className="flex flex-col min-h-screen lg:pl-[280px] transition-all duration-300">
        <TopBar userName={displayName} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
