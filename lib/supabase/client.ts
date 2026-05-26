import { createBrowserClient } from '@supabase/ssr'

// Client untuk urusan Auth, Billing, dan Tenant Management (Superadmin DB)
export function createCoreClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_CORE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_CORE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Client untuk urusan Operasional Rental (Vehicles, Schedules, Bookings)
export function createRentalClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_RENTAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_RENTAL_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * @deprecated Gunakan `createCoreClient` atau `createRentalClient` agar lebih spesifik.
 */
export function createClient() {
  // Secara default fallback ke auth/core client jika tidak dispesifikkan,
  // namun karena aplikasi saat ini masih 1 DB, kita gunakan environment variable utama sebagai fallback.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_RENTAL_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_RENTAL_ANON_KEY!
  )
}
