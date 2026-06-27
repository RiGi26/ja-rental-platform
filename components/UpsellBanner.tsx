'use client'

import { useState } from 'react'
import { FEATURE_LABEL, type EntitlementKey } from '@/lib/entitlements'

const BILLING_LABEL: Record<string, string> = {
  past_due: 'Pembayaran tertunda',
  suspended: 'Langganan ditangguhkan',
  cancelled: 'Langganan dibatalkan',
  expired: 'Langganan kedaluwarsa',
}

/**
 * Shown on /admin when a tier-gated page bounced the user here with
 * ?upsell=<key> (feature not in package) or ?billing=<status> (not in good
 * standing). Travel has no self-serve upgrade yet → point to the operator.
 */
export function UpsellBanner({ upsell, billing }: { upsell?: string; billing?: string }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed || (!upsell && !billing)) return null

  const isBilling = !!billing
  const featureLabel = upsell ? FEATURE_LABEL[upsell as EntitlementKey] ?? upsell : ''
  const title = isBilling
    ? BILLING_LABEL[billing!] ?? 'Langganan tidak aktif'
    : `Fitur "${featureLabel}" terkunci`
  const body = isBilling
    ? 'Akses fitur berbayar dijeda sampai pembayaran diperbarui. Hubungi admin untuk mengaktifkan kembali.'
    : 'Fitur ini tidak termasuk dalam paket langganan Anda saat ini. Tingkatkan paket untuk membukanya.'

  return (
    <div
      className="relative mb-6 flex items-start gap-3 p-4"
      style={{
        borderRadius: 18,
        background: isBilling ? '#fef2f2' : '#fffbeb',
        border: `1px solid ${isBilling ? '#fecaca' : '#fde68a'}`,
      }}
    >
      <span className="text-xl leading-none">{isBilling ? '⚠️' : '🔒'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ color: isBilling ? '#b91c1c' : '#92400e' }}>{title}</p>
        <p className="text-sm mt-0.5" style={{ color: isBilling ? '#dc2626' : '#b45309' }}>{body}</p>
        <a
          href="https://wa.me/6281296917963"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-sm font-semibold underline"
          style={{ color: isBilling ? '#b91c1c' : '#92400e' }}
        >
          Hubungi admin untuk tingkatkan paket →
        </a>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 -m-1 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label="Tutup"
      >
        ✕
      </button>
    </div>
  )
}
