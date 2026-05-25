import type { Metadata } from 'next'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = { title: 'Daftar' }

interface Props {
  searchParams: Promise<{ next?: string }>
}

export default async function RegisterPage({ searchParams }: Props) {
  const { next = '/' } = await searchParams
  return <RegisterForm next={next} />
}
