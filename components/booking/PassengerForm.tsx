'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useBookingStore } from '@/lib/store/booking.store'
import { createClient } from '@/lib/supabase/client'

function validatePhone(phone: string): boolean {
  return /^(\+62|62|0)8[0-9]{8,11}$/.test(phone.replace(/[\s-]/g, ''))
}

interface FieldData  { name: string; phone: string }
interface FieldError { name?: string; phone?: string }

interface Props {
  scheduleId: string
}

export default function PassengerForm({ scheduleId }: Props) {
  const router = useRouter()
  const { selectedSeats, passengerDetails, setPassengers } = useBookingStore()

  const [fields,      setFields]      = useState<FieldData[]>([])
  const [errors,      setErrors]      = useState<FieldError[]>([])
  const [fillSelf,    setFillSelf]    = useState(false)
  const [submitting,  setSubmitting]  = useState(false)

  // Inisialisasi setelah hydration store dari sessionStorage
  useEffect(() => {
    setFields(selectedSeats.map((_, i) => ({
      name:  passengerDetails[i]?.name  ?? '',
      phone: passengerDetails[i]?.phone ?? '',
    })))
    setErrors(selectedSeats.map(() => ({})))
  }, [selectedSeats.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = useCallback((idx: number, key: keyof FieldData, value: string) => {
    setFields(prev => prev.map((f, i) => i === idx ? { ...f, [key]: value } : f))
    setErrors(prev => prev.map((e, i) => i === idx ? { ...e, [key]: undefined } : e))
  }, [])

  const blurField = useCallback((idx: number, key: keyof FieldData, value: string) => {
    const err: FieldError = {}
    if (key === 'name') {
      if (!value.trim())                err.name = 'Nama wajib diisi'
      else if (value.trim().length < 3) err.name = 'Nama minimal 3 karakter'
    }
    if (key === 'phone') {
      if (!value.trim())             err.phone = 'Nomor WhatsApp wajib diisi'
      else if (!validatePhone(value)) err.phone = 'Format tidak valid (contoh: 08123456789)'
    }
    setErrors(prev => prev.map((e, i) => i === idx ? { ...e, ...err } : e))
  }, [])

  async function handleFillSelf(checked: boolean) {
    setFillSelf(checked)
    if (!checked) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const name  = (user.user_metadata?.full_name as string)  ?? user.email?.split('@')[0] ?? ''
    const phone = (user.user_metadata?.phone     as string)  ?? ''
    setFields(prev => prev.map((f, i) => i === 0 ? { name, phone } : f))
    setErrors(prev => prev.map((e, i) => i === 0 ? {} : e))
  }

  function validateAll(): boolean {
    const newErrors: FieldError[] = fields.map(f => {
      const e: FieldError = {}
      if (!f.name.trim())                e.name  = 'Nama wajib diisi'
      else if (f.name.trim().length < 3) e.name  = 'Nama minimal 3 karakter'
      if (!f.phone.trim())               e.phone = 'Nomor WhatsApp wajib diisi'
      else if (!validatePhone(f.phone))  e.phone = 'Format tidak valid (contoh: 08123456789)'
      return e
    })
    setErrors(newErrors)
    return newErrors.every(e => !e.name && !e.phone)
  }

  function handleSubmit() {
    if (!validateAll()) return
    setSubmitting(true)
    setPassengers(fields.map((f, i) => ({
      name:        f.name.trim(),
      phone:       f.phone.trim(),
      seat_number: selectedSeats[i],
    })))
    router.push(`/booking/${scheduleId}/review`)
  }

  const isValid = fields.length > 0 && fields.every(f =>
    f.name.trim().length >= 3 && validatePhone(f.phone)
  )

  if (fields.length === 0) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2].map(i => <div key={i} className="h-48 bg-slate-100 rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Checkbox auto-fill dari akun */}
      <label className="flex items-center gap-3 bg-bg-card rounded-2xl shadow-card p-4 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={fillSelf}
          onChange={e => handleFillSelf(e.target.checked)}
          className="w-4 h-4 accent-primary rounded flex-shrink-0"
        />
        <span className="text-sm text-slate-700">
          Saya adalah <span className="font-semibold">Penumpang 1</span> — isi otomatis dari akun saya
        </span>
      </label>

      {/* Form per penumpang */}
      {selectedSeats.map((seat, i) => (
        <section key={seat} className="bg-bg-card rounded-2xl shadow-card p-6">
          <h3 className="font-display font-bold text-slate-800 mb-5 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </span>
            <span>Penumpang {i + 1}</span>
            <span className="ml-auto text-xs font-normal bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
              Kursi {seat}
            </span>
          </h3>

          {/* Nama */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fields[i]?.name ?? ''}
              onChange={e => updateField(i, 'name', e.target.value)}
              onBlur={e => blurField(i, 'name', e.target.value)}
              placeholder="Sesuai KTP / identitas"
              className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all
                ${errors[i]?.name ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
            />
            {errors[i]?.name && (
              <p className="text-xs text-red-500 mt-1">{errors[i].name}</p>
            )}
          </div>

          {/* Nomor WA */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={fields[i]?.phone ?? ''}
              onChange={e => updateField(i, 'phone', e.target.value)}
              onBlur={e => blurField(i, 'phone', e.target.value)}
              placeholder="08123456789"
              inputMode="numeric"
              className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all
                ${errors[i]?.phone ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
            />
            {errors[i]?.phone && (
              <p className="text-xs text-red-500 mt-1">{errors[i].phone}</p>
            )}
          </div>
        </section>
      ))}

      {/* Tombol lanjut */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || submitting}
        className={`w-full font-bold py-4 rounded-xl text-sm transition-all duration-200
          ${isValid && !submitting
            ? 'bg-primary text-white hover:bg-primary-hover glow-btn'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
      >
        {submitting ? 'Memproses...' : 'Review Pesanan →'}
      </button>
    </div>
  )
}
