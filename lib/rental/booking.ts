// ============================================================
// lib/rental/booking.ts — util bersama modul rental (dipakai server action admin
// DAN endpoint booking publik). Murni server-side; client Supabase di-inject
// (service-role) supaya bisa dipakai tanpa sesi.
// ============================================================
import type { SupabaseClient } from '@supabase/supabase-js'

/** Status booking rental yang MEMBLOKIR kalender sebuah unit. */
export const RENTAL_BLOCKING_STATUSES = [
  'pending_payment', 'paid', 'confirmed', 'otw_pickup', 'on_trip', 'almost_arrived',
] as const

export type BookedRange = { start_date: string; end_date: string }

type ActiveRentalRow = {
  id: string
  status: string
  expires_at: string | null
  rental:
    | { start_date: string | null; end_date: string | null }[]
    | { start_date: string | null; end_date: string | null }
    | null
}

/**
 * Rentang tanggal sewa aktif sebuah unit. `pending_payment` yang sudah lewat
 * `expires_at` TIDAK dihitung — booking web yang tak dibayar melepas kalender
 * sendiri tanpa menunggu cron/webhook (self-heal).
 */
export async function fetchBookedRanges(
  db: SupabaseClient,
  opts: { tenantId: string; vehicleId: string; excludeBookingId?: string },
): Promise<BookedRange[]> {
  let query = db
    .from('bookings')
    .select('id, status, expires_at, rental:rental_details(start_date, end_date)')
    .eq('tenant_id', opts.tenantId)
    .eq('type', 'rental')
    .eq('vehicle_id', opts.vehicleId)
    .in('status', RENTAL_BLOCKING_STATUSES as unknown as string[])
  if (opts.excludeBookingId) query = query.neq('id', opts.excludeBookingId)

  const { data } = await query
  const now = Date.now()
  const ranges: BookedRange[] = []
  for (const row of (data ?? []) as ActiveRentalRow[]) {
    if (row.status === 'pending_payment' && row.expires_at && new Date(row.expires_at).getTime() < now) continue
    const r = Array.isArray(row.rental) ? row.rental[0] : row.rental
    if (!r?.start_date || !r?.end_date) continue
    ranges.push({ start_date: r.start_date, end_date: r.end_date })
  }
  return ranges.sort((a, b) => (a.start_date < b.start_date ? -1 : 1))
}

/** Bentrok bila: existing.start <= new.end DAN existing.end >= new.start. */
export function findOverlap(ranges: BookedRange[], startDate: string, endDate: string): BookedRange | null {
  for (const r of ranges) {
    if (r.start_date <= endDate && r.end_date >= startDate) return r
  }
  return null
}

/** Cek bentrok tanggal sebuah unit langsung dari DB. */
export async function findDateConflict(
  db: SupabaseClient,
  opts: { tenantId: string; vehicleId: string; startDate: string; endDate: string; excludeBookingId?: string },
): Promise<BookedRange | null> {
  const ranges = await fetchBookedRanges(db, opts)
  return findOverlap(ranges, opts.startDate, opts.endDate)
}

/** Kode booking 8 alnum uppercase — format sama dengan travel (JA-XXXXXXXX). */
export function genBookingCode(): string {
  const s = Math.random().toString(36).slice(2, 10).toUpperCase().padEnd(8, '0')
  return `JA-${s}`
}
