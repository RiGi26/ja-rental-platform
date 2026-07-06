-- Public storage bucket for vehicle (fleet) photos.
--
-- Fleet photos are rendered on public tenant websites (booking-proxy → Website
-- Builder), so read access is public and non-sensitive. Uploads go through the
-- authenticated admin route `POST /api/admin/vehicles/photo`, which uses the
-- service-role key (bypasses RLS) and scopes objects to `{tenant_id}/…`. Because
-- writes never use the anon/authenticated key, no per-user storage RLS policies
-- are required — the bucket's `public` flag governs reads.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicle-photos',
  'vehicle-photos',
  true,
  5242880, -- 5 MB
  array['image/jpeg','image/png','image/webp','image/avif']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
