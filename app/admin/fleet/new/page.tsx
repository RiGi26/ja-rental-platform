import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import VehicleForm from '@/components/admin/VehicleForm'

export const metadata: Metadata = { title: 'Tambah Kendaraan' }

export default function NewVehiclePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      <div>
        <Link href="/admin/fleet" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft size={16} /> Kembali ke Armada
        </Link>
        <h1 className="font-display font-bold text-2xl text-slate-900 mt-2">Tambah Kendaraan</h1>
      </div>
      <div className="bg-white p-6" style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}>
        <VehicleForm mode="create" />
      </div>
    </div>
  )
}
