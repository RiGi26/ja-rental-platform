# TRAVEL_IMPL.md
# Implementasi Fitur Travel Antar Kota — ja-rental-platform
# Dokumen ini dibaca Claude Code untuk implementasi step-by-step

---

## CONTEXT & RULES

- Stack: Next.js 15 App Router, TypeScript, Tailwind CSS, Supabase, Zustand, TanStack Query, Framer Motion, Midtrans
- Pattern: semua komponen Server Component by default, gunakan `"use client"` hanya jika perlu interaktivitas
- Auth: Supabase Auth + custom JWT claims (`tenant_id`, `role`)
- RLS: SETIAP query ke Supabase wajib mempertimbangkan RLS — jangan bypass kecuali di Server Action dengan service role
- Naming: gunakan bahasa Inggris untuk kode, bahasa Indonesia untuk UI/copy
- Error handling: SEMUA async function wajib try/catch, jangan biarkan unhandled promise
- Setiap file baru wajib ada TypeScript type yang proper — no `any`
- Midtrans: gunakan Snap.js untuk payment popup
- WA: gunakan WhatsApp Cloud API via `/api/notifications/whatsapp`
- PDF: gunakan `@react-pdf/renderer` untuk e-ticket & invoice

---

## URUTAN IMPLEMENTASI (IKUTI URUTAN INI)

```
PHASE 1 → Database & Types
PHASE 2 → Landing Page + SearchBox
PHASE 3 → Search Results (Jadwal)
PHASE 4 → Seat Picker
PHASE 5 → Booking Flow
PHASE 6 → Payment (Midtrans)
PHASE 7 → E-Ticket + PDF
PHASE 8 → Notifikasi (WA + Email)
PHASE 9 → Customer Account
PHASE 10 → Admin Panel Travel
```

---

## PHASE 1 — DATABASE & TYPES

### 1.0 Schema Aktual — Tipe Kolom & Aturan Insert

Hasil inspect schema Supabase. **Ikuti tabel ini setiap kali menulis SQL atau TypeScript.**

| Tabel | Kolom | Tipe PostgreSQL | Cara INSERT SQL | TypeScript |
|---|---|---|---|---|
| `vehicles` | `photos` | `text[]` | `ARRAY['url1', 'url2']` | `string[]` |
| `vehicles` | `type` | `text` | `'minibus'` (bukan `'travel'`) | `string` |
| `routes` | `stops` | `text[]` | `ARRAY['Kota A', 'Kota B']` | `string[]` |
| `routes` | `duration_est` | `integer NOT NULL` | isi sama dengan `duration_minutes` | `number` |
| `routes` | `is_active` | `boolean` | `true` / `false` | `boolean` |
| `schedules` | `price` | `numeric NOT NULL` | isi sama dengan `price_adult` | `number` |
| `schedules` | `service_class` | `text` | `'economy'` / `'executive'` | string literal |
| `schedules` | `is_cancelled` | `boolean` | `false` | `boolean` |
| `schedules` | `pickup_points` | `jsonb` | `'[{...}]'::jsonb` | `PickupPoint[]` |

**Aturan wajib:**
- `photos` & `stops` → `text[]` → pakai `ARRAY[...]`, **jangan** `'[...]'::jsonb`
- `pickup_points` → `jsonb` → pakai `'[...]'::jsonb`
- `routes.duration_est` wajib diisi (NOT NULL) — isi nilai sama dengan `duration_minutes`
- `schedules.price` wajib diisi (NOT NULL) — isi nilai sama dengan `price_adult`
- Seed data: **satu INSERT per baris**, jangan gabung multi-row dalam satu query panjang

---

### 1.1 Jalankan Schema SQL

Pastikan `supabase/schema.sql` sudah dijalankan. Verify tabel-tabel berikut ada:
- `tenants`, `routes`, `schedules`, `vehicles`, `drivers`
- `bookings`, `passengers`, `payments`, `ratings`
- `vehicle_logs`, `notifications`

### 1.2 Tambahan Kolom (jika belum ada)

```sql
-- Tambah ke tabel schedules jika belum ada
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS price_adult INTEGER NOT NULL DEFAULT 0;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS price_child INTEGER DEFAULT 0;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS pickup_points JSONB DEFAULT '[]';
-- pickup_points format: [{ "id": "uuid", "label": "Terminal A", "address": "Jl. ...", "order": 1 }]

-- Tambah ke tabel bookings jika belum ada
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'travel' CHECK (type IN ('travel', 'rental'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_code TEXT UNIQUE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS qr_code_url TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS e_ticket_url TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS invoice_url TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Booking code generator function
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := 'JA-';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate booking_code on insert
CREATE OR REPLACE FUNCTION set_booking_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_code IS NULL THEN
    LOOP
      NEW.booking_code := generate_booking_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM bookings WHERE booking_code = NEW.booking_code);
    END LOOP;
  END IF;
  NEW.expires_at := NOW() + INTERVAL '2 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_booking_code ON bookings;
CREATE TRIGGER trg_booking_code
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_booking_code();
```

