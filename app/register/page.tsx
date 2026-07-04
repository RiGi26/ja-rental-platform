'use client'

import { useState, useId, useEffect } from 'react'
import Link from 'next/link'
import {
  Building2, Mail, Lock, Phone, User, Eye, EyeOff,
  CheckCircle2, Loader2, ShieldCheck, Sparkles
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createCoreClient } from '@/lib/supabase/client'

const TIER_LABEL: Record<string, string> = { starter: 'Starter', pro: 'Growth', enterprise: 'Pro' }

export default function RegisterPage() {
  const id = useId()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTos, setAgreeTos] = useState(false)

  // Subscribe intent from /pricing (?intent=subscribe&tier=starter|pro|enterprise&period=monthly|yearly).
  const [intent, setIntent] = useState<string | null>(null)
  const [tier, setTier] = useState<string | null>(null)
  const [period, setPeriod] = useState<string>('monthly')

  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    setIntent(q.get('intent'))
    setTier(q.get('tier'))
    setPeriod(q.get('period') === 'yearly' ? 'yearly' : 'monthly')
  }, [])

  const isSubscribe = intent === 'subscribe' && !!tier && !!TIER_LABEL[tier]

  const [formData, setFormData] = useState({
    businessName: '',
    slug: '',
    adminName: '',
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
  })

  const updateForm = (key: string, val: string) => {
    setFormData(prev => {
      const next = { ...prev, [key]: val }
      if (key === 'businessName') {
        next.slug = val.toLowerCase().replace(/[^a-z0-9]/g, '-')
      }
      return next
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.businessName || !formData.slug) {
      toast.error('Lengkapi data usaha Anda.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok.')
      return
    }
    if (!agreeTos) {
      toast.error('Setujui syarat & ketentuan untuk melanjutkan.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName,
          slug: formData.slug,
          adminName: formData.adminName,
          email: formData.email,
          whatsapp: formData.whatsapp,
          password: formData.password,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? 'Gagal mendaftar. Coba lagi.')
        setLoading(false)
        return
      }

      // Auto-login, then route by intent.
      const supabase = createCoreClient()
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })
      if (signInErr) {
        toast.success('Pendaftaran berhasil!', { description: 'Silakan login untuk masuk.' })
        window.location.assign('/auth/login?registered=1')
        return
      }

      if (isSubscribe && tier) {
        window.location.assign(`/api/billing/checkout?tier=${tier}&period=${period}`)
      } else {
        window.location.assign('/admin')
      }
    } catch (err) {
      console.error('Registration error:', err)
      toast.error('Gagal mendaftar. Silakan coba lagi nanti.')
      setLoading(false)
    }
  }

  const submitLabel = isSubscribe ? 'Daftar & Lanjut Bayar →' : 'Aktifkan Sistem & Mulai Trial'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex flex-col items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-glow">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-2xl font-display font-black text-slate-900 tracking-tight">Webzoka <span className="text-primary">Rental PRO</span></h1>
          </Link>
          <p className="text-slate-500 font-medium italic">
            Transformasi Digital untuk Bisnis Travel & Rental Anda.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[32px] shadow-panel border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                {isSubscribe ? `Berlangganan ${tier ? TIER_LABEL[tier] : ''}` : 'Informasi Usaha & Akses'}
              </h2>
              <p className="text-sm text-slate-500">
                {isSubscribe
                  ? 'Isi data bisnis, lalu lanjut ke pembayaran'
                  : 'Lengkapi data berikut untuk mengaktifkan sistem manajemen Anda.'}
              </p>
              {isSubscribe && (
                <p className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
                  Belum siap bayar? Akun tetap mendapat trial 14 hari.
                </p>
              )}
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor={`${id}-businessName`} className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Bisnis</Label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <Input
                    id={`${id}-businessName`}
                    placeholder="Contoh: Bakso Tini Japan"
                    value={formData.businessName}
                    onChange={e => updateForm('businessName', e.target.value)}
                    className="h-12 pl-12 rounded-xl border-slate-200 focus-visible:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-adminName`} className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Admin / PIC</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <Input
                    id={`${id}-adminName`}
                    placeholder="Nama lengkap Anda"
                    value={formData.adminName}
                    onChange={e => updateForm('adminName', e.target.value)}
                    className="h-12 pl-12 rounded-xl border-slate-200 focus-visible:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-email`} className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <Input
                    id={`${id}-email`}
                    type="email"
                    placeholder="admin@bisnis.jp"
                    value={formData.email}
                    onChange={e => updateForm('email', e.target.value)}
                    className="h-12 pl-12 rounded-xl border-slate-200 focus-visible:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-whatsapp`} className="text-[10px] font-black uppercase tracking-widest text-slate-400">No. WhatsApp (opsional)</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <Input
                    id={`${id}-whatsapp`}
                    placeholder="62812xxxxxxx"
                    value={formData.whatsapp}
                    onChange={e => updateForm('whatsapp', e.target.value)}
                    className="h-12 pl-12 rounded-xl border-slate-200 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-password`} className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <Input
                    id={`${id}-password`}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 8 karakter"
                    value={formData.password}
                    onChange={e => updateForm('password', e.target.value)}
                    className="h-12 pl-12 pr-12 rounded-xl border-slate-200 focus-visible:ring-primary/20"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-confirmPassword`} className="text-[10px] font-black uppercase tracking-widest text-slate-400">Konfirmasi Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <Input
                    id={`${id}-confirmPassword`}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={formData.confirmPassword}
                    onChange={e => updateForm('confirmPassword', e.target.value)}
                    className="h-12 pl-12 rounded-xl border-slate-200 focus-visible:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <label htmlFor={`${id}-agreeTos`} className="flex items-start gap-3 pt-1 cursor-pointer">
                <input
                  id={`${id}-agreeTos`}
                  type="checkbox"
                  checked={agreeTos}
                  onChange={e => setAgreeTos(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                  required
                />
                <span className="text-sm text-slate-500">
                  Saya setuju dengan syarat &amp; ketentuan penggunaan Webzoka.
                </span>
              </label>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-xl bg-slate-900 hover:bg-black text-white font-bold gap-2 shadow-lg transition-all active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      {submitLabel} <Sparkles size={18} className="text-sky-300" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
           <div className="flex items-center gap-2">
             <CheckCircle2 size={16} className="text-green-500" />
             <span className="text-xs font-bold text-slate-500">{isSubscribe ? '14 hari pertama gratis, batalkan kapan saja' : 'Free 14-Day Trial'}</span>
           </div>
           <div className="flex items-center gap-2 text-xs text-slate-400">
             Sudah punya akun? <Link href="/auth/login" className="text-primary font-bold hover:underline">Masuk di sini</Link>
           </div>
        </div>
      </div>
    </div>
  )
}
