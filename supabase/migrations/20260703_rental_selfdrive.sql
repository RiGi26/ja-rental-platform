-- 20260703_rental_selfdrive.sql
-- Modul RENTAL SELF-DRIVE + denda keterlambatan.
-- Pakai ulang `bookings` (type='rental', vehicle_id) + `rental_details` (sudah ada).
-- Tambah: harga sewa harian di vehicles, dan kolom return/denda + identitas penyewa
-- (bookings tak punya field nama/telp untuk walk-in) + snapshot daily_rate agar
-- perhitungan denda tidak bergantung harga vehicle yang bisa berubah.

alter table vehicles add column if not exists price_per_day numeric not null default 0;

alter table rental_details
  add column if not exists daily_rate         numeric not null default 0,
  add column if not exists renter_name        text,
  add column if not exists renter_phone       text,
  add column if not exists actual_return_date date,
  add column if not exists late_fee_amount    numeric not null default 0,
  add column if not exists late_fee_status    text not null default 'pending'
    check (late_fee_status in ('pending','waived','collected')),
  add column if not exists notes              text,
  add column if not exists updated_at         timestamptz not null default now();

-- Covering FK index (join listing) + availability lookup (overlap per unit).
create index if not exists idx_rental_details_booking_id on rental_details(booking_id);
create index if not exists idx_bookings_vehicle_id on bookings(vehicle_id) where vehicle_id is not null;

-- rental_details: RLS enabled tapi 0 policy (memicu advisor rls_enabled_no_policy).
-- Modul admin akses via service-role (bypass RLS); policy ini = defense-in-depth +
-- membersihkan advisor. Tenant-isolation lewat parent booking; auth.* dibungkus
-- (select ...) untuk init-plan.
drop policy if exists rental_details_tenant on rental_details;
create policy rental_details_tenant on rental_details
  for all
  using (
    exists (
      select 1 from bookings b
      where b.id = rental_details.booking_id
        and (b.customer_id = (select auth.uid())
             or ((select auth.jwt()) ->> 'tenant_id')::uuid = b.tenant_id)
    )
  )
  with check (
    exists (
      select 1 from bookings b
      where b.id = rental_details.booking_id
        and ((select auth.jwt()) ->> 'tenant_id')::uuid = b.tenant_id
    )
  );