### 1.3 RLS Policies (wajib ada)

```sql
-- Tenants: hanya bisa lihat tenant sendiri
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON tenants
  USING (id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

-- Routes: public read untuk customer, write hanya admin tenant
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "routes_public_read" ON routes FOR SELECT USING (true);
CREATE POLICY "routes_admin_write" ON routes FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid = tenant_id
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'owner', 'superadmin'));

-- Schedules: public read, admin write
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedules_public_read" ON schedules FOR SELECT USING (true);
CREATE POLICY "schedules_admin_write" ON schedules FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid = tenant_id
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'owner', 'superadmin'));

-- Bookings: customer hanya lihat booking sendiri
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_owner_read" ON bookings FOR SELECT
  USING (customer_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid = tenant_id);
CREATE POLICY "bookings_insert_authenticated" ON bookings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "bookings_update_admin" ON bookings FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'owner', 'superadmin'));
```

### 1.4 Seed Data untuk Development

Lihat `supabase/migrations/20260525_travel_phase1.sql` untuk seed data lengkap yang sudah benar.

Aturan format (lihat juga section 1.0):
```sql
-- Vehicles: photos = text[], type = 'minibus'
INSERT INTO vehicles (tenant_id, plate, type, brand, model, capacity, status, photos)
VALUES ('...', 'B 1234 ABC', 'minibus', 'Toyota', 'Hi-Ace', 15, 'available',
        ARRAY['https://placehold.co/800x500?text=Hi-Ace']);

-- Routes: stops = text[], duration_est wajib diisi (NOT NULL)
INSERT INTO routes (tenant_id, origin, destination, stops, duration_est, duration_minutes, is_active)
VALUES ('...', 'Jakarta', 'Bandung', ARRAY['Bekasi', 'Karawang'], 180, 180, true);

-- Schedules: price wajib diisi (NOT NULL), pickup_points = jsonb
INSERT INTO schedules (
  tenant_id, route_id, vehicle_id, depart_at,
  seats_total, seats_available,
  price, price_adult, price_child,
  pickup_points, status, service_class, is_cancelled
)
VALUES (
  '...', '...', '...', '2026-06-01 06:00:00+07',
  15, 15,
  150000, 150000, 100000,
  '[{"id":"pp1","label":"Terminal Bekasi","address":"Jl. Hasibuan","order":1}]'::jsonb,
  'scheduled', 'economy', false
);
```

### 1.5 TypeScript Types (update `lib/types.ts`)

```typescript
// Pastikan types ini ada di lib/types.ts

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

export interface Tenant {
  id: string
  name: string
  slug: string
  plan: string
  status: 'active' | 'suspended' | 'cancelled'
}

export interface Route {
  id: string
  tenant_id: string
  origin: string
  destination: string
  stops: string[]
  duration_minutes: number
}

export interface PickupPoint {
  id: string
  label: string
  address: string
  order: number
}

export interface Schedule {
  id: string
  tenant_id: string
  route_id: string
  vehicle_id: string
  driver_id: string | null
  depart_at: string // ISO datetime
  seats_total: number
  seats_available: number
  price_adult: number
  price_child: number
  pickup_points: PickupPoint[]
  status: 'scheduled' | 'boarding' | 'on_trip' | 'completed' | 'cancelled'
  // joined
  route?: Route
  vehicle?: Vehicle
  driver?: Driver
}

export interface Vehicle {
  id: string
  tenant_id: string
  plate: string
  type: 'travel' | 'rental'
  brand: string
  model: string
  capacity: number
  status: 'available' | 'on_trip' | 'maintenance' | 'inactive'
  photos: string[]
}

export interface Driver {
  id: string
  tenant_id: string
  user_id: string
  name: string
  phone: string
  license_no: string
  status: 'active' | 'inactive' | 'on_leave'
  avg_rating: number
}

export interface SeatMap {
  seat_number: string
  status: 'available' | 'selected' | 'unavailable'
  passenger_name?: string
}

export interface Booking {
  id: string
  tenant_id: string
  schedule_id: string | null
  customer_id: string
  type: BookingType
  status: BookingStatus
  payment_status: PaymentStatus
  booking_code: string
  seats: string[] // e.g. ["A1", "A2"]
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

export interface Payment {
  id: string
  booking_id: string
  method: 'qris' | 'virtual_account' | 'ewallet' | 'credit_card'
  amount: number
  status: PaymentStatus
  midtrans_token: string | null
  midtrans_order_id: string | null
  paid_at: string | null
}

// Search params
export interface TravelSearchParams {
  origin: string
  destination: string
  date: string // YYYY-MM-DD
  passengers: number
}

export interface SearchResult {
  schedules: Schedule[]
  total: number
}
```

