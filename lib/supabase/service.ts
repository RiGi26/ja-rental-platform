import { createClient } from '@supabase/supabase-js'

// Bypass RLS — hanya untuk server-side (Server Actions, API Routes) di Core DB (Auth, Tenant)
export function createCoreServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_CORE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_CORE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// Bypass RLS — hanya untuk server-side (Server Actions, API Routes) di Rental DB (Operations)
export function createRentalServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_RENTAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_RENTAL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

/**
 * @deprecated Gunakan `createCoreServiceClient` atau `createRentalServiceClient`
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_RENTAL_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_RENTAL_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
