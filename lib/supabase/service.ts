import { createClient } from '@supabase/supabase-js'

// Bypass RLS — hanya untuk server-side (Server Actions, API Routes)
// Jangan import di Client Component
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