---

## PHASE 2 — LANDING PAGE + SEARCHBOX

### 2.1 File yang harus diimplementasi

```
app/page.tsx                          ← Server Component, layout hero
components/search/SearchBox.tsx       ← "use client", tab Travel/Rental
components/search/TravelSearchForm.tsx ← form travel
components/search/RentalSearchForm.tsx ← form rental (stub dulu)
components/home/HeroSection.tsx       ← visual + SearchBox
components/home/StatsSection.tsx      ← social proof
components/home/HowItWorks.tsx        ← 3 langkah simpel
```

### 2.2 SearchBox Logic

```typescript
// components/search/SearchBox.tsx
// State yang dikelola:
// - activeTab: 'travel' | 'rental'
// - Framer Motion: AnimatePresence untuk tab switch

// TravelSearchForm state:
// - origin: string (autocomplete dari daftar kota)
// - destination: string (autocomplete)
// - date: Date
// - passengers: number (1-8, counter +/-)

// On submit → router.push('/search?type=travel&origin=...&destination=...&date=...&passengers=...')

// Kota yang tersedia: fetch dari /api/cities atau hardcode dulu
// Contoh kota: Jakarta, Bandung, Yogyakarta, Surabaya, Semarang, Solo,
//              Malang, Bali, Lombok, Medan, Makassar, Palembang
```

### 2.3 Design Spec Landing Page

```
Hero Section:
- min-height: 100vh (full viewport)
- Background: gradient biru gelap ke biru (#0F172A → #1E40AF) 
  atau foto armada dengan overlay gelap
- SearchBox: card putih dengan shadow besar, border-radius 16px
- Padding card: 32px desktop, 20px mobile

SearchBox Tabs:
- 2 tab: "🚌 Travel Antar Kota" | "🚗 Rental Mobil"
- Active tab: background biru, teks putih
- Inactive tab: teks abu, hover biru muda
- Animasi switch: slide/fade dengan Framer Motion

TravelSearchForm layout (desktop): 
[Asal] [Tujuan] [Tanggal] [Penumpang] [Cari →]
semua dalam satu baris dengan divider

TravelSearchForm layout (mobile):
stack vertical, full width, tombol Cari di bawah

Stats Section (di bawah hero):
- "10.000+ Penumpang" | "50+ Rute" | "4.8★ Rating" | "24/7 Support"
- Background putih, padding 48px
```

### 2.4 Implementasi `app/page.tsx`

```typescript
// app/page.tsx — Server Component
// Import: HeroSection, StatsSection, HowItWorks
// Tidak ada fetch di page ini, semua data di hero adalah static
// Meta: title "Platform Travel & Rental Mobil Terpercaya"

export const metadata = {
  title: 'JaMobility — Travel Antar Kota & Rental Mobil',
  description: 'Pesan tiket travel dan rental mobil dengan mudah, cepat, dan terpercaya.',
}
```

---

## PHASE 3 — SEARCH RESULTS (JADWAL)

### 3.1 File yang harus diimplementasi

```
app/search/page.tsx                   ← Server Component, fetch jadwal
app/search/loading.tsx                ← Skeleton loading state
components/search/ScheduleCard.tsx    ← Card satu jadwal
components/search/ScheduleList.tsx    ← List + filter/sort
components/search/SearchFilter.tsx    ← "use client", filter sidebar
components/search/NoResults.tsx       ← Empty state
lib/actions/schedule.actions.ts       ← Server Actions untuk fetch jadwal
```

### 3.2 Server Action — Fetch Jadwal

