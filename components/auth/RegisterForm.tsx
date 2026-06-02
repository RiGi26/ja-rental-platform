'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createCoreClient } from '@/lib/supabase/client'
import { claimGuestBooking } from '@/lib/actions/auth.actions'
import { normalizePhone } from '@/lib/utils'

interface Props {
  next: string
}

export default function RegisterForm({ next }: Props) {
  const router = useRouter()
  const [name,            setName]            = useState('')
  const [email,           setEmail]           = useState('')
  const [phone,           setPhone]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword,    setShowPassword]    = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState<string | null>(null)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }
    if (password !== confirmPassword) {
      setError('Password tidak cocok.')
      return
    }

    setLoading(true)
    const supabase = createCoreClient()

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name.trim(),
          phone:     normalizePhone(phone),
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Claim booking yang dibuat saat guest checkout
    if (data.user) {
      const pendingCode = typeof window !== 'undefined'
        ? sessionStorage.getItem('ja-pending-booking')
        : null
      if (pendingCode) {
        await claimGuestBooking(pendingCode, data.user.id)
        sessionStorage.removeItem('ja-pending-booking')
      }
    }

    router.push('/account?registered=true')
    router.refresh()
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
            <span className="font-display font-bold text-2xl text-slate-900">JaMobility</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          <div className="mb-6">
            <h1 className="font-display font-bold text-xl text-slate-900 mb-1">
              Buat Akun JaMobility
            </h1>
            <p className="text-slate-500 text-sm">
              Gratis — simpan riwayat booking dan tracking perjalanan
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Nama Lengkap <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nama sesuai KTP"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800
                           placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40
                           focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Email <span className="text-red-400">*</span>
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

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Nomor WhatsApp <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                required
                autoComplete="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800
                           placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40
                           focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Password <span className="text-red-400">*</span>{' '}
                <span className="font-normal text-slate-400">(min 8 karakter)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
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
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Konfirmasi Password <span className="text-red-400">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800
                           placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40
                           focus:border-primary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl
                         transition-colors glow-btn disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Daftar Gratis
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Sudah punya akun?{' '}
                        <Link
                          href={`/auth/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          Login
                        </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
