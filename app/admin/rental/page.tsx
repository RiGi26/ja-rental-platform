import { assertEntitled } from '@/lib/tenant-entitlements'

export default async function AdminRentalPage() {
  // Tier gate: modul rental self-drive = Pro (Starter/Growth diblok → upsell).
  await assertEntitled('selfdrive')

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-text mb-6">Manajemen Rental</h1>
      {/* TODO: kalender availability, deposit, harga dinamis, blacklist customer */}
    </div>
  )
}