```typescript
// lib/actions/schedule.actions.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function searchSchedules(params: TravelSearchParams) {
  const supabase = createServerClient()

  const searchDate = new Date(params.date)
  const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0)).toISOString()
  const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999)).toISOString()

  const { data, error } = await supabase
    .from('schedules')
    .select(`
      *,
      route:routes(*),
      vehicle:vehicles(brand, model, photos, plate),
      driver:drivers(name, avg_rating)
    `)
    .eq('status', 'scheduled')
    .gte('depart_at', startOfDay)
    .lte('depart_at', endOfDay)
    .gte('seats_available', params.passengers)
    .order('depart_at', { ascending: true })

  // Filter by origin & destination (dari route)
  const filtered = data?.filter(s =>
    s.route?.origin?.toLowerCase() === params.origin.toLowerCase() &&
    s.route?.destination?.toLowerCase() === params.destination.toLowerCase()
  ) ?? []

  return { schedules: filtered, error }
}
```

### 3.3 ScheduleCard Design Spec

```
┌─────────────────────────────────────────────────────┐
│  [Logo/Foto Armada kecil]  Toyota Hi-Ace             │
│                                                      │
│  06:00          ~3 jam          09:00                │
│  Jakarta  ────────────────►  Bandung                 │
│           Via: Bekasi, Karawang                      │
│                                                      │
│  ⭐ 4.8  │  💺 12 kursi tersedia  │  🎫 Pilih Kursi  │
│                                                      │
│                         Rp 150.000/orang  [Pilih →] │
└─────────────────────────────────────────────────────┘

- Klik card atau tombol [Pilih] → /booking/[scheduleId]
- Badge "Hampir Penuh" jika seats_available < 5
- Badge "Segera Berangkat" jika depart_at < 2 jam dari sekarang
- Animasi: hover lift (translateY -4px, shadow lebih besar)
```

### 3.4 Filter & Sort

```typescript
// Filter options (client-side filtering dari data yang sudah di-fetch):
// - Jam berangkat: Pagi (06-12), Siang (12-17), Malam (17-24)
// - Harga: slider range
// - Jenis armada: Mini Van, Elf, Hi-Ace (dari vehicle.model)

// Sort options:
// - Berangkat Paling Awal (default)
// - Harga Termurah
// - Rating Tertinggi
// - Kursi Terbanyak

// URL params untuk filter:
// /search?type=travel&origin=Jakarta&destination=Bandung&date=2026-06-01&passengers=2&sort=price_asc
```

---

## PHASE 4 — SEAT PICKER

### 4.1 File yang harus diimplementasi

```
app/booking/[scheduleId]/page.tsx     ← Server Component
components/booking/SeatPicker.tsx     ← "use client", grid kursi
components/booking/SeatLegend.tsx     ← legenda warna kursi
lib/actions/seat.actions.ts           ← Server Action ambil status kursi
```

### 4.2 Seat Picker Logic

```typescript
// components/booking/SeatPicker.tsx

// Layout kursi: 2-1 (kiri 2 kursi, kanan 1 kursi) atau 2-2
// Tentukan layout dari vehicle.capacity:
// capacity 8-12: layout 2-1
// capacity 13-20: layout 2-2

// State:
// - seats: SeatMap[] (dari server — status tiap kursi)
// - selectedSeats: string[] (max = params.passengers)

// Logic:
// - Klik kursi 'available' → tambah ke selectedSeats
// - Klik kursi 'selected' (milik user ini) → hapus dari selectedSeats
// - Klik kursi 'unavailable' → tidak ada aksi, tampil tooltip "Kursi sudah dipesan"
// - Jika selectedSeats.length === passengers → disable kursi lain

// Warna:
// available: bg-blue-100 border-blue-300 hover:bg-blue-200
// selected: bg-blue-600 border-blue-700 text-white
// unavailable: bg-gray-200 border-gray-300 cursor-not-allowed

// Fetch kursi yang sudah terpesan:
// SELECT seat_number FROM passengers
//   JOIN bookings ON passengers.booking_id = bookings.id
//   WHERE bookings.schedule_id = [scheduleId]
//   AND bookings.status NOT IN ('cancelled', 'expired')
// → tandai sebagai 'unavailable'

// Realtime update: subscribe ke Supabase Realtime channel 'schedule:[scheduleId]'
// agar jika ada user lain pesan kursi bersamaan, seat map langsung update

// Row labels: A, B, C, D, E...
// Column: 1, 2, 3 (sesuai layout)
// Seat ID: "A1", "A2", "B1", dst
```

### 4.3 Generate Seat Map

```typescript
// lib/utils/seat.ts

export function generateSeatMap(
  capacity: number,
  bookedSeats: string[]
): SeatMap[] {
  const layout = capacity <= 12 ? [2, 1] : [2, 2]
  const cols = layout.reduce((a, b) => a + b, 0)
  const rows = Math.ceil(capacity / cols)
  const seats: SeatMap[] = []

  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let seatCount = 0

  for (let r = 0; r < rows && seatCount < capacity; r++) {
    for (let c = 1; c <= cols && seatCount < capacity; c++) {
      const seatId = `${rowLabels[r]}${c}`
      seats.push({
        seat_number: seatId,
        status: bookedSeats.includes(seatId) ? 'unavailable' : 'available',
      })
      seatCount++
    }
  }
  return seats
}
```

