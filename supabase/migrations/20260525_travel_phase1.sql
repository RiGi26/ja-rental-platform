-- ============================================================
-- Migration: Travel Phase 1
-- Tambah kolom, fungsi, trigger, RLS policies
-- ============================================================

-- ── Tambah kolom brand & model ke vehicles ────────────────────
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS model TEXT;

-- ── Tambah kolom ke schedules ─────────────────────────────────
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS price_adult INTEGER NOT NULL DEFAULT 0;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS price_child INTEGER DEFAULT 0;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS pickup_points JSONB DEFAULT '[]';
-- pickup_points format: [{ "id": "uuid", "label": "Terminal A", "address": "Jl. ...", "order": 1 }]
-- Rename duration_est → duration_minutes jika belum konsisten
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'scheduled'
  CHECK (status IN ('scheduled','boarding','on_trip','completed','cancelled'));

-- ── Tambah kolom ke bookings ──────────────────────────────────
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_code TEXT UNIQUE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS qr_code_url TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS e_ticket_url TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS invoice_url TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_point_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount NUMERIC;

-- Sinkronkan status booking dengan PRD
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN (
    'pending_payment','paid','confirmed',
    'otw_pickup','on_trip','almost_arrived',
    'completed','cancelled','expired'
  ));

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_check
  CHECK (payment_status IN ('pending','paid','failed','refunded'));

-- ── Tambah kolom ke passengers ────────────────────────────────
ALTER TABLE passengers ADD COLUMN IF NOT EXISTS pickup_point_id TEXT;

-- ── Tambah kolom ke routes ────────────────────────────────────
ALTER TABLE routes ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
-- Salin dari duration_est jika ada
UPDATE routes SET duration_minutes = duration_est WHERE duration_minutes IS NULL;

-- ── Booking Code Generator ────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TEXT AS $$
DECLARE
  chars  TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := 'JA-';
  i      INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_booking_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_code IS NULL THEN
    LOOP
      NEW.booking_code := generate_booking_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM bookings WHERE booking_code = NEW.booking_code);
    END LOOP;
  END IF;
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NOW() + INTERVAL '2 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_booking_code ON bookings;
CREATE TRIGGER trg_booking_code
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_booking_code();

-- ── RLS Policies ──────────────────────────────────────────────

-- Drop policy lama jika ada konflik
DROP POLICY IF EXISTS "tenant_isolation" ON tenants;
DROP POLICY IF EXISTS "routes_public_read" ON routes;
DROP POLICY IF EXISTS "routes_admin_write" ON routes;
DROP POLICY IF EXISTS "schedules_public_read" ON schedules;
DROP POLICY IF EXISTS "schedules_admin_write" ON schedules;
DROP POLICY IF EXISTS "bookings_owner_read" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_authenticated" ON bookings;
DROP POLICY IF EXISTS "bookings_update_admin" ON bookings;
DROP POLICY IF EXISTS "tenant_isolation_vehicles" ON vehicles;
DROP POLICY IF EXISTS "tenant_isolation_routes" ON routes;
DROP POLICY IF EXISTS "tenant_isolation_schedules" ON schedules;
DROP POLICY IF EXISTS "tenant_isolation_drivers" ON drivers;
DROP POLICY IF EXISTS "tenant_isolation_bookings" ON bookings;
DROP POLICY IF EXISTS "tenant_isolation_passengers" ON passengers;
DROP POLICY IF EXISTS "public_schedules_read" ON schedules;

-- Tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON tenants
  USING (id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

-- Routes: public read
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "routes_public_read" ON routes FOR SELECT USING (true);
CREATE POLICY "routes_admin_write" ON routes FOR ALL
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid = tenant_id
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','owner','superadmin')
  );

-- Schedules: public read
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedules_public_read" ON schedules FOR SELECT USING (true);
CREATE POLICY "schedules_admin_write" ON schedules FOR ALL
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid = tenant_id
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','owner','superadmin')
  );

-- Vehicles: public read, admin write
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles_public_read" ON vehicles FOR SELECT USING (true);
CREATE POLICY "vehicles_admin_write" ON vehicles FOR ALL
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid = tenant_id
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','owner','superadmin')
  );

-- Bookings: customer hanya lihat booking sendiri
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_read" ON bookings FOR SELECT
  USING (
    customer_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid = tenant_id
  );
CREATE POLICY "bookings_insert" ON bookings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "bookings_update_admin" ON bookings FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','owner','superadmin'));

-- Passengers: ikut booking
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "passengers_read" ON passengers FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE customer_id = auth.uid()
        OR (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid = tenant_id
    )
  );
