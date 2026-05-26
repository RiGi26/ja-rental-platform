'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { triggerHaptic } from '@/lib/ux-utils'

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.2 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.8 6.5 29.2 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5c11 0 20.5-8 20.5-20.5 0-1.2-.1-2.3-.4-5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.2 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.8 6.5 29.2 4.5 24 4.5c-7.7 0-14.3 4.4-17.7 10.2z"/>
    <path fill="#4CAF50" d="M24 45.5c5.1 0 9.7-1.9 13.2-4.9l-6.1-5.2C29.3 36.8 26.8 37.5 24 37.5c-5.3 0-9.8-3.6-11.4-8.5l-6.5 5C9.5 41 16.3 45.5 24 45.5z"/>
    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.1 5.2C41.1 35.1 44.5 30.5 44.5 25c0-1.2-.1-2.3-.9-5z"/>
  </svg>
)

export function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const next         = searchParams.get('next') ?? '/'

  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [showPassword,  setShowPassword]  = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    triggerHaptic()

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      toast.error('Email atau password salah. Silakan coba lagi.')
      setLoading(false)
      return
    }

    // Role check logic for smart redirect
    const { data: { user } } = await supabase.auth.getUser()
    const role = (user?.app_metadata as any)?.role

    toast.success('Berhasil masuk!')
    
    if (next !== '/') {
      router.push(next)
    } else if (role === 'admin' || role === 'owner' || role === 'superadmin') {
      router.push('/admin')
    } else {
      router.push('/account')
    }
    
    router.refresh()
  }

  async function handleDemoLogin(role: 'admin' | 'driver') {
    setLoading(true)
    triggerHaptic()
    
    const demoEmail = role === 'admin' ? 'admin@demo.com' : 'driver@demo.com'
    const demoPass  = 'Demo@1234'

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ 
      email: demoEmail, 
      password: demoPass 
    })

    if (error) {
      toast.error('Gagal masuk ke akun demo. Silakan coba manual.')
      setLoading(false)
      return
    }

    toast.success(`Masuk sebagai ${role === 'admin' ? 'Administrator' : 'Supir'} Demo`)
    router.push(role === 'admin' ? '/admin' : '/driver')
    router.refresh()
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next !== '/' ? next : '/account')}`,
      },
    })
    setGoogleLoading(false)
  }

  return (
    <div className="w-full max-w-md animate-fade-up">
      {/* Back Button */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors mb-8 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Kembali ke Beranda
      </Link>

      <div className="bg-white rounded-[32px] shadow-panel border border-slate-100 p-8 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
            <ShieldCheck size={120} />
        </div>

        <div className="mb-8 relative z-10">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
          </div>
          <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight mb-1">
            Masuk Portal.
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Akses panel manajemen JapanArena Travel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="h-12 px-4 rounded-xl border-slate-200 focus-visible:ring-primary/20 shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</Label>
              <a href="https://wa.me/6281296917963" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Lupa?</a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 px-4 pr-11 rounded-xl border-slate-200 focus-visible:ring-primary/20 shadow-sm"
              />
              <button
                type="button"
                onClick={() => { setShowPassword(v => !v); triggerHaptic(5); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest rounded-2xl
                        transition-all shadow-glow active:scale-95 disabled:opacity-60 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Masuk Sekarang'}
          </Button>
        </form>

        {/* Demo Logins */}
        <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-3 relative z-10">
            <button 
              onClick={() => handleDemoLogin('admin')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
            >
              <Sparkles size={14} className="text-amber-500" /> Admin Demo
            </button>
            <button 
              onClick={() => handleDemoLogin('driver')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
            >
              <Sparkles size={14} className="text-blue-500" /> Supir Demo
            </button>
        </div>

        {/* Google OAuth */}
        {GOOGLE_ENABLED && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-300">atau</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl
                          py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all
                          disabled:opacity-60 active:scale-95"
            >
              {googleLoading
                ? <Loader2 size={18} className="animate-spin" />
                : <GoogleIcon />
              }
              Masuk dengan Google
            </button>
          </>
        )}

        <p className="text-center text-sm text-slate-500 mt-10 font-medium">
          Belum punya akun?{' '}
          <Link
            href={`/auth/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
            className="font-black text-primary hover:underline underline-offset-4"
          >
            Daftar Gratis
          </Link>
        </p>
      </div>

      <p className="text-center text-[10px] font-bold text-slate-400 mt-8 uppercase tracking-widest">
        © 2026 JapanArena Corp · Standard Keamanan Global
      </p>
    </div>
  )
}
