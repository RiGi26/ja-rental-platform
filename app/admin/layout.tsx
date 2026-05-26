import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/AdminSidebar'
import TopBar from '@/components/TopBar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/admin')

  // Role check: Only admin, owner, or superadmin can access this layout
  const role = (user.app_metadata as { role?: string })?.role
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
