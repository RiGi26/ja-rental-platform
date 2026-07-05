'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { createCoreClient } from '@/lib/supabase/client'

type Step = 'form' | 'loading' | 'redirecting' | 'success' | 'error'

const inputCls =
  'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-900 ' +
  'outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:bg-white ' +
  'focus:ring-2 focus:ring-primary/20 disabled:opacity-60'

// Core tier (from the pricing CTA) → display name, consistent with the pricing page.
const TIER_LABEL: Record<string, string> = { starter: 'Starter', pro: 'Growth', enterprise: 'Pro' }

function RegisterForm() {
  const searchParams = useSearchParams()
  // From the pricing CTA (?intent=subscribe&tier=<coreTier>&period=). After signup we
  // auto-login and send the buyer STRAIGHT to Midtrans for that tier (no picker).
  const subscribe = searchParams.get('intent') === 'subscribe'
  const tier = searchParams.get('tier') // Core enum: starter|pro|enterprise
  const period = searchParams.get('period') === 'yearly' ? 'yearly' : 'monthly'
  const planName = (tier && TIER_LABEL[tier]) || null
  const isSubscribe = subscribe && !!planName
  // Fallback target when auto sign-in fails and the buyer uses the manual "Masuk" card.
  const loginHref = subscribe ? `/auth/login?next=${encodeURIComponent('/admin/langganan')}` : '/auth/login'

  const [step, setStep] = useState<Step>('form')
  const [errorMsg, setErrorMsg] = useState('')
  const [formErr, setFormErr] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agree, setAgree] = useState(false)
  const [form, setForm] = useState({
    businessName: '',
    adminName: '',
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
  })

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (formErr) setFormErr('')
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.businessName.trim()) return setFormErr('Nama bisnis wajib diisi.')
    if (form.password.length < 8) return setFormErr('Password minimal 8 karakter.')
    if (form.password !== form.confirmPassword) return setFormErr('Konfirmasi password tidak cocok.')
    if (!agree) return setFormErr('Setujui syarat & ketentuan untuk melanjutkan.')

    setStep('loading')
    try {
      // slug is derived + deduplicated server-side from businessName — not sent from here.
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName,
          adminName: form.adminName,
          email: form.email,
          whatsapp: form.whatsapp,
          password: form.password,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setErrorMsg(data.error || 'Terjadi kesalahan. Coba lagi.')
        setStep('error')
        return
      }

      // Account created (server seeds a 14-day trial as the safety net). Auto-login via
      // the Core auth hub so the buyer lands straight in the portal — or in payment —
      // with no manual login step. On the rare sign-in failure, fall back to "Masuk".
      const supabase = createCoreClient()
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      if (signInErr) {
        setStep('success')
        return
      }

      setStep('redirecting')
      if (isSubscribe && tier) {
        // Paid plan picked on pricing → straight to Midtrans for that tier.
        window.location.assign(`/api/billing/checkout?tier=${encodeURIComponent(tier)}&period=${period}`)
      } else if (subscribe) {
        // Subscribe intent without a valid tier → let them pick on the billing page.
        window.location.assign('/admin/langganan')
      } else {
        // Trial → straight into the portal.
        window.location.assign('/admin')
      }
    } catch {
      setErrorMsg('Koneksi gagal. Periksa internet Anda.')
      setStep('error')
    }
  }

  if (step === 'loading') {
    return (
      <Centered>
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-9 w-9 animate-spin text-primary" />
          <p className="text-sm text-slate-500">Menyiapkan akun Anda…</p>
        </div>
      </Centered>
    )
  }

  if (step === 'redirecting') {
    return (
      <Centered>
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-9 w-9 animate-spin text-primary" />
          <p className="text-sm text-slate-500">
            {subscribe ? 'Mengarahkan ke pembayaran…' : 'Membuka dashboard…'}
          </p>
        </div>
      </Centered>
    )
  }

  if (step === 'success') {
    return (
      <Centered>
        <div className="w-full max-w-[420px] rounded-[24px] bg-white p-8 text-center shadow-panel">
          <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Akun berhasil dibuat!</h2>
          <p className="mt-2 text-sm text-slate-500">
            {subscribe
              ? `Akun Anda siap. Masuk untuk lanjutkan pembayaran langganan${planName ? ' ' + planName : ''}.`
              : 'Trial 14 hari Anda aktif. Masuk untuk mulai mengelola bisnis rental Anda.'}
          </p>
          <a
            href={loginHref}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-[15px] font-bold text-white transition-all hover:bg-black active:scale-[0.97]"
          >
            {subscribe ? 'Masuk & Lanjut Bayar' : 'Masuk ke Dashboard'} <ArrowRight className="h-4 w-4" />
          </a>
          <p className="mt-3 text-xs text-slate-400">Gunakan email &amp; password yang baru Anda daftarkan.</p>
        </div>
      </Centered>
    )
  }

  if (step === 'error') {
    return (
      <Centered>
        <div className="w-full max-w-[380px] rounded-[24px] bg-white p-8 text-center shadow-panel">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="font-bold text-slate-900">Pendaftaran gagal</p>
          <p className="mt-2 text-sm text-slate-500">{errorMsg}</p>
          <button
            onClick={() => setStep('form')}
            className="mt-6 h-11 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition-all hover:bg-black active:scale-[0.97]"
          >
            Coba Lagi
          </button>
        </div>
      </Centered>
    )
  }

  return (
    <Centered>
      <div className="w-full max-w-[440px] rounded-[32px] border border-slate-100 bg-white p-8 shadow-panel md:p-10">
        <div className="mb-7 text-center">
          <img src="/logo-rocket.png" alt="Logo Webzoka" className="mx-auto h-14 w-14 object-contain" />
          <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
            {isSubscribe ? `Berlangganan ${planName}` : 'Daftarkan Bisnis Anda'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isSubscribe ? 'Isi data bisnis, lalu lanjut ke pembayaran' : 'Trial 14 hari · Tanpa kartu kredit'}
          </p>
          {isSubscribe && (
            <p className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
              Belum siap bayar? Akun tetap mendapat trial 14 hari.
            </p>
          )}
        </div>

        {formErr && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-red-500" />
            <p className="text-xs text-red-700">{formErr}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Nama Bisnis" required>
            <input name="businessName" value={form.businessName} onChange={onChange} required minLength={3} placeholder="Contoh: Bakso Tini Japan" className={inputCls} />
          </Field>
          <Field label="Nama Admin / PIC" required>
            <input name="adminName" value={form.adminName} onChange={onChange} required placeholder="Nama lengkap Anda" className={inputCls} />
          </Field>
          <Field label="Email" required>
            <input name="email" type="email" value={form.email} onChange={onChange} required autoComplete="email" placeholder="admin@bisnis.jp" className={inputCls} />
          </Field>
          <Field label="No. WhatsApp" hint="(opsional)">
            <input name="whatsapp" value={form.whatsapp} onChange={onChange} placeholder="62812xxxxxxx" className={inputCls} />
          </Field>
          <Field label="Password" required>
            <div className="relative">
              <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={onChange} required minLength={8} autoComplete="new-password" placeholder="Minimal 8 karakter" className={`${inputCls} pr-12`} />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
          <Field label="Konfirmasi Password" required>
            <input name="confirmPassword" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={onChange} required autoComplete="new-password" placeholder="Ulangi password" className={inputCls} />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="mt-1 text-xs font-medium text-red-500">Password tidak cocok</p>
            )}
          </Field>

          <label className="flex items-start gap-2.5 pt-1 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              required
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-primary focus:ring-primary/30"
            />
            <span>Saya setuju dengan syarat &amp; ketentuan penggunaan Webzoka.</span>
          </label>

          <button
            type="submit"
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-[15px] font-bold text-white transition-all hover:bg-black active:scale-[0.97]"
          >
            {isSubscribe ? 'Daftar & Lanjut Bayar' : 'Mulai Trial Gratis'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Sudah punya akun?{' '}
          <a href={loginHref} className="font-bold text-primary hover:underline">Masuk di sini</a>
        </p>
      </div>
    </Centered>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10 font-sans">
      {children}
    </div>
  )
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label} {required ? <span className="text-red-400">*</span> : hint ? <span className="font-normal text-slate-400">{hint}</span> : null}
      </label>
      {children}
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<Centered><p className="text-sm text-slate-400">Memuat…</p></Centered>}>
      <RegisterForm />
    </Suspense>
  )
}
