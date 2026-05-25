'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true'

interface Props {
  next: string
  errorParam?: string
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.2 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.8 6.5 29.2 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5c11 0 20.5-8 20.5-20.5 0-1.2-.1-2.3-.4-5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.2 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.8 6.5 29.2 4.5 24 4.5c-7.7 0-14.3 4.4-17.7 10.2z"/>
    <path fill="#4CAF50" d="M24 45.5c5.1 0 9.7-1.9 13.2-4.9l-6.1-5.2C29.3 36.8 26.8 37.5 24 37.5c-5.3 0-9.8-3.6-11.4-8.5l-6.5 5C9.5 41 16.3 45.5 24 45.5z"/>
    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.1 5.2C41.1 35.1 44.5 30.5 44.5 25c0-1.2-.1-2.3-.9-5z"/>
  </svg>
)

export default function LoginForm({ next, errorParam }: Props) {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(
    errorParam === 'auth_failed' ? 'Autentikasi gagal. Silakan coba lagi.' : null
  )

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (authError) {
      setError('Gagal mengirim link. Periksa email dan coba lagi.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    setGoogleLoading(false)
  }

  /* ── Sukses: link terkirim ── */
  if (sent) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-primary" />
            </div>
            <h2 className="font-display font-bold text-xl text-slate-900 mb-2">
              Cek Inbox Email Anda
            </h2>
            <p className="text-slate-500 text-sm mb-1">
              Link masuk sudah dikirim ke
            </p>
            <p className="font-semibold text-slate-800 text-sm mb-5">{email}</p>
            <p className="text-slate-400 text-xs mb-6">
              Klik link di email tersebut untuk masuk dan melanjutkan pemesanan.
              Link berlaku selama 10 menit.
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="text-sm text-primary font-semibold hover:underline"
            >
              Ganti email
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Form utama ── */
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center
                            text-white font-bold text-xl group-hover:bg-primary-hover transition-colors">
              J
            </div>
            <span className="font-display font-bold text-2xl text-slate-900">JaTravel</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          <div className="text-center mb-6">
            <h1 className="font-display font-bold text-xl text-slate-900 mb-1">
              Masuk untuk Melanjutkan
            </h1>
            <p className="text-slate-500 text-sm">
              Masukkan email Anda — kami kirim link masuk langsung ke inbox
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Alamat Email
              </label>
              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800
                           placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40
                           focus:border-primary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl
                         transition-colors glow-btn disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {loading
                ? <Loader2 size={16} className="animate-spin" />
                : <Mail size={16} />
              }
              Kirim Link Masuk
            </button>
          </form>

          {/* Penjelasan singkat */}
          <div className="mt-4 bg-blue-50 rounded-xl px-4 py-3 flex gap-3">
            <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Belum punya akun? Akun otomatis dibuat saat pertama kali masuk.
              Tidak perlu password.
            </p>
          </div>

          {/* Google OAuth */}
          {GOOGLE_ENABLED && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-slate-400">atau</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl
                           py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {googleLoading
                  ? <Loader2 size={18} className="animate-spin" />
                  : <GoogleIcon />
                }
                Lanjutkan dengan Google
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Dengan masuk, Anda menyetujui{' '}
          <Link href="/terms" className="hover:underline">Syarat & Ketentuan</Link>
          {' '}dan{' '}
          <Link href="/privacy" className="hover:underline">Kebijakan Privasi</Link>{' '}
          JaTravel.
        </p>
      </div>
    </div>
  )
}