---

## PHASE 5 — BOOKING FLOW

### 5.1 File yang harus diimplementasi

```
app/booking/[scheduleId]/page.tsx         ← layout booking
app/booking/[scheduleId]/passenger/page.tsx ← form data penumpang
app/booking/[scheduleId]/review/page.tsx    ← review & konfirmasi
lib/actions/booking.actions.ts            ← Server Actions booking
lib/store/booking.store.ts                ← Zustand booking state
```

### 5.2 Zustand Booking Store

```typescript
// lib/store/booking.store.ts
import { create } from 'zustand'

interface BookingStore {
  scheduleId: string | null
  selectedSeats: string[]
  pickupPointId: string | null
  passengers: Omit<Passenger, 'id' | 'booking_id'>[]
  totalAmount: number

  setSchedule: (id: string) => void
  setSeats: (seats: string[]) => void
  setPickupPoint: (id: string) => void
  setPassengers: (passengers: Omit<Passenger, 'id' | 'booking_id'>[]) => void
  setTotal: (amount: number) => void
  reset: () => void
}
```

### 5.3 Alur Halaman Booking

```
Step 1: /booking/[scheduleId]
  → Tampil detail jadwal (atas)
  → SeatPicker (tengah)
  → Pilih titik jemput (bawah)
  → Tombol "Lanjut Isi Data Penumpang →"
  → Simpan ke Zustand store

Step 2: /booking/[scheduleId]/passenger
  → Form per penumpang (nama, nomor HP)
  → Validasi: semua field required, nomor HP format Indonesia
  → Tombol "Review Pesanan →"

Step 3: /booking/[scheduleId]/review  
  → Summary: jadwal, kursi, penumpang, titik jemput
  → Total harga breakdown: (harga × jumlah penumpang) + biaya layanan
  → Tombol "Bayar Sekarang →" → trigger createBooking() → Midtrans
```

### 5.4 Server Action — Create Booking

```typescript
// lib/actions/booking.actions.ts
'use server'

export async function createBooking(data: {
  scheduleId: string
  seats: string[]
  pickupPointId: string
  passengers: { name: string; phone: string; seat_number: string }[]
  totalAmount: number
}) {
  // 1. Validasi seats masih available (cek lagi di server — jangan percaya client)
  // 2. Lock seats: INSERT ke passengers dengan transaction
  // 3. INSERT ke bookings → dapat booking_code otomatis dari trigger
  // 4. INSERT ke payments (status: 'pending')
  // 5. Buat Midtrans transaction → dapat snap_token
  // 6. Return: { bookingId, snapToken, bookingCode }

  // WAJIB: Gunakan Supabase transaction atau RPC untuk atomicity
  // Jika salah satu gagal, rollback semua

  const supabase = createServerClient()

  // Cek kursi masih kosong
  const { data: existingPassengers } = await supabase
    .from('passengers')
    .select('seat_number')
    .eq('booking_id', /* subquery schedule */ '')
    .in('seat_number', data.seats)

  if (existingPassengers && existingPassengers.length > 0) {
    return { error: 'Beberapa kursi sudah dipesan oleh orang lain. Silakan pilih kursi lain.' }
  }

  // Insert booking, passengers, payments dalam satu flow
  // ...
}
```

---

## PHASE 6 — PAYMENT (MIDTRANS)

### 6.1 Setup Midtrans

```typescript
// lib/midtrans.ts
import midtransClient from 'midtrans-client'

export const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
})

export async function createSnapToken(params: {
  orderId: string
  amount: number
  customerName: string
  customerEmail: string
  customerPhone: string
  items: { id: string; name: string; price: number; quantity: number }[]
}) {
  const transaction = await snap.createTransaction({
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount,
    },
    customer_details: {
      first_name: params.customerName,
      email: params.customerEmail,
      phone: params.customerPhone,
    },
    item_details: params.items,
    expiry: {
      unit: 'hours',
      duration: 2,
    },
  })
  return transaction.token
}
```

### 6.2 Payment Page

