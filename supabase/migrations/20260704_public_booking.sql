-- 20260704_public_booking.sql
-- Booking rental dari SITUS PUBLIK (Website Builder) + field display storefront.
-- Semua additive / behavior-preserving; travel tidak terpengaruh.

-- Field display kendaraan untuk storefront publik.
alter table vehicles
  add column if not exists transmission text,
  add column if not exists fuel_type    text,
  add column if not exists description  text;

-- Perlebar jenis kendaraan: rental mobil butuh mpv/hatchback/citycar/pickup
-- (set lama minibus/sedan/suv/van/bus tetap valid — additive).
alter table vehicles drop constraint if exists vehicles_type_check;
alter table vehicles add constraint vehicles_type_check
  check (type in ('minibus','sedan','suv','van','bus','mpv','hatchback','citycar','pickup'));

-- Kanal asal booking: admin walk-in vs situs web (badge/filter admin).
alter table bookings add column if not exists source text not null default 'walk_in';
alter table bookings drop constraint if exists bookings_source_check;
alter table bookings add constraint bookings_source_check
  check (source in ('walk_in','web'));

-- payments.status: webhook Midtrans menulis 'failed' tapi check lama tak memuatnya
-- (update diam-diam gagal). Perlebar — additive.
alter table payments drop constraint if exists payments_status_check;
alter table payments add constraint payments_status_check
  check (status in ('pending','paid','failed','expired','refunded'));
