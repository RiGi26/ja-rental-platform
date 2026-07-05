// ============================================================
// POST /api/admin/vehicles/photo — upload one fleet photo.
// Admin/owner only (getActiveMember, JWT-first with DB fallback). The file is
// stored under `{tenant_id}/{uuid}.{ext}` in the public `vehicle-photos` bucket
// via the service-role client (bypasses storage RLS). Returns the public URL,
// which the caller saves into vehicles.photos[] (first = primary, shown on the
// public site). Tenant scoping comes from the session — never from the client.
// ============================================================
import { NextResponse } from 'next/server'
import { createRentalServiceClient } from '@/lib/supabase/service'
import { getActiveMember } from '@/lib/tenant-entitlements'

export const dynamic = 'force-dynamic'

const BUCKET = 'vehicle-photos'
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB — must match the bucket's file_size_limit
const ADMIN_ROLES = ['admin', 'owner', 'superadmin']
const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

export async function POST(request: Request) {
  const member = await getActiveMember()
  if (!member?.tenantId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!ADMIN_ROLES.includes(member.role ?? '')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'invalid_form' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'no_file' }, { status: 400 })

  const ext = MIME_EXT[file.type]
  if (!ext) return NextResponse.json({ error: 'unsupported_type' }, { status: 415 })
  if (file.size === 0) return NextResponse.json({ error: 'empty_file' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'too_large' }, { status: 413 })

  const db = createRentalServiceClient()
  const path = `${member.tenantId}/${crypto.randomUUID()}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error } = await db.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) {
    console.error('[vehicles/photo] upload failed:', error.message)
    return NextResponse.json({ error: 'upload_failed' }, { status: 500 })
  }

  const { data } = db.storage.from(BUCKET).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl, path })
}