```typescript
// app/booking/[scheduleId]/pay/page.tsx — "use client"
// 1. Ambil snapToken dari query param atau localStorage
// 2. Load Midtrans Snap.js: <Script src="https://app.sandbox.midtrans.com/snap/snap.js" />
//    Production: https://app.midtrans.com/snap/snap.js
// 3. Auto-trigger window.snap.pay(snapToken, callbacks) on mount

// Callbacks:
// onSuccess: (result) → router.push(`/booking/confirm/${bookingCode}`)
// onPending: (result) → tampilkan halaman "Menunggu Pembayaran"
// onError: (result) → tampilkan error + tombol coba lagi
// onClose: () → user menutup popup → tampilkan tombol "Lanjutkan Pembayaran"
```

### 6.3 Webhook Handler

```typescript
// app/api/webhooks/midtrans/route.ts

export async function POST(req: Request) {
  const body = await req.json()

  // 1. Verifikasi signature Midtrans:
  //    SHA512(orderId + statusCode + grossAmount + serverKey)
  const expectedSignature = crypto
    .createHash('sha512')
    .update(body.order_id + body.status_code + body.gross_amount + process.env.MIDTRANS_SERVER_KEY)
    .digest('hex')

  if (expectedSignature !== body.signature_key) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 2. Update status berdasarkan transaction_status:
  // 'capture' / 'settlement' → payment_status: 'paid', booking_status: 'confirmed'
  // 'deny' / 'cancel' / 'expire' → payment_status: 'failed', booking_status: 'cancelled'
  // 'pending' → tidak ada perubahan

  // 3. Jika paid: trigger generateETicket() + sendWhatsApp() + sendEmail()

  // PENTING: Idempotent — cek dulu apakah booking sudah berstatus 'paid'
  //          Jika iya, skip semua action (webhook bisa datang lebih dari sekali)

  return Response.json({ ok: true })
}
```

### 6.4 Fallback: Polling Status (jika webhook gagal)

```typescript
// Cron job setiap 5 menit untuk booking pending > 30 menit
// app/api/cron/check-payments/route.ts
// Vercel Cron: schedule "*/5 * * * *" di vercel.json

// Logic:
// 1. Ambil semua booking payment_status='pending' dan created_at < now - 30 menit
// 2. Untuk tiap booking, query Midtrans API: GET /v2/{orderId}/status
// 3. Update sesuai status dari Midtrans
// 4. Jika expires_at sudah lewat → set status 'expired', release kursi
```

---

## PHASE 7 — E-TICKET + PDF

### 7.1 File yang harus diimplementasi

```
app/booking/confirm/[bookingCode]/page.tsx  ← halaman sukses
components/ticket/ETicket.tsx               ← tampilan e-ticket di web
components/ticket/ETicketPDF.tsx            ← PDF version (@react-pdf/renderer)
lib/utils/qr.ts                             ← generate QR code
app/api/ticket/[bookingCode]/pdf/route.ts   ← endpoint download PDF
```

### 7.2 Konten E-Ticket

```
┌──────────────────────────────────────────────┐
│  🎫 E-TICKET                    [QR CODE]    │
│  JaMobility                                    │
│──────────────────────────────────────────────│
│  JAKARTA → BANDUNG                           │
│  Senin, 2 Juni 2026                          │
│  Berangkat: 06:00 WIB                        │
│──────────────────────────────────────────────│
│  Kode Booking: JA-X7K9M2PQ                  │
│──────────────────────────────────────────────│
│  PENUMPANG           KURSI    TITIK JEMPUT   │
│  Budi Santoso        A2       Terminal A     │
│  Rani Putri          A3       Terminal A     │
│──────────────────────────────────────────────│
│  Total: Rp 300.000  ✅ Lunas                 │
│  Armada: Toyota Hi-Ace B 1234 ABC            │
│──────────────────────────────────────────────│
│  [Download PDF] [Bagikan] [Tracking]         │
└──────────────────────────────────────────────┘
```

### 7.3 QR Code

```typescript
// lib/utils/qr.ts
// Gunakan library: npm install qrcode
// QR content: JSON.stringify({ bookingCode, type: 'travel', version: 1 })
// Generate sebagai data URL → simpan di Supabase Storage → update bookings.qr_code_url
```

### 7.4 Invoice PDF

```typescript
// Konten invoice:
// Header: Logo JaMobility, No. Invoice (INV-{bookingCode}-{date}), Tanggal
// Bill to: nama customer, email, nomor HP
// Tabel item: Tiket perjalanan × 2 penumpang, harga satuan, total
// Subtotal, Biaya layanan, Total
// Footer: catatan pembayaran, nomor kontak
// Watermark "LUNAS" jika sudah bayar
```

---

## PHASE 8 — NOTIFIKASI (WA + EMAIL)

### 8.1 WhatsApp Templates

