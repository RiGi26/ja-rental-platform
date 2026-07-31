import { NextResponse } from 'next/server'
import { createCoreClient } from '@/lib/supabase/server'
import { isConnectionError, CONNECTION_ERROR_MESSAGE } from '@/lib/auth-error'

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

  if (error) {
    // Pesan mentah supabase-js ("fetch failed") tidak berarti apa-apa bagi pengunjung
    // dan menyembunyikan penyebab aslinya. Catat detailnya untuk kita, kirim kalimat
    // yang bisa ditindaklanjuti ke layar.
    console.error('[demo-login] gagal', {
      role,
      name: error.name,
      status: error.status,
      message: error.message,
    })

    if (isConnectionError(error)) {
      return NextResponse.json({ error: CONNECTION_ERROR_MESSAGE }, { status: 503 })
    }
    return NextResponse.json(
      { error: 'Akun demo sedang tidak bisa dipakai. Hubungi admin lewat WhatsApp, ya.' },
      { status: 401 },
    )
  }

  return NextResponse.json({ success: true, redirectTo: creds.redirect })
}
