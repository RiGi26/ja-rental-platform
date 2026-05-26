'use server'

import { createCoreClient } from '@/lib/supabase/server'
import { createRentalServiceClient } from '@/lib/supabase/service'

async function getActiveTenantId(): Promise<string | null> {
  const supabase = await createCoreClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return null
  try {
    const payload = JSON.parse(atob(session.access_token.split('.')[1]))
    return payload.tenant_id ?? payload.linked_tenant_id ?? null
  } catch { return null }
}

// ── Read helpers (called from Server Components) ────────────────────────────

export async function getAdminDashboardStats() {
  const tenantId = await getActiveTenantId()
  if (!tenantId) return { bookingsToday: 0, revenueToday: 0, vehicles: { total: 0, active: 0 }, vehicleAlerts: [] }

  const supabase   = createRentalServiceClient()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayStr   = todayStart.toISOString()

  const thirtyDays = new Date()
  thirtyDays.setDate(thirtyDays.getDate() + 30)
  const thirtyStr  = thirtyDays.toISOString().split('T')[0]

  const [
    { count: bookingsToday },
    { data: payments },
    { data: vehicles },
    { data: alerts },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId).gte('created_at', todayStr).eq('payment_status', 'paid'),
    supabase.from('payments').select('amount').eq('status', 'paid').gte('paid_at', todayStr),
    supabase.from('vehicles').select('status').eq('tenant_id', tenantId),
    supabase.from('vehicles')
      .select('id, plate, brand, model, next_service_date, stnk_expiry, kir_expiry, tax_expiry')
      .eq('tenant_id', tenantId)
      .or([
        `next_service_date.lte.${thirtyStr}`,
        `stnk_expiry.lte.${thirtyStr}`,
        `kir_expiry.lte.${thirtyStr}`,
        `tax_expiry.lte.${thirtyStr}`,
      ].join(',')),
  ])

  const revenueToday   = (payments ?? []).reduce((s, p) => s + (p.amount ?? 0), 0)
  const totalVehicles  = vehicles?.length ?? 0
  const activeVehicles = (vehicles ?? []).filter(v => v.status === 'available' || v.status === 'on_trip').length

  return {
    bookingsToday: bookingsToday ?? 0,
    revenueToday,
    vehicles: { total: totalVehicles, active: activeVehicles },
    vehicleAlerts: alerts ?? [],
  }
}

export async function getActiveSchedules() {
  const tenantId     = await getActiveTenantId()
  if (!tenantId) return []
  const supabase     = createRentalServiceClient()
  const twelveHrsAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('schedules')
    .select(`
      id, status, depart_at, seats_total, seats_available,
      vehicle:vehicles(plate, brand, model),
      driver:drivers(name),
      route:routes(origin, destination)
    `)
    .eq('tenant_id', tenantId)
    .in('status', ['boarding', 'on_trip', 'scheduled'])
    .gte('depart_at', twelveHrsAgo)
    .order('depart_at', { ascending: true })
    .limit(10)

  return data ?? []
}

export async function getVehicleReminders() {
  const tenantId  = await getActiveTenantId()
  if (!tenantId) return []
  const supabase  = createRentalServiceClient()
  const thirtyStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data } = await supabase
    .from('vehicles')
    .select('id, plate, brand, model, next_service_date, stnk_expiry, kir_expiry, tax_expiry')
    .eq('tenant_id', tenantId)
    .or([
      `next_service_date.lte.${thirtyStr}`,
      `stnk_expiry.lte.${thirtyStr}`,
      `kir_expiry.lte.${thirtyStr}`,
      `tax_expiry.lte.${thirtyStr}`,
    ].join(','))

  return data ?? []
}

export async function getDriverPerformance() {
  const tenantId = await getActiveTenantId()
  if (!tenantId) return []
  const supabase = createRentalServiceClient()
  const { data } = await supabase
    .from('drivers')
    .select('id, name, phone, status, avg_rating')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .order('avg_rating', { ascending: false })
    .limit(5)

  return data ?? []
}

