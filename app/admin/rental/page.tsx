import type { Metadata } from 'next'
import { assertEntitled } from '@/lib/tenant-entitlements'
import { getRentalBookings, getRentalVehicles } from '@/lib/actions/rental.actions'
import RentalManager from '@/components/admin/RentalManager'

export const metadata: Metadata = { title: 'Manajemen Rental' }

export default async function AdminRentalPage() {
  // Tier gate: modul rental self-drive = Pro (Starter/Growth diblok → upsell).
  await assertEntitled('selfdrive')

  const [rentals, vehicles] = await Promise.all([getRentalBookings(), getRentalVehicles()])

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-slate-900">Manajemen Rental</h1>
        <span className="text-sm text-slate-400">{rentals.length} sewa</span>
      </div>

      <RentalManager rentals={rentals} vehicles={vehicles} />
    </div>
  )
}
