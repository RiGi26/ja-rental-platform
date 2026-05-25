'use client'
// Register tidak diperlukan secara terpisah — Supabase auto-buat akun
// saat user pertama kali signInWithOtp. Redirect ke login.
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  next: string
}

export default function RegisterForm({ next }: Props) {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/auth/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`)
  }, [next, router])

  return null
}
