'use server'

import { createRentalServiceClient } from '@/lib/supabase/service'
import { getActiveTenantId, getTenantEntitlements, hasEntitlement } from '@/lib/tenant-entitlements'
import { findDateConflict, genBookingCode } from '@/lib/rental/booking'
import { daysBetween } from '@/lib/utils'

// ============================================================
// Server Actions — Rental Self-Drive (tier 'selfdrive' / Pro).
// Pakai ulang `bookings` (type='rental', vehicle_id) + `rental_details`. Semua akses
// via service-role (bypass RLS), tenant-scoped dengan .eq('tenant_id', …). Diskon
// harga & denda dihitung/di-clamp di server. Client memicu router.refresh() setelah
// mutasi (konvensi repo — bukan revalidatePath).
// ============================================================

async function requireSelfdrive(): Promise<{ tenantId?: string; error?: string }> {
  const tenantId = await getActiveTenantId()
  if (!tenantId) return { error: 'Sesi tidak ditemukan. Silakan masuk kembali.' }
  const ent = await getTenantEntitlements(tenantId)
  if (!hasEntitlement(ent, 'selfdrive')) {
    return { error: 'Fitur rental self-drive tidak tersedia di paket langganan Anda.' }
  }
  return { tenantId }
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface RentalVehicleOption {
  id: string
  label: string
  plate: string
  status: string
  pricePerDay: number
}

export interface RentalRow {
  bookingId: string
  bookingCode: string
  status: string
  paymentStatus: string
  /** Kanal asal booking: 'walk_in' (admin) | 'web' (situs publik). */
  source: string
  total: number
  vehicleLabel: string
  plate: string
  detailId: string | null
  mode: string | null
  startDate: string | null
  endDate: string | null
  dailyRate: number
  depositAmount: number
  depositStatus: string | null
  renterName: string | null
  renterPhone: string | null
  actualReturnDate: string | null
  lateFeeAmount: number
  lateFeeStatus: string | null
  notes: string | null
}

type RentalDetailEmbed = {
  id: string; mode: string | null; start_date: string | null; end_date: string | null
  daily_rate: number | null; deposit_amount: number | null; deposit_status: string | null
  renter_name: string | null; renter_phone: string | null; actual_return_date: string | null
  late_fee_amount: number | null; late_fee_status: string | null; notes: string | null
}

// ── Reads (Server Components) ────────────────────────────────────────────────

export async function getRentalBookings(): Promise<RentalRow[]> {
  const tenantId = await getActiveTenantId()
  if (!tenantId) return []
  const supabase = createRentalServiceClient()

  const { data } = await supabase
    .from('bookings')
    .select(`
      id, booking_code, status, payment_status, source, total, vehicle_id,
      vehicle:vehicles(plate, brand, model),
      rental:rental_details(id, mode, start_date, end_date, daily_rate, deposit_amount, deposit_status,
        renter_name, renter_phone, actual_return_date, late_fee_amount, late_fee_status, notes)
    `)
    .eq('tenant_id', tenantId)
    .eq('type', 'rental')
    .order('created_at', { ascending: false })

  return (data ?? []).map((b: any): RentalRow => {
    const v = b.vehicle as { plate?: string; brand?: string; model?: string } | null
    const r = (Array.isArray(b.rental) ? b.rental[0] : b.rental) as RentalDetailEmbed | null
    return {
      bookingId: b.id,
      bookingCode: b.booking_code,
      status: b.status,
      paymentStatus: b.payment_status,
      source: b.source ?? 'walk_in',
      total: Number(b.total) || 0,
      vehicleLabel: v ? `${v.brand ?? ''} ${v.model ?? ''}`.trim() || (v.plate ?? '—') : '—',
      plate: v?.plate ?? '—',
      detailId: r?.id ?? null,
      mode: r?.mode ?? null,
      startDate: r?.start_date ?? null,
      endDate: r?.end_date ?? null,
      dailyRate: Number(r?.daily_rate) || 0,
      depositAmount: Number(r?.deposit_amount) || 0,
      depositStatus: r?.deposit_status ?? null,
      renterName: r?.renter_name ?? null,
      renterPhone: r?.renter_phone ?? null,
      actualReturnDate: r?.actual_return_date ?? null,
      lateFeeAmount: Number(r?.late_fee_amount) || 0,
      lateFeeStatus: r?.late_fee_status ?? null,
      notes: r?.notes ?? null,
    }
  })
}

export async function getRentalVehicles(): Promise<RentalVehicleOption[]> {
  const tenantId = await getActiveTenantId()
  if (!tenantId) return []
  const supabase = createRentalServiceClient()
  const { data } = await supabase
    .from('vehicles')
    .select('id, plate, brand, model, status, price_per_day')
    .eq('tenant_id', tenantId)
    .order('plate', { ascending: true })

  return (data ?? []).map((v: any): RentalVehicleOption => ({
    id: v.id,
    label: `${v.brand ?? ''} ${v.model ?? ''}`.trim() ? `${v.brand ?? ''} ${v.model ?? ''} · ${v.plate}` : v.plate,
    plate: v.plate,
    status: v.status,
    pricePerDay: Number(v.price_per_day) || 0,
  }))
}

// ── Writes ───────────────────────────────────────────────────────────────────

export interface CreateRentalInput {
  vehicleId: string
  renterName: string
  renterPhone: string
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
  dailyRate: number
  depositAmount?: number
  notes?: string
}

export async function createRentalBooking(
  input: CreateRentalInput,
): Promise<{ success?: true; bookingCode?: string; error?: string }> {
  const guard = await requireSelfdrive()
  if (guard.error) return { error: guard.error }
  const tenantId = guard.tenantId!

  const renterName = input.renterName?.trim()
  const renterPhone = input.renterPhone?.trim()
  if (!input.vehicleId) return { error: 'Pilih kendaraan.' }
  if (!renterName || !renterPhone) return { error: 'Nama & nomor telepon penyewa wajib diisi.' }
  if (!input.startDate || !input.endDate) return { error: 'Tanggal mulai & selesai wajib diisi.' }
  if (input.endDate < input.startDate) return { error: 'Tanggal selesai tidak boleh sebelum tanggal mulai.' }
  const dailyRate = Number(input.dailyRate)
  if (!Number.isFinite(dailyRate) || dailyRate <= 0) return { error: 'Tarif sewa harian harus lebih dari 0.' }

  const days = Math.max(1, daysBetween(input.startDate, input.endDate))
  const total = days * dailyRate
  const depositAmount = Math.max(0, Number(input.depositAmount) || 0)

  const supabase = createRentalServiceClient()

  // Verifikasi kendaraan milik tenant.
  const { data: vehicle } = await supabase
    .from('vehicles').select('id').eq('id', input.vehicleId).eq('tenant_id', tenantId).maybeSingle()
  if (!vehicle) return { error: 'Kendaraan tidak ditemukan.' }

  // Guard ketersediaan: tolak bila unit punya sewa aktif yang tanggalnya bentrok.
  // (Util bersama dengan endpoint booking publik — pending kedaluwarsa tak menghitung.)
  const conflict = await findDateConflict(supabase, {
    tenantId,
    vehicleId: input.vehicleId,
    startDate: input.startDate,
    endDate: input.endDate,
  })
  if (conflict) {
    return { error: `Kendaraan sudah tersewa pada ${conflict.start_date} – ${conflict.end_date}. Pilih tanggal atau unit lain.` }
  }

  // Insert booking (type='rental') → lalu rental_details.
  const bookingCode = genBookingCode()
  const { data: booking, error: bErr } = await supabase
    .from('bookings')
    .insert({
      tenant_id: tenantId,
      type: 'rental',
      vehicle_id: input.vehicleId,
      status: 'confirmed',
      payment_status: 'paid',
      booking_code: bookingCode,
      total,
      total_amount: total,
      seats: [],
      source: 'walk_in',
    })
    .select('id')
    .single()
  if (bErr || !booking) {
    console.error('createRentalBooking booking error:', bErr)
    return { error: 'Gagal membuat sewa. Coba lagi.' }
  }

  const { error: rErr } = await supabase.from('rental_details').insert({
    booking_id: booking.id,
    mode: 'self_drive',
    start_date: input.startDate,
    end_date: input.endDate,
    daily_rate: dailyRate,
    deposit_amount: depositAmount,
    deposit_status: 'held',
    renter_name: renterName,
    renter_phone: renterPhone,
    notes: input.notes?.trim() || null,
  })
  if (rErr) {
    // Rollback manual: hapus booking supaya tak ada order rental tanpa detail.
    await supabase.from('bookings').delete().eq('id', booking.id).eq('tenant_id', tenantId)
    console.error('createRentalBooking detail error:', rErr)
    return { error: 'Gagal menyimpan detail sewa. Coba lagi.' }
  }

  return { success: true, bookingCode }
}

export interface ReturnRentalInput {
  bookingId: string
  detailId: string
  actualReturnDate: string
  lateFeeAmount: number
  lateFeeStatus: 'pending' | 'waived' | 'collected'
  depositStatus: 'held' | 'returned' | 'deducted'
  notes?: string
}

export async function returnRental(input: ReturnRentalInput): Promise<{ success?: true; error?: string }> {
  const guard = await requireSelfdrive()
  if (guard.error) return { error: guard.error }
  const tenantId = guard.tenantId!
  if (!input.detailId || !input.bookingId) return { error: 'Data sewa tidak lengkap.' }
  if (!input.actualReturnDate) return { error: 'Tanggal pengembalian wajib diisi.' }

  const supabase = createRentalServiceClient()

  // Pastikan booking milik tenant (rental_details tak punya tenant_id langsung).
  const { data: booking } = await supabase
    .from('bookings').select('id').eq('id', input.bookingId).eq('tenant_id', tenantId).eq('type', 'rental').maybeSingle()
  if (!booking) return { error: 'Sewa tidak ditemukan.' }

  const { error: rErr } = await supabase
    .from('rental_details')
    .update({
      actual_return_date: input.actualReturnDate,
      late_fee_amount: Math.max(0, Number(input.lateFeeAmount) || 0),
      late_fee_status: input.lateFeeStatus,
      deposit_status: input.depositStatus,
      notes: input.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.detailId)
    .eq('booking_id', input.bookingId)
  if (rErr) {
    console.error('returnRental detail error:', rErr)
    return { error: 'Gagal menyimpan pengembalian.' }
  }

  const { error: bErr } = await supabase
    .from('bookings').update({ status: 'completed' }).eq('id', input.bookingId).eq('tenant_id', tenantId)
  if (bErr) {
    console.error('returnRental booking error:', bErr)
    return { error: 'Gagal menandai sewa selesai.' }
  }
  return { success: true }
}

export async function updateDepositStatus(
  detailId: string,
  bookingId: string,
  depositStatus: 'held' | 'returned' | 'deducted',
): Promise<{ success?: true; error?: string }> {
  const guard = await requireSelfdrive()
  if (guard.error) return { error: guard.error }
  const tenantId = guard.tenantId!

  const supabase = createRentalServiceClient()
  const { data: booking } = await supabase
    .from('bookings').select('id').eq('id', bookingId).eq('tenant_id', tenantId).maybeSingle()
  if (!booking) return { error: 'Sewa tidak ditemukan.' }

  const { error } = await supabase
    .from('rental_details')
    .update({ deposit_status: depositStatus, updated_at: new Date().toISOString() })
    .eq('id', detailId)
    .eq('booking_id', bookingId)
  if (error) {
    console.error('updateDepositStatus error:', error)
    return { error: 'Gagal memperbarui status deposit.' }
  }
  return { success: true }
}

export async function cancelRentalBooking(bookingId: string): Promise<{ success?: true; error?: string }> {
  const guard = await requireSelfdrive()
  if (guard.error) return { error: guard.error }
  const tenantId = guard.tenantId!

  const supabase = createRentalServiceClient()
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('tenant_id', tenantId)
    .eq('type', 'rental')
  if (error) {
    console.error('cancelRentalBooking error:', error)
    return { error: 'Gagal membatalkan sewa.' }
  }
  return { success: true }
}