CREATE POLICY "passengers_insert" ON passengers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Drivers
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drivers_tenant_read" ON drivers FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid = tenant_id);
CREATE POLICY "drivers_self_read" ON drivers FOR SELECT
  USING (user_id = auth.uid());

-- Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_read" ON payments FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE customer_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','owner','superadmin')
  );

-- ── Indexes tambahan ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_bookings_booking_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_schedules_depart_at ON schedules(depart_at);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);

-- ── Seed Data Development ─────────────────────────────────────
-- Satu INSERT per tabel

-- Tenant
INSERT INTO tenants (id, name, slug, plan, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'JaTravel Demo', 'jatravel-demo', 'pro', 'active')
ON CONFLICT (id) DO NOTHING;

-- Vehicles
-- photos: text[]  → ARRAY['url']
-- type:   text    → nilai aktual: 'minibus' (bukan 'travel')
INSERT INTO vehicles (id, tenant_id, plate, type, brand, model, capacity, status, photos)
VALUES ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001',
        'B 1234 ABC', 'minibus', 'Toyota', 'Hi-Ace', 15, 'available',
        ARRAY['https://placehold.co/800x500?text=Hi-Ace'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO vehicles (id, tenant_id, plate, type, brand, model, capacity, status, photos)
VALUES ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001',
        'B 5678 DEF', 'minibus', 'Isuzu', 'Elf', 12, 'available',
        ARRAY['https://placehold.co/800x500?text=Elf'])
ON CONFLICT (id) DO NOTHING;

-- Routes
-- stops:         text[]  → ARRAY['Kota A', 'Kota B']  (bukan jsonb)
-- duration_est:  integer NOT NULL (kolom lama, isi bersamaan duration_minutes)
-- is_active:     boolean
INSERT INTO routes (id, tenant_id, origin, destination, stops, duration_est, duration_minutes, is_active)
VALUES ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001',
        'Jakarta', 'Bandung', ARRAY['Bekasi', 'Karawang'], 180, 180, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO routes (id, tenant_id, origin, destination, stops, duration_est, duration_minutes, is_active)
VALUES ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001',
        'Jakarta', 'Yogyakarta', ARRAY['Purwokerto', 'Kebumen'], 480, 480, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO routes (id, tenant_id, origin, destination, stops, duration_est, duration_minutes, is_active)
VALUES ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001',
        'Bandung', 'Jakarta', ARRAY['Karawang', 'Bekasi'], 180, 180, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO routes (id, tenant_id, origin, destination, stops, duration_est, duration_minutes, is_active)
VALUES ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001',
        'Jakarta', 'Semarang', ARRAY['Cirebon', 'Pekalongan'], 360, 360, true)
ON CONFLICT (id) DO NOTHING;

-- Schedules
-- price:         numeric NOT NULL (kolom lama, isi sama dengan price_adult)
-- pickup_points: jsonb → '...'::jsonb
-- service_class: text default 'economy'
-- is_cancelled:  boolean default false
INSERT INTO schedules (
  tenant_id, route_id, vehicle_id,
  depart_at, seats_total, seats_available,
  price, price_adult, price_child,
  pickup_points, status, service_class, is_cancelled
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  (CURRENT_DATE + 1 || ' 06:00:00')::timestamptz,
  15, 15,
  150000, 150000, 100000,
  '[{"id":"pp1","label":"Terminal Bekasi","address":"Jl. Hasibuan No.1, Bekasi","order":1},
    {"id":"pp2","label":"Pool Jakarta Timur","address":"Jl. Matraman No.7, Jakarta","order":2}]'::jsonb,
  'scheduled', 'economy', false
);

INSERT INTO schedules (
  tenant_id, route_id, vehicle_id,
  depart_at, seats_total, seats_available,
  price, price_adult, price_child,
  pickup_points, status, service_class, is_cancelled
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000102',
  (CURRENT_DATE + 1 || ' 09:00:00')::timestamptz,
  12, 12,
  135000, 135000, 90000,
  '[{"id":"pp3","label":"Pool Kalimalang","address":"Jl. Kalimalang No.5, Bekasi","order":1}]'::jsonb,
  'scheduled', 'economy', false
);

INSERT INTO schedules (
  tenant_id, route_id, vehicle_id,
  depart_at, seats_total, seats_available,
  price, price_adult, price_child,
  pickup_points, status, service_class, is_cancelled
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  (CURRENT_DATE + 1 || ' 14:00:00')::timestamptz,
  15, 15,
  150000, 150000, 100000,
  '[{"id":"pp1","label":"Terminal Bekasi","address":"Jl. Hasibuan No.1, Bekasi","order":1}]'::jsonb,
  'scheduled', 'economy', false
);
