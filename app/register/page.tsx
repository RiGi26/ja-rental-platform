'use client'

import { useState, useId, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Mail, Lock, Phone, Globe, ArrowRight,
  CheckCircle2, Loader2, ShieldCheck, Sparkles, ChevronLeft
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createCoreClient } from '@/lib/supabase/client'

const TIER_LABEL: Record<string, string> = { starter: 'Starter', pro: 'Growth', enterprise: 'Pro' }

export default function RegisterPage() {
  const id = useId()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

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
    email: '',
    whatsapp: '',
    password: '',
  })

  const updateForm = (key: string, val: string) => {
    setFormData(prev => {
      const next = { ...prev, [key]: val }
      if (key === 'businessName' && !prev.slug) {
        next.slug = val.toLowerCase().replace(/[^a-z0-9]/g, '-')
      }
      return next
    })
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1 && (!formData.businessName || !formData.slug)) {
      toast.error('Lengkapi data usaha Anda.')
      return
    }
    setStep(s => s + 1)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? 'Gagal mendaftar. Coba lagi.')
        if (res.status === 409) setStep(2)
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

  const submitLabel = isSubscribe
    ? `Daftar & Lanjut Bayar${tier ? ` — ${TIER_LABEL[tier]}` : ''}`
    : 'Aktifkan Sistem & Mulai Trial'

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
            {isSubscribe
              ? `Daftar & aktifkan paket ${tier ? TIER_LABEL[tier] : ''} (${period === 'yearly' ? 'tahunan' : 'bulanan'}).`
              : 'Transformasi Digital untuk Bisnis Travel & Rental Anda.'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[32px] shadow-panel border border-slate-100 overflow-hidden">
          <div className="h-2 bg-slate-100">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>

          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-1">Informasi Usaha</h2>
                    <p className="text-sm text-slate-500">Mulai langkah awal untuk sistem manajemen Anda.</p>
                  </div>

                  <form onSubmit={handleNext} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor={`${id}-businessName`} className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Rental / Travel</Label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <Input
                          id={`${id}-businessName`}
                          placeholder="Contoh: Arjuna Rent Car"
                          value={formData.businessName}
                          onChange={e => updateForm('businessName', e.target.value)}
                          className="h-12 pl-12 rounded-xl border-slate-200 focus-visible:ring-primary/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${id}-slug`} className="text-[10px] font-black uppercase tracking-widest text-slate-400">Custom Domain URL</Label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <Input
                          id={`${id}-slug`}
                          placeholder="arjuna-rent"
                          value={formData.slug}
                          onChange={e => updateForm('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                          className="h-12 pl-12 rounded-xl border-slate-200 font-mono text-sm focus-visible:ring-primary/20"
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                          .rent.webzoka.com
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">Ini akan menjadi alamat website operasional Anda nantinya.</p>
                    </div>

                    <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold gap-2">
                      Lanjutkan <ArrowRight size={18} />
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="mb-8">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-primary transition-colors mb-4"
                    >
                      <ChevronLeft size={14} /> Kembali
                    </button>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">Akses Pengelola</h2>
                    <p className="text-sm text-slate-500">Kredensial untuk masuk ke Owner Dashboard.</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor={`${id}-email`} className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Utama</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <Input
                          id={`${id}-email`}
                          type="email"
                          placeholder="owner@bisnisanda.com"
                          value={formData.email}
                          onChange={e => updateForm('email', e.target.value)}
                          className="h-12 pl-12 rounded-xl border-slate-200 focus-visible:ring-primary/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${id}-whatsapp`} className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nomor WhatsApp</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <Input
                          id={`${id}-whatsapp`}
                          placeholder="62812xxxxxx"
                          value={formData.whatsapp}
                          onChange={e => updateForm('whatsapp', e.target.value)}
                          className="h-12 pl-12 rounded-xl border-slate-200 focus-visible:ring-primary/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${id}-password`} className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <Input
                          id={`${id}-password`}
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={e => updateForm('password', e.target.value)}
                          className="h-12 pl-12 rounded-xl border-slate-200 focus-visible:ring-primary/20"
                          required
                          minLength={8}
                        />
                      </div>
                    </div>

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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
           <div className="flex items-center gap-2">
             <CheckCircle2 size={16} className="text-green-500" />
             <span className="text-xs font-bold text-slate-500">{isSubscribe ? '14 hari pertama gratis, batalkan kapan saja' : 'Free 14-Day Trial'}</span>
           </div>
           <div className="flex items-center gap-2 text-xs text-slate-400">
             Sudah punya akun? <Link href="/auth/login" className="text-primary font-bold hover:underline">Login Portal</Link>
           </div>
        </div>
      </div>
    </div>
  )
}
