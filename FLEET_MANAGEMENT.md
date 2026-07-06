# Fleet Management — the standard for rental portal + rental websites

The **rental portal is the system of record (SoR) for the fleet.** Every rental tenant
manages its vehicles here; the public tenant website (Website Builder, booking-proxy)
reads them live and reflects changes with no redeploy. This is the canonical flow — reuse
it for any rental tenant.

## Where owners manage vehicles

`/admin/fleet` (portal, e.g. `rent.webzoka.com/admin/fleet`) — **not** the Website Builder
portal. Add, edit, upload photos, and archive here. Admin/owner role required.

## Data model (`vehicles`, mmwud)

Required: `plate`, `type`, `capacity`, `status`, `price_per_day` (NOT NULL).
Optional: `brand`, `model`, `year`, `transmission`, `fuel_type`, `description`,
`photos text[]`, `next_service_date/km`, `stnk/kir/tax_expiry`.

- `type` ∈ `minibus, sedan, suv, van, bus, mpv, hatchback, citycar, pickup`
- `status` ∈ `available, on_trip, maintenance, inactive`

### Public-visibility gate (important)

A vehicle appears on the public website **only if** `status ∈ {available, on_trip}`
**and** `price_per_day > 0` (see `lib/rental/public.ts` → `PUBLIC_VEHICLE_STATUSES` and the
`.gt('price_per_day', 0)` filter in `app/api/booking/[slug]/info/route.ts`).

- **Archive = hide from website**: set `status` to `inactive` (or `maintenance`). We never
  hard-delete a vehicle — trips/bookings reference it via FK, so archiving preserves history.
  Reactivate by flipping status back to `available`.

## Photos

- Bucket **`vehicle-photos`** (public read; 5 MB; jpg/png/webp/avif) — migration
  `supabase/migrations/20260705_vehicle_photos_bucket.sql`.
- Upload via **`POST /api/admin/vehicles/photo`** (admin-only). It stores under
  `{tenant_id}/{uuid}.{ext}` with the **service-role** key (bypasses storage RLS) and returns
  the public URL. Tenant scope comes from the session, never the client.
- `vehicles.photos[0]` is the **primary** photo shown on the website; the rest are extras.
  `PhotoUploader` lets the owner reorder (⭐ = make primary) and remove.
- Public bucket is intentional: fleet photos are shown on public sites and are non-sensitive.

## How the website consumes it (no data change needed)

`GET /api/booking/[slug]/info` returns `brand, model, type, capacity, year, transmission,
fuel_type, description, photos, price_per_day`. The Website Builder asphalt renderer
(`themes/rental/asphalt/AsphaltFleetSection.tsx`) renders `photos[0]` + these fields. So
editing a vehicle in the portal updates the live site automatically.

> Extending to another rental theme: just render `v.photos?.[0]` (fallback to a Lucide
> `Car` placeholder) and the spec fields — the data is already there.

## Code map

| Concern | File |
|---|---|
| CRUD actions | `lib/actions/fleet.actions.ts` (`createVehicle`, `updateVehicle`, `setVehicleStatus`) |
| Single read (edit page) | `lib/actions/admin.actions.ts` → `getVehicleById` |
| Photo upload | `app/api/admin/vehicles/photo/route.ts` |
| List + archive UI | `app/admin/fleet/page.tsx` + `components/admin/FleetCard.tsx` |
| Add/edit form | `app/admin/fleet/{new,[id]}/page.tsx` + `components/admin/VehicleForm.tsx` |
| Reusable uploader | `components/admin/PhotoUploader.tsx` |
| Types | `lib/types.ts` (`Vehicle`, `VehicleType`, `VehicleStatus`) |
