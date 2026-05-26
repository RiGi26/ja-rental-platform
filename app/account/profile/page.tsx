import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/account/ProfileForm'

export const metadata: Metadata = { title: 'Edit Profil' }

export default async function ProfilePage() {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/auth/login?next=/account/profile')

  return (
    <main className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">

        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Akun Saya
          </Link>
        </div>

        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Edit Profil</h1>
          <p className="text-slate-500 text-sm mt-0.5">Perbarui nama dan nomor WhatsApp Anda</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
          <ProfileForm user={user} />
        </div>

      </div>
    </main>
  )
}
