// ── Tenant ────────────────────────────────────────────────────────────────────
export type TenantPlan = 'free' | 'starter' | 'pro' | 'enterprise'
export type TenantStatus = 'active' | 'suspended' | 'trial' | 'cancelled'

export interface Tenant {
  id: string
  name: string
  slug: string
  plan: TenantPlan
  status: TenantStatus
  created_at: string
}

// ── User Roles ─────────────────────────────────────────────────────────────────
export type UserRole = 'owner' | 'admin' | 'driver' | 'customer' | 'superadmin'

// ── Vehicle ───────────────────────────────────────────────────────────────────
export type VehicleStatus = 'available' | 'on_trip' | 'maintenance' | 'inactive'
export type VehicleType = 'minibus' | 'sedan' | 'suv' | 'van' | 'bus'

export interface Vehicle {
  id: string
  tenant_id: string
  plate: string
  type: VehicleType
  brand: string
  model: string
  capacity: number
  year?: number
  status: VehicleStatus
  photos: string[]
  next_service_km?: number
  next_service_date?: string
  stnk_expiry?: string
  kir_expiry?: string
  tax_expiry?: string
  created_at: string
}

// ── Route & Schedule ──────────────────────────────────────────────────────────
export interface Route {
  id: string
  tenant_id: string
  origin: string
  destination: string
  stops: string[]          // text[] — ARRAY['Kota A', 'Kota B']
  duration_est: number     // integer NOT NULL — kolom lama, nilai sama dengan duration_minutes
  duration_minutes: number
  is_active: boolean
}

export interface PickupPoint {
  id: string
  label: string
  address: string
  order: number
}

export type ScheduleStatus = 'scheduled' | 'boarding' | 'on_trip' | 'completed' | 'cancelled'

export interface Schedule {
  id: string
  tenant_id: string
  route_id: string
  vehicle_id: string
  driver_id: string | null
  depart_at: string
  seats_total: number
  seats_available: number
  price: number            // numeric NOT NULL — kolom lama, nilai sama dengan price_adult
  price_adult: number
  price_child: number
  pickup_points: PickupPoint[]
  status: ScheduleStatus
  service_class: 'economy' | 'executive'
  is_cancelled: boolean
  created_at: string
  // joined
  route?: Route
  vehicle?: Vehicle
  driver?: Driver
}

// ── Driver ────────────────────────────────────────────────────────────────────
export type DriverStatus = 'active' | 'inactive' | 'on_leave'

export interface Driver {
  id: string
  tenant_id: string
  user_id: string
  name: string
  phone: string
  license_no: string
  status: DriverStatus
  avg_rating: number
  created_at: string
}

// ── Booking ───────────────────────────────────────────────────────────────────
export type BookingType = 'travel' | 'rental'

export type BookingStatus =
  | 'pending_payment'
  | 'paid'
  | 'confirmed'
  | 'otw_pickup'
  | 'on_trip'
  | 'almost_arrived'
  | 'completed'
  | 'cancelled'
  | 'expired'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Booking {
  id: string
  tenant_id: string
  schedule_id: string | null
  vehicle_id: string | null
  customer_id: string
  type: BookingType
  status: BookingStatus
  payment_status: PaymentStatus
  booking_code: string
  seats: string[]
  total_amount: number
  pickup_point_id: string | null
  qr_code_url: string | null
  e_ticket_url: string | null
  invoice_url: string | null
  expires_at: string
  created_at: string
  // joined
  schedule?: Schedule
  passengers?: Passenger[]
  payment?: Payment
}

export interface Passenger {
  id: string
  booking_id: string
  name: string
  phone: string
  seat_number: string
  pickup_point_id: string | null
}

// ── Payment ───────────────────────────────────────────────────────────────────
export type PaymentMethod = 'qris' | 'virtual_account' | 'ewallet' | 'credit_card'

export interface Payment {
  id: string
  booking_id: string
  method: PaymentMethod | null
  amount: number
  status: PaymentStatus
  midtrans_token: string | null
  midtrans_order_id: string | null
  snap_token: string | null
  paid_at: string | null
  created_at: string
}

// ── Seat Map ──────────────────────────────────────────────────────────────────
export interface SeatMap {
  seat_number: string
  status: 'available' | 'selected' | 'unavailable'
  passenger_name?: string
}

// ── Rental ────────────────────────────────────────────────────────────────────
export type RentalMode = 'self_drive' | 'with_driver'
export type DepositStatus = 'held' | 'returned' | 'deducted'

export interface RentalDetail {
  id: string
  booking_id: string
  mode: RentalMode
  start_date: string
  end_date: string
  deposit_amount: number
  deposit_status: DepositStatus
  sim_url: string | null
  ktp_url: string | null
}

// ── Vehicle Log (GPS) ─────────────────────────────────────────────────────────
export interface VehicleLog {
  id: string
  vehicle_id: string
  trip_id: string | null
  lat: number
  lng: number
  speed: number
  recorded_at: string
}

// ── Rating ────────────────────────────────────────────────────────────────────
export interface Rating {
  id: string
  booking_id: string
  driver_id: string | null
  customer_id: string
  score: number
  comment: string | null
  created_at: string
}

// ── Search Params ─────────────────────────────────────────────────────────────
export interface TravelSearchParams {
  origin: string
  destination: string
  date: string // YYYY-MM-DD
  passengers: number
}

export interface RentalSearchParams {
  pickup: string
  start: string
  end: string
  withDriver: boolean
}

export interface SearchResult {
  schedules: Schedule[]
  total: number
}
