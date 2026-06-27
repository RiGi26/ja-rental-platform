import { redirect } from 'next/navigation'
import { createCoreClient } from '@/lib/supabase/server'
import { createCoreServiceClient } from '@/lib/supabase/service'
import { getTenantEntitlements } from '@/lib/tenant-entitlements'
import { isSubscriptionActive } from '@/lib/entitlements'
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
  let role = claims.user_role as string | undefined

  // Fallback: query Core DB langsung jika JWT hook belum aktif atau user login
  // sebelum hook di-register (token lama belum punya claims)
  if (!role) {
    const db = createCoreServiceClient()
    const { data: member } = await db
      .from('tenant_members')
      .select('role')
      .eq('user_id', user.id)
      .single()
    role = member?.role ?? undefined
  }

  if (!['admin', 'owner', 'superadmin'].includes(role ?? '')) {
    redirect('/account?error=unauthorized')
  }

  const displayName =
    (user.user_metadata as { full_name?: string })?.full_name ??
    user.email?.split('@')[0] ??
    'Admin'

  // Tier entitlements → filter the sidebar to the tenant's package. A tenant
  // without an entitlement row (or before the migration is applied) resolves to
  // 'legacy' (all features) so nothing is hidden until Core syncs a real tier.
  const tenantId = (claims.tenant_id ?? claims.linked_tenant_id) as string | undefined
  const ent = tenantId ? await getTenantEntitlements(tenantId) : null
  const entitlements = ent && isSubscriptionActive(ent.status) ? ent.entitlements : undefined

  return (
    <div className="min-h-screen" style={{ background: '#f5f7fb' }}>
      <AdminSidebar entitlements={entitlements} />
      <div className="flex flex-col min-h-screen lg:pl-[280px] transition-all duration-300">
        <TopBar userName={displayName} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
