import { createRentalServiceClient } from '@/lib/supabase/service'

// ============================================================
// Cron keepalive — SELECT ringan tiap 6 hari supaya Supabase Free Plan
// tidak auto-pause project ini (pause terjadi kalau 7 hari tanpa aktivitas
// DB nyata). Dipanggil Vercel Cron (lihat vercel.json), auth via
// `Authorization: Bearer <CRON_SECRET>`.
// ============================================================

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createRentalServiceClient()
    const { error } = await supabase.from('tenants').select('id').limit(1)
    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 })
    }
    return Response.json({ ok: true, checkedAt: new Date().toISOString() })
  } catch (err) {
    console.error('[CRON] keepalive error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
