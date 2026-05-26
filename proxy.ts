import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Hanya path ini yang memerlukan autentikasi
const PROTECTED_PREFIXES = [
  '/account',
  '/admin',
  '/owner',
  '/driver',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Cek apakah path ini perlu login
  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // Buat response dasar dulu agar cookie Supabase bisa diperbarui
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_CORE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_CORE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  // Hanya jalankan proxy pada path yang mungkin protected
  // Abaikan static assets dan Next.js internals
  matcher: [
    '/account/:path*',
    '/admin/:path*',
    '/owner/:path*',
    '/driver/:path*',
  ],
}