export async function getAllBookings() {
  const tenantId = await getActiveTenantId()
  if (!tenantId) return []
  const supabase = createRentalServiceClient()
  const { data } = await supabase
    .from('bookings')
    .select(`
      id, booking_code, status, payment_status, total_amount, created_at, seats,
      passengers(name, phone, seat_number),
      schedule:schedules(
        id, depart_at,
        route:routes(origin, destination)
      )
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(100)

  return data ?? []
}

export async function getAllVehicles() {
  const tenantId = await getActiveTenantId()
  if (!tenantId) return []
  const supabase = createRentalServiceClient()
  const { data } = await supabase
    .from('vehicles')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getAllDrivers() {
  const tenantId = await getActiveTenantId()
  if (!tenantId) return []
  const supabase = createRentalServiceClient()
  const { data } = await supabase
    .from('drivers')
    .select('id, name, phone, license_no, status, avg_rating, user_id')
    .eq('tenant_id', tenantId)
    .order('avg_rating', { ascending: false })
  return data ?? []
}

export async function getAllRoutes() {
  const tenantId = await getActiveTenantId()
  if (!tenantId) return []
  const supabase = createRentalServiceClient()
  const { data } = await supabase
    .from('routes')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('origin')
  return data ?? []
}

export async function getAllSchedules() {
  const tenantId     = await getActiveTenantId()
  if (!tenantId) return []
  const supabase     = createRentalServiceClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('schedules')
    .select(`
      id, depart_at, status, seats_total, seats_available, price, price_adult, service_class,
      vehicle:vehicles(id, plate, brand, model),
      driver:drivers(id, name),
      route:routes(id, origin, destination)
    `)
    .eq('tenant_id', tenantId)
    .gte('depart_at', sevenDaysAgo)
    .order('depart_at', { ascending: false })
    .limit(50)
  return data ?? []
}

export async function getReportsData() {
  const tenantId  = await getActiveTenantId()
  if (!tenantId) return { payments: [], bookings: [], vehicles: [] }
  const supabase  = createRentalServiceClient()
  const sixMonths = new Date()
  sixMonths.setMonth(sixMonths.getMonth() - 6)

  const [{ data: payments }, { data: bookings }, { data: vehicles }] = await Promise.all([
    supabase.from('payments').select('amount, paid_at').eq('status', 'paid').gte('paid_at', sixMonths.toISOString()),
    supabase.from('bookings').select(`
      status, payment_status, total_amount, created_at,
      schedule:schedules(route:routes(origin, destination))
    `).eq('tenant_id', tenantId).gte('created_at', sixMonths.toISOString()),
    supabase.from('vehicles').select('id, plate, brand, model, status').eq('tenant_id', tenantId),
  ])

  return { payments: payments ?? [], bookings: bookings ?? [], vehicles: vehicles ?? [] }
}

// ── Mutations (Server Actions called from client) ───────────────────────────

export async function confirmPaymentManual(bookingId: string) {
  const tenantId = await getActiveTenantId()
  if (!tenantId) return { error: 'Unauthorized' }
  const supabase = createRentalServiceClient()
  await supabase.from('bookings').update({ status: 'confirmed', payment_status: 'paid' })
    .eq('id', bookingId).eq('tenant_id', tenantId)
  await supabase.from('payments').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('booking_id', bookingId)
  return { success: true }
}

export async function cancelBookingAdmin(bookingId: string) {
  const tenantId = await getActiveTenantId()
  if (!tenantId) return { error: 'Unauthorized' }
  const supabase = createRentalServiceClient()
  await supabase.from('bookings').update({ status: 'cancelled' })
    .eq('id', bookingId).eq('tenant_id', tenantId)
  return { success: true }
}

export async function createSchedule(formData: {
  routeId:       string
  vehicleId:     string
  driverId:      string
  departAt:      string
  price:         number
  pickupPoints:  { label: string; address: string; order: number }[]
}) {
  const tenantId = await getActiveTenantId()
  if (!tenantId) return { error: 'Unauthorized' }
  const supabase = createRentalServiceClient()

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('capacity, tenant_id')
    .eq('id', formData.vehicleId)
    .eq('tenant_id', tenantId)
    .single()

  if (!vehicle) return { error: 'Kendaraan tidak ditemukan.' }

  const { data: route } = await supabase
    .from('routes')
    .select('duration_minutes')
    .eq('id', formData.routeId)
    .single()

  const { error } = await supabase.from('schedules').insert({
    tenant_id:        tenantId,
    route_id:         formData.routeId,
    vehicle_id:       formData.vehicleId,
    driver_id:        formData.driverId || null,
    depart_at:        formData.departAt,
    price:            formData.price,
    price_adult:      formData.price,
    price_child:      Math.round(formData.price * 0.5),
    seats_total:      vehicle.capacity,
    seats_available:  vehicle.capacity,
    pickup_points:    formData.pickupPoints,
    status:           'scheduled',
    service_class:    'economy',
    is_cancelled:     false,
    duration_est:     route?.duration_minutes ?? 0,
    duration_minutes: route?.duration_minutes ?? 0,
  })

  if (error) return { error: error.message }
  return { success: true }
}
