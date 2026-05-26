'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { createCoreClient } from '@/lib/supabase/client'
import { normalizePhone } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
}

export default function ProfileForm({ user }: Props) {
  const meta = user.user_metadata as { full_name?: string; phone?: string }

  const [name,    setName]    = useState(meta.full_name ?? '')
  const [phone,   setPhone]   = useState(meta.phone    ?? '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const supabase = createCoreClient()
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: name.trim(),
        phone:     normalizePhone(phone),
      },
    })

    setLoading(false)
    if (updateError) {
      setError('Gagal menyimpan. Coba lagi.')
    } else {
      setSuccess(true)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={16} />
          Profil berhasil diupdate.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">
          Nama Lengkap
        </label>
        <input
          type="text"
          required
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
          Nomor WhatsApp
        </label>
        <input
          type="tel"
          required
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
          Email
        </label>
        <input
          type="email"
          value={user.email ?? ''}
          readOnly
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-400
                     bg-slate-50 cursor-not-allowed"
        />
        <p className="text-xs text-slate-400 mt-1">Email tidak dapat diubah.</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white
                   text-sm font-bold rounded-xl transition-colors glow-btn
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        Simpan Perubahan
      </button>
    </form>
  )
}