```typescript
// lib/notifications/whatsapp.ts
// Gunakan WhatsApp Cloud API (Meta)

type WAEvent =
  | 'booking_created'      // Booking dibuat, menunggu bayar
  | 'payment_success'      // Pembayaran berhasil, e-ticket siap
  | 'payment_reminder'     // Reminder bayar (2 jam belum bayar)
  | 'departure_reminder'   // H-1 keberangkatan
  | 'driver_otw'           // Driver sedang menuju titik jemput
  | 'trip_completed'       // Perjalanan selesai

// Contoh template payment_success:
// "Halo [nama]! 🎉 Pembayaran kamu untuk perjalanan Jakarta → Bandung 
//  (2 Jun 2026, 06:00) berhasil! Kode booking: JA-X7K9M2PQ
//  E-ticket: [link] | Tracking: [link]
//  Selamat menikmati perjalanan! 🚌"

// API Call:
export async function sendWhatsApp(to: string, template: WAEvent, params: Record<string, string>) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, '').replace(/^0/, '62'),
        type: 'text',
        text: { body: buildMessage(template, params) }
      })
    }
  )
  return response.json()
}
```

### 8.2 Email (Resend)

```typescript
// lib/notifications/email.ts
// Gunakan Resend + React Email components

// Templates yang dibutuhkan:
// - BookingConfirmationEmail: e-ticket + link download PDF
// - PaymentReminderEmail: link pembayaran + deadline
// - DepartureReminderEmail: detail perjalanan H-1

// From: noreply@japanarenacorp.com (setelah domain verified)
// Subject format: "Konfirmasi Booking JA-X7K9M2PQ — Jakarta → Bandung"
```

### 8.3 Notification Queue (Anti Rate-Limit)

```typescript
// Jangan panggil WA & email langsung di webhook — gunakan queue
// Implementasi sederhana: Supabase Edge Function + pg_cron

// 1. Webhook insert ke tabel notification_queue
//    { booking_id, event, channel: 'whatsapp' | 'email', status: 'pending' }
// 2. Edge Function berjalan setiap menit, ambil pending notifications
// 3. Kirim, update status → 'sent' atau 'failed' (max 3 retry)
```

---

## PHASE 9 — CUSTOMER ACCOUNT

### 9.1 File yang harus diimplementasi

```
app/account/page.tsx                  ← Dashboard customer
app/account/bookings/page.tsx         ← Histori booking
app/account/bookings/[code]/page.tsx  ← Detail booking + tracking link
app/account/profile/page.tsx          ← Edit profil
app/auth/login/page.tsx               ← Login form
app/auth/register/page.tsx            ← Register form
lib/actions/auth.actions.ts           ← Server Actions auth
```

### 9.2 Auth Flow

```typescript
// Register: email + password → Supabase Auth signUp
// Setelah register: insert ke tabel customers (id = auth.uid())
// Login: email/password atau Google OAuth
// Session: Supabase session via cookies (sudah handle di middleware.ts)

// Google OAuth setup di Supabase Dashboard:
// Authentication → Providers → Google → enable
// Callback URL: https://[project].supabase.co/auth/v1/callback
```

### 9.3 Histori Booking

```typescript
// Query:
// SELECT bookings.*, schedules.*, routes.* FROM bookings
//   JOIN schedules ON bookings.schedule_id = schedules.id
//   JOIN routes ON schedules.route_id = routes.id
//   WHERE bookings.customer_id = auth.uid()
//   ORDER BY bookings.created_at DESC

// Tampilan:
// - Card per booking dengan BookingStatusBadge
// - Booking aktif (status bukan completed/cancelled) → tampil paling atas
// - Link ke e-ticket, invoice, dan tracking
// - Tombol "Beri Rating" jika completed dan belum ada rating
```

---

## PHASE 10 — ADMIN PANEL TRAVEL

### 10.1 File yang harus diimplementasi

```
app/admin/page.tsx                    ← Dashboard (stats + recent bookings)
app/admin/bookings/page.tsx           ← Tabel semua booking
app/admin/bookings/[id]/page.tsx      ← Detail booking + action (konfirmasi, reschedule)
app/admin/routes/page.tsx             ← Kelola rute
app/admin/schedules/page.tsx          ← Kelola jadwal
app/admin/schedules/new/page.tsx      ← Buat jadwal baru
components/admin/BookingTable.tsx     ← Tabel dengan filter & sort
components/admin/ManifestButton.tsx   ← Export manifest PDF
```

### 10.2 Dashboard Stats

