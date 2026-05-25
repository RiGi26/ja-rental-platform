'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true'

interface Props {
  next: string
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.2 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.8 6.5 29.2 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5c11 0 20.5-8 20.5-20.5 0-1.2-.1-2.3-.4-5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.2 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.8 6.5 29.2 4.5 24 4.5c-7.7 0-14.3 4.4-17.7 10.2z"/>
    <path fill="#4CAF50" d="M24 45.5c5.1 0 9.7-1.9 13.2-4.9l-6.1-5.2C29.3 36.8 26.8 37.5 24 37.5c-5.3 0-9.8-3.6-11.4-8.5l-6.5 5C9.5 41 16.3 45.5 24 45.5z"/>
    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.1 5.2C41.1 35.1 44.5 30.5 44.5 25c0-1.2-.1-2.3-.9-5z"/>
  </svg>
)

export default function RegisterForm({ next }: Props) {
  const [name,          setName]          = useState('')
  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [showPw,        setShowPw]        = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [done,          setDone]          = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (authError) {
      setError(authError.message === 'User already registered'
        ? 'Email sudah terdaftar. Silakan masuk.'
        : 'Pendaftaran gagal. Coba lagi.')
      setLoading(false)
      return
    }

    // Supabase returns identities: [] if email confirmation is required
    if (data.user && !data.session) {
      setDone(true)
      setLoading(false)
      return
    }

    // Auto-confirmed (e.g., Supabase project has email confirm disabled)
    window.location.href = next
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

  const loginHref = `/auth/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`

  if (done) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="font-display font-bold text-xl text-slate-900 mb-2">Cek Email Anda</h2>
            <p className="text-slate-500 text-sm mb-6">
              Kami sudah mengirim link verifikasi ke{' '}
              <span className="font-semibold text-slate-800">{email}</span>.
              Klik link tersebut untuk mengaktifkan akun dan melanjutkan pemesanan.
            </p>
            <Link
              href={loginHref}
              className="inline-block bg-primary text-white font-bold px-6 py-2.5 rounded-xl
                         hover:bg-primary-hover transition-colors text-sm"
            >
              Ke Halaman Masuk
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
          <p className="text-slate-500 text-sm mt-2">Buat akun untuk memesan tiket</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          <h1 className="font-display font-bold text-xl text-slate-900 mb-6">Daftar Akun Baru</h1>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Sesuai KTP"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800
                           placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40
                           focus:border-primary transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800
                           placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40
                           focus:border-primary transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Password <span className="font-normal text-slate-400">(min. 6 karakter)</span>
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm text-slate-800
                             placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40
                             focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl
                         transition-colors glow-btn disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Buat Akun
            </button>
          </form>

          {/* Google OAuth — hanya tampil jika NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true */}
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
                Daftar dengan Google
              </button>
            </>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Sudah punya akun?{' '}
            <Link href={loginHref} className="text-primary font-semibold hover:underline">
              Masuk sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
