import { NextResponse } from 'next/server'
import { createCoreClient } from '@/lib/supabase/server'
import { createCoreServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createCoreClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ logged_in: false, error: userError?.message })
  }

  const { data: { session } } = await supabase.auth.getSession()
  const claims = session?.access_token
    ? JSON.parse(atob(session.access_token.split('.')[1]))
    : {}

  const db = createCoreServiceClient()
  const { data: member, error: memberError } = await db
    .from('tenant_members')
    .select('role, platform_role, tenant_id')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({
    logged_in:    true,
    user_id:      user.id,
    email:        user.email,
    jwt_claims:   {
      user_role:   claims.user_role   ?? null,
      tenant_id:   claims.tenant_id   ?? null,
      tenant_slug: claims.tenant_slug ?? null,
    },
    db_member:      member  ?? null,
    db_member_error: memberError?.message ?? null,
    env_core_url_set:          !!process.env.NEXT_PUBLIC_SUPABASE_CORE_URL,
    env_core_service_key_set:  !!process.env.SUPABASE_CORE_SERVICE_ROLE_KEY,
    env_service_key_set:       !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  })
}
