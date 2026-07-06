'use server'

// ============================================================
// Fleet (vehicle) CRUD — server actions for the admin Manajemen Armada UI.
// Mirrors the pattern in admin.actions.ts (createSchedule): tenant + role resolved
// via getActiveMember (JWT-first, DB fallback), writes via the service-role client
// scoped by tenant_id. This is the system-of-record for the fleet that public
// tenant websites read live (booking-proxy → GET /api/booking/[slug]/info).
// ============================================================

import { revalidatePath } from 'next/cache'
import { createRentalServiceClient } from '@/lib/supabase/service'
import { getActiveMember } from '@/lib/tenant-entitlements'
import type { VehicleStatus, VehicleType } from '@/lib/types'

const VEHICLE_TYPES: VehicleType[] = [
  'minibus', 'sedan', 'suv', 'van', 'bus', 'mpv', 'hatchback', 'citycar', 'pickup',
]
const VEHICLE_STATUSES: VehicleStatus[] = ['available', 'on_trip', 'maintenance', 'inactive']
const ADMIN_ROLES = ['admin', 'owner', 'superadmin']
const MAX_PHOTOS = 12

export interface VehicleInput {
  brand: string
  model: string
  plate: string
  type: string
  capacity: number
  year?: number | null
  price_per_day: number
  transmission?: string | null
  fuel_type?: string | null
  description?: string | null
  status: string
  photos: string[]
  next_service_date?: string | null
  next_service_km?: number | null
  stnk_expiry?: string | null
  kir_expiry?: string | null
  tax_expiry?: string | null
}

async function requireTenantAdmin(): Promise<{ tenantId: string } | { error: string }> {
  const member = await getActiveMember()
  if (!member?.tenantId) return { error: 'Sesi tidak valid. Silakan login ulang.' }
  if (!ADMIN_ROLES.includes(member.role ?? '')) return { error: 'Akun ini tidak berwenang mengelola armada.' }
  return { tenantId: member.tenantId }
}

/** Validate + coerce a form payload into a DB row (excluding tenant_id). */
function normalize(input: VehicleInput): { row: Record<string, unknown> } | { error: string } {
  const plate = (input.plate ?? '').trim().toUpperCase()
  const brand = (input.brand ?? '').trim()
  const model = (input.model ?? '').trim()
  const type  = (input.type ?? '').trim()
  const status = (input.status ?? 'available').trim()
  const capacity = Number(input.capacity)
  const price = Number(input.price_per_day)

  if (!plate) return { error: 'Nomor plat wajib diisi.' }
  if (!brand) return { error: 'Merek wajib diisi.' }
  if (!model) return { error: 'Model wajib diisi.' }
  if (!VEHICLE_TYPES.includes(type as VehicleType)) return { error: 'Tipe kendaraan tidak valid.' }
  if (!VEHICLE_STATUSES.includes(status as VehicleStatus)) return { error: 'Status tidak valid.' }
  if (!Number.isFinite(capacity) || capacity < 1) return { error: 'Kapasitas minimal 1 kursi.' }
  if (!Number.isFinite(price) || price <= 0) return { error: 'Harga sewa per hari harus lebih dari 0.' }

  const text = (s?: string | null) => {
    const t = (s ?? '').trim()
    return t === '' ? null : t
  }
  const posInt = (n?: number | null) => {
    const v = Number(n)
    return Number.isFinite(v) && v > 0 ? Math.round(v) : null
  }
  const photos = Array.isArray(input.photos)
    ? input.photos.filter((u) => typeof u === 'string' && u.trim() !== '').slice(0, MAX_PHOTOS)
    : []

  return {
    row: {
      plate,
      brand,
      model,
      type,
      status,
      capacity: Math.round(capacity),
      price_per_day: Math.round(price),
      year: posInt(input.year),
      transmission: text(input.transmission),
      fuel_type: text(input.fuel_type),
      description: text(input.description),
      photos,
      next_service_date: text(input.next_service_date),
      next_service_km: posInt(input.next_service_km),
      stnk_expiry: text(input.stnk_expiry),
      kir_expiry: text(input.kir_expiry),
      tax_expiry: text(input.tax_expiry),
    },
  }
}

export async function createVehicle(input: VehicleInput) {
  const auth = await requireTenantAdmin()
  if ('error' in auth) return { error: auth.error }
  const parsed = normalize(input)
  if ('error' in parsed) return { error: parsed.error }

  const db = createRentalServiceClient()
  const { data, error } = await db
    .from('vehicles')
    .insert({ tenant_id: auth.tenantId, ...parsed.row })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/admin/fleet')
  return { success: true, id: data.id as string }
}

export async function updateVehicle(id: string, input: VehicleInput) {
  const auth = await requireTenantAdmin()
  if ('error' in auth) return { error: auth.error }
  if (!id) return { error: 'ID kendaraan tidak valid.' }
  const parsed = normalize(input)
  if ('error' in parsed) return { error: parsed.error }

  const db = createRentalServiceClient()
  const { error } = await db
    .from('vehicles')
    .update(parsed.row)
    .eq('id', id)
    .eq('tenant_id', auth.tenantId)

  if (error) return { error: error.message }
  revalidatePath('/admin/fleet')
  return { success: true }
}

/** Archive (status → inactive/maintenance) or reactivate. Preserves booking history
 *  and FKs — we never hard-delete a vehicle that trips/bookings may reference. */
export async function setVehicleStatus(id: string, status: string) {
  const auth = await requireTenantAdmin()
  if ('error' in auth) return { error: auth.error }
  if (!id) return { error: 'ID kendaraan tidak valid.' }
  if (!VEHICLE_STATUSES.includes(status as VehicleStatus)) return { error: 'Status tidak valid.' }

  const db = createRentalServiceClient()
  const { error } = await db
    .from('vehicles')
    .update({ status })
    .eq('id', id)
    .eq('tenant_id', auth.tenantId)

  if (error) return { error: error.message }
  revalidatePath('/admin/fleet')
  return { success: true }
}
