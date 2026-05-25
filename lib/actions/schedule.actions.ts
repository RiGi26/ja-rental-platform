'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { Schedule, TravelSearchParams } from '@/lib/types'

export async function searchSchedules(params: TravelSearchParams): Promise<Schedule[]> {
  const supabase = await createClient()

  // Step 1: route IDs yang cocok (case-insensitive)
  const { data: routes, error: routeErr } = await supabase
    .from('routes')
    .select('id')
    .ilike('origin', params.origin.trim())
    .ilike('destination', params.destination.trim())
    .eq('is_active', true)

  if (routeErr || !routes || routes.length === 0) return []

  const routeIds = routes.map(r => r.id as string)

  // Step 2: jadwal pada tanggal yang diminta (WIB = UTC+7)
  const startOfDay = `${params.date}T00:00:00+07:00`
  const endOfDay   = `${params.date}T23:59:59+07:00`

  const { data: schedules, error: schedErr } = await supabase
    .from('schedules')
    .select(`
      id, tenant_id, route_id, vehicle_id, driver_id,
      depart_at, seats_total, seats_available,
      price, price_adult, price_child,
      pickup_points, status, service_class, is_cancelled, created_at,
      route:routes(id, origin, destination, stops, duration_est, duration_minutes, is_active),
      vehicle:vehicles(id, brand, model, photos, plate, capacity, type, status),
      driver:drivers(id, name, avg_rating)
    `)
    .in('route_id', routeIds)
    .eq('status', 'scheduled')
    .eq('is_cancelled', false)
    .gte('depart_at', startOfDay)
    .lte('depart_at', endOfDay)
    .gte('seats_available', params.passengers)
    .order('depart_at', { ascending: true })

  if (schedErr) {
    console.error('[searchSchedules]', schedErr.message)
    return []
  }

  return (schedules ?? []) as unknown as Schedule[]
}

export async function getScheduleById(scheduleId: string): Promise<Schedule | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('schedules')
    .select(`
      id, tenant_id, route_id, vehicle_id, driver_id,
      depart_at, seats_total, seats_available,
      price, price_adult, price_child,
      pickup_points, status, service_class, is_cancelled, created_at,
      route:routes(id, origin, destination, stops, duration_est, duration_minutes, is_active),
      vehicle:vehicles(id, brand, model, photos, plate, capacity, type, status),
      driver:drivers(id, name, avg_rating)
    `)
    .eq('id', scheduleId)
    .eq('is_cancelled', false)
    .single()

  if (error || !data) return null
  return data as unknown as Schedule
}

// Menggunakan service role agar bisa baca passengers tanpa RLS
// Hanya mengembalikan seat_number (bukan data pribadi penumpang)
export async function getOccupiedSeats(scheduleId: string): Promise<string[]> {
  const supabase = createServiceClient()

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('passengers(seat_number)')
    .eq('schedule_id', scheduleId)
    .not('status', 'in', '(cancelled,expired)')

  if (error) {
    console.error('[getOccupiedSeats]', error.message)
    return []
  }

  const seats: string[] = []
  for (const booking of bookings ?? []) {
    const passengers = (booking as { passengers: { seat_number: string }[] }).passengers
    for (const p of passengers ?? []) {
      if (p.seat_number) seats.push(p.seat_number)
    }
  }

  return [...new Set(seats)] // deduplicate
}
