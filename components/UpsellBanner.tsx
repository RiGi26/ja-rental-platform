'use client'

import { useState } from 'react'
import { Lock, AlertTriangle, X } from 'lucide-react'
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
 * standing). CTA points to the in-app billing page (/admin/langganan) — the
 * canonical uniform gate behaviour across all portals (see /wire-self-billing SOP).
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
    ? 'Akses fitur berbayar dijeda sampai pembayaran diperbarui.'
    : 'Fitur ini tidak termasuk dalam paket langganan Anda saat ini. Tingkatkan paket untuk membukanya.'

  return (
    <div
      className={`relative mb-6 flex items-start gap-3 rounded-2xl border p-4 ${
        isBilling ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
      }`}
    >
      <span className={`mt-0.5 ${isBilling ? 'text-red-500' : 'text-amber-500'}`}>
        {isBilling ? <AlertTriangle className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-bold ${isBilling ? 'text-red-700' : 'text-amber-800'}`}>{title}</p>
        <p className={`mt-0.5 text-sm ${isBilling ? 'text-red-600' : 'text-amber-700'}`}>{body}</p>
        <a
          href="/admin/langganan"
          className={`mt-2 inline-block text-sm font-semibold underline ${
            isBilling ? 'text-red-700' : 'text-amber-800'
          }`}
        >
          {isBilling ? 'Perbarui pembayaran →' : 'Lihat paket & upgrade →'}
        </a>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="-m-1 p-1 text-slate-400 transition-colors hover:text-slate-600"
        aria-label="Tutup"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