```typescript
// Fetch di Server Component (no loading state jika < 1 detik):
// const [bookingsToday, revenue, pendingBookings, upcomingSchedules] = await Promise.all([
//   countBookingsToday(supabase),
//   getRevenueToday(supabase),
//   countPendingBookings(supabase),
//   getUpcomingSchedules(supabase, 6) // jadwal 6 jam ke depan
// ])
```

### 10.3 Manifest Penumpang

```typescript
// Manifest per jadwal:
// - Tampil di halaman /admin/schedules/[id]
// - Data: nomor urut, nama penumpang, kursi, titik jemput, nomor HP
// - Export: PDF menggunakan @react-pdf/renderer atau print browser
// - Endpoint: GET /api/admin/manifest/[scheduleId]?format=pdf
```

### 10.4 Konfirmasi Manual (Transfer Bank)

```typescript
// Tombol "Konfirmasi Pembayaran" di detail booking
// Hanya muncul jika payment_status === 'pending' && method === 'virtual_account'
// Action: 
// 1. Update payment status → 'paid'
// 2. Update booking status → 'confirmed'
// 3. Trigger notifikasi WA + email ke customer
// 4. Generate e-ticket
// Log: catat admin yang konfirmasi + timestamp di booking history
```

---

## ENV VARS YANG DIBUTUHKAN

Pastikan semua ini ada di `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Midtrans
MIDTRANS_SERVER_KEY=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# WhatsApp Cloud API
WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=JaMobility
```

---

## TESTING CHECKLIST PER PHASE

Setelah tiap phase, lakukan testing berikut sebelum lanjut:

```
PHASE 2 ✓
[ ] Landing page render di mobile 375px tanpa scroll horizontal
[ ] Tab Travel/Rental switch dengan animasi smooth
[ ] Form validation: kota asal = tujuan harus ditolak
[ ] Submit form redirect ke /search dengan params benar

PHASE 3 ✓
[ ] Fetch jadwal by tanggal + rute benar
[ ] Tidak ada jadwal yang seats_available < passengers yang diminta
[ ] Filter jam berangkat berjalan
[ ] Skeleton loading tampil sebelum data masuk
[ ] Empty state tampil jika tidak ada hasil

PHASE 4 ✓
[ ] Seat picker render sesuai kapasitas kendaraan
[ ] Kursi yang sudah dipesan tidak bisa dipilih
[ ] Maksimal kursi yang bisa dipilih = passengers dari search
[ ] Realtime update jika user lain pesan kursi bersamaan

PHASE 5 ✓
[ ] State booking tersimpan di Zustand selama alur multi-step
[ ] Refresh halaman booking → redirect ke awal (jangan biarkan state kosong)
[ ] Validasi semua field passenger sebelum review

PHASE 6 ✓
[ ] Midtrans Snap popup terbuka
[ ] Sandbox test: bayar berhasil → webhook masuk → status update
[ ] Webhook signature verified (jangan terima tanpa verifikasi)
[ ] Idempotent: webhook duplikat tidak double-update

PHASE 7 ✓
[ ] QR code terbaca oleh scanner HP
[ ] PDF bisa dibuka di browser mobile
[ ] Konten PDF sesuai template (tidak ada field kosong)

PHASE 8 ✓
[ ] WA terkirim ke nomor yang benar (format 628xxx)
[ ] Email masuk dan tidak masuk spam
[ ] Gagal kirim WA tidak crash seluruh flow

PHASE 9 ✓
[ ] Register lalu langsung masuk account
[ ] Histori booking tampil sesuai user yang login
[ ] Tidak bisa akses /account tanpa login

PHASE 10 ✓
[ ] Admin tidak bisa akses /admin dengan role customer
[ ] Konfirmasi manual update status + kirim notifikasi
[ ] Manifest PDF bisa diprint
```

---

## CATATAN PENTING

1. **Jangan gunakan `any` di TypeScript** — jika tidak tahu type-nya, define dulu di `lib/types.ts`
2. **Race condition kursi** — selalu validasi seat availability di server, bukan hanya client
3. **Midtrans order_id harus unik** — gunakan `booking_code` sebagai order_id
4. **WA nomor format** — selalu normalize: hilangkan non-digit, ganti awalan `0` dengan `62`
5. **Supabase RLS** — test dengan role customer (bukan service role) untuk pastikan isolation benar
6. **Error boundary** — wrap setiap page dengan error.tsx untuk graceful error handling
7. **Loading state** — setiap halaman wajib punya loading.tsx (skeleton, bukan spinner saja)
8. **Mobile first** — test di 375px setiap phase selesai

---

*TRAVEL_IMPL.md — ja-travel-platform — JapanArena Corp — v1.0*
