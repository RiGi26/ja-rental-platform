import { NextResponse } from 'next/server'
import { createCoreClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const DEMO_CREDS = {
  admin:  { email: 'admin@demo.com',  password: 'Demo@1234', redirect: '/admin'  },
  driver: { email: 'driver@demo.com', password: 'Demo@1234', redirect: '/driver' },
}

export async function POST(request: Request) {
  const { role } = await request.json() as { role: 'admin' | 'driver' }
  const creds = DEMO_CREDS[role]
  if (!creds) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

  const supabase = await createCoreClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: creds.email, password: creds.password,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 401 })
  return NextResponse.json({ success: true, redirectTo: creds.redirect })
}
