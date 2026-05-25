-- ============================================================
-- JA Travel Platform — Database Schema
-- JapanArena Corp • v1.0
-- ============================================================

-- ── Extensions ────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ── Tenants ────────────────────────────────────────────────────
create table tenants (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  slug       text not null unique,
  plan       text not null default 'free' check (plan in ('free','starter','pro','enterprise')),
  status     text not null default 'trial' check (status in ('active','suspended','trial')),
  created_at timestamptz default now()
);

-- ── Vehicles ───────────────────────────────────────────────────
create table vehicles (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  plate       text not null,
  type        text not null check (type in ('minibus','sedan','suv','van','bus')),
  capacity    int not null,
  year        int,
  status      text not null default 'available' check (status in ('available','on_trip','maintenance','inactive')),
  photos      text[] default '{}',
  -- servis & dokumen reminders
  next_service_km    int,
  next_service_date  date,
  stnk_expiry        date,
  kir_expiry         date,
  tax_expiry         date,
  created_at  timestamptz default now()
);

-- ── Routes ─────────────────────────────────────────────────────
create table routes (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  origin        text not null,
  destination   text not null,
  stops         text[] default '{}',       -- titik jemput urut
  duration_est  int not null,              -- estimasi menit
  is_active     boolean default true,
  created_at    timestamptz default now()
);

-- ── Schedules ──────────────────────────────────────────────────
create table schedules (
  id               uuid primary key default uuid_generate_v4(),
  tenant_id        uuid not null references tenants(id) on delete cascade,
  route_id         uuid not null references routes(id),
  vehicle_id       uuid references vehicles(id),
  driver_id        uuid,                   -- FK ke drivers setelah tabel dibuat
  depart_at        timestamptz not null,
  seats_total      int not null,
  seats_available  int not null,
  price            numeric not null,
  service_class    text default 'economy' check (service_class in ('economy','executive')),
  is_cancelled     boolean default false,
  created_at       timestamptz default now()
);

-- ── Drivers ────────────────────────────────────────────────────
create table drivers (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  user_id     uuid references auth.users(id),
  name        text not null,
  phone       text not null,
  license_no  text not null,
  status      text not null default 'active' check (status in ('active','inactive','on_leave')),
  avg_rating  numeric default 0,
  created_at  timestamptz default now()
);

alter table schedules add constraint fk_driver foreign key (driver_id) references drivers(id);

-- ── Bookings ───────────────────────────────────────────────────
create table bookings (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  schedule_id     uuid references schedules(id),
  vehicle_id      uuid references vehicles(id),
  customer_id     uuid references auth.users(id),
  type            text not null check (type in ('travel','rental')),
  status          text not null default 'pending' check (status in ('pending','confirmed','otw_pickup','on_trip','done','cancelled')),
  payment_status  text not null default 'pending' check (payment_status in ('pending','paid','expired','refunded')),
  seats           int[] default '{}',
  total           numeric not null,
  booking_code    text not null unique,
  created_at      timestamptz default now()
);

-- ── Passengers ─────────────────────────────────────────────────
create table passengers (
  id           uuid primary key default uuid_generate_v4(),
  booking_id   uuid not null references bookings(id) on delete cascade,
  name         text not null,
  phone        text not null,
  seat_number  int,
  pickup_point text
);

-- ── Payments ───────────────────────────────────────────────────
create table payments (
  id            uuid primary key default uuid_generate_v4(),
  booking_id    uuid not null references bookings(id) on delete cascade,
  method        text,
  amount        numeric not null,
  status        text not null default 'pending' check (status in ('pending','paid','expired','refunded')),
  midtrans_ref  text,
  snap_token    text,
  paid_at       timestamptz,
  created_at    timestamptz default now()
);

-- ── Rental Details ─────────────────────────────────────────────
create table rental_details (
  id              uuid primary key default uuid_generate_v4(),
  booking_id      uuid not null references bookings(id) on delete cascade,
  mode            text not null check (mode in ('self_drive','with_driver')),
  start_date      date not null,
  end_date        date not null,
  deposit_amount  numeric default 0,
  deposit_status  text default 'held' check (deposit_status in ('held','returned','deducted')),
  sim_url         text,
  ktp_url         text
);

-- ── Vehicle Logs (GPS) ─────────────────────────────────────────
create table vehicle_logs (
  id           uuid primary key default uuid_generate_v4(),
  vehicle_id   uuid not null references vehicles(id) on delete cascade,
  trip_id      uuid,              -- schedule_id atau booking_id
  lat          double precision not null,
  lng          double precision not null,
  speed        int default 0,
  recorded_at  timestamptz default now()
);
create index on vehicle_logs (vehicle_id, recorded_at desc);

-- ── Notifications ──────────────────────────────────────────────
create table notifications (
  id             uuid primary key default uuid_generate_v4(),
  tenant_id      uuid references tenants(id),
  recipient_type text not null check (recipient_type in ('customer','admin','driver','owner')),
  recipient_id   uuid,
  channel        text not null check (channel in ('whatsapp','email','push')),
  content        text not null,
  sent_at        timestamptz,
  created_at     timestamptz default now()
);

-- ── Ratings ────────────────────────────────────────────────────
create table ratings (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid not null references bookings(id),
  driver_id   uuid references drivers(id),
  customer_id uuid references auth.users(id),
  score       int not null check (score between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);

-- ============================================================
-- RLS Policies — Multi-Tenant Pattern JapanArena Corp
-- ============================================================

alter table tenants        enable row level security;
alter table vehicles       enable row level security;
alter table routes         enable row level security;
alter table schedules      enable row level security;
alter table drivers        enable row level security;
alter table bookings       enable row level security;
alter table passengers     enable row level security;
alter table payments       enable row level security;
alter table rental_details enable row level security;
alter table vehicle_logs   enable row level security;
alter table notifications  enable row level security;
alter table ratings        enable row level security;

-- Tenant isolation: semua row hanya visible ke user dengan tenant_id yang cocok
create policy "tenant_isolation_vehicles" on vehicles
  using ((auth.jwt() ->> 'tenant_id')::uuid = tenant_id);

create policy "tenant_isolation_routes" on routes
  using ((auth.jwt() ->> 'tenant_id')::uuid = tenant_id);

create policy "tenant_isolation_schedules" on schedules
  using ((auth.jwt() ->> 'tenant_id')::uuid = tenant_id);

create policy "tenant_isolation_drivers" on drivers
  using ((auth.jwt() ->> 'tenant_id')::uuid = tenant_id);

create policy "tenant_isolation_bookings" on bookings
  using (
    (auth.jwt() ->> 'tenant_id')::uuid = tenant_id
    or customer_id = auth.uid()  -- customer lihat booking sendiri
  );

create policy "tenant_isolation_passengers" on passengers
  using (
    booking_id in (
      select id from bookings
      where tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
         or customer_id = auth.uid()
    )
  );

create policy "public_schedules_read" on schedules
  for select using (not is_cancelled);

-- ============================================================
-- Indexes
-- ============================================================
create index on bookings (tenant_id, status);
create index on bookings (customer_id);
create index on bookings (booking_code);
create index on schedules (route_id, depart_at);
create index on schedules (tenant_id, depart_at);
create index on payments (booking_id);
create index on passengers (booking_id);
