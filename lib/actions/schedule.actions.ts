'use server'

import { createRentalServiceClient } from '@/lib/supabase/service'
import type { Schedule, TravelSearchParams, RentalSearchParams, VehicleType, VehicleWithPrice } from '@/lib/types'

export async function searchSchedules(params: TravelSearchParams): Promise<Schedule[]> {
  // Service client: bypass RLS agar halaman search bisa diakses tanpa login
  const supabase = createRentalServiceClient()

  console.log('[searchSchedules] params:', params)

  // STEP 1: Cari route IDs yang cocok (case-insensitive exact match)
  const { data: routes, error: routeErr } = await supabase
    .from('routes')
    .select('id')
    .ilike('origin', params.origin.trim())
    .ilike('destination', params.destination.trim())
    .eq('is_active', true)

  console.log('[searchSchedules] routes found:', routes?.length ?? 0, 'routeErr:', routeErr?.message ?? null)

  if (routeErr) {
    console.error('[searchSchedules] route query error:', routeErr.message)
    return []
  }
  if (!routes || routes.length === 0) return []

  const routeIds = routes.map(r => r.id as string)

  // STEP 2: Cari jadwal pada tanggal yang diminta (WIB = UTC+7)
  // Data di DB disimpan sebagai timestamptz, Supabase membandingkan dalam UTC.
  // Dengan offset +07:00, filter mencakup 00:00 – 23:59 WIB.
  const startOfDay = `${params.date}T00:00:00+07:00`
  const endOfDay   = `${params.date}T23:59:59+07:00`

  console.log('[searchSchedules] date range WIB:', startOfDay, '→', endOfDay)

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

  console.log('[searchSchedules] raw schedules:', schedules?.length ?? 0, 'schedErr:', schedErr?.message ?? null)

  if (schedErr) {
    console.error('[searchSchedules] schedule query error:', schedErr.message)
    return []
  }

  return (schedules ?? []) as unknown as Schedule[]
}

export async function getScheduleById(scheduleId: string): Promise<Schedule | null> {
  // Service client: booking page bisa diakses tanpa login
  const supabase = createRentalServiceClient()

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

  if (error || !data) {
    console.error('[getScheduleById]', error?.message)
    return null
  }
  return data as unknown as Schedule
}

const RENTAL_VEHICLE_TYPES: VehicleType[] = ['sedan', 'suv', 'van', 'minibus', 'bus']

const PRICE_BY_TYPE: Record<VehicleType, number> = {
  sedan:   400_000,
  suv:     600_000,
  van:     450_000,
  minibus: 500_000,
  bus:     800_000,
}

export async function searchRentalVehicles(params: RentalSearchParams): Promise<VehicleWithPrice[]> {
  const supabase = createRentalServiceClient()

  console.log('[searchRentalVehicles] params:', params)

  // Step 1: get all available vehicles of rental types
  const { data: vehicles, error: vErr } = await supabase
    .from('vehicles')
    .select('*')
    .in('type', RENTAL_VEHICLE_TYPES)
    .eq('status', 'available')

  if (vErr) {
    console.error('[searchRentalVehicles] vehicles error:', vErr.message)
    return []
  }
  if (!vehicles || vehicles.length === 0) return []

  console.log('[searchRentalVehicles] total vehicles:', vehicles.length)

  const vehicleIds = vehicles.map(v => v.id as string)

  // Step 2: find active rental bookings for these vehicles
  const { data: activeBookings } = await supabase
    .from('bookings')
    .select('id, vehicle_id')
    .in('vehicle_id', vehicleIds)
    .eq('type', 'rental')
    .not('status', 'in', '(cancelled,expired)')
    .not('vehicle_id', 'is', null)

  const bookedVehicleIds = new Set<string>()

  if (activeBookings && activeBookings.length > 0) {
    const activeBookingIds = activeBookings.map(b => b.id as string)

    // Step 3: find which of those overlap with requested dates
    // overlap: rd.start_date <= params.end AND rd.end_date >= params.start
    const { data: conflictingRDs } = await supabase
      .from('rental_details')
      .select('booking_id')
      .in('booking_id', activeBookingIds)
      .lte('start_date', params.end)
      .gte('end_date', params.start)

    const conflictingIds = new Set((conflictingRDs ?? []).map(r => r.booking_id as string))

    for (const b of activeBookings) {
      if (conflictingIds.has(b.id as string) && b.vehicle_id) {
        bookedVehicleIds.add(b.vehicle_id as string)
      }
    }
  }

  console.log('[searchRentalVehicles] booked vehicle ids:', bookedVehicleIds.size)

  return vehicles
    .filter(v => !bookedVehicleIds.has(v.id as string))
    .map(v => ({
      ...(v as unknown as VehicleWithPrice),
      price_per_day: PRICE_BY_TYPE[v.type as VehicleType] ?? 400_000,
    }))
}

// Menggunakan service role agar bisa baca passengers tanpa RLS
// Hanya mengembalikan seat_number (bukan data pribadi penumpang)
export async function getOccupiedSeats(scheduleId: string): Promise<string[]> {
  const supabase = createRentalServiceClient()

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

  return [...new Set(seats)]
}
