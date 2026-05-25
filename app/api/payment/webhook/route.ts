import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  const body = await request.json()

  // Verifikasi signature Midtrans
  const signatureKey = process.env.MIDTRANS_SERVER_KEY!
  const expected = crypto
    .createHash('sha512')
    .update(`${body.order_id}${body.status_code}${body.gross_amount}${signatureKey}`)
    .digest('hex')

  if (body.signature_key !== expected) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // TODO: update status booking, generate e-ticket, kirim WA + email, notif admin
  // Idempotent — cek apakah booking sudah diproses sebelumnya

  return NextResponse.json({ ok: true })
}
