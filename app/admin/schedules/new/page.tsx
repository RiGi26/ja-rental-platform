import type { Metadata } from 'next'
import { getAllRoutes, getAllVehicles, getAllDrivers } from '@/lib/actions/admin.actions'
import NewScheduleForm from './NewScheduleForm'
import type { Route, Vehicle, Driver } from '@/lib/types'

export const metadata: Metadata = { title: 'Jadwal Baru' }

export default async function NewSchedulePage() {
  const [routes, vehicles, drivers] = await Promise.all([
    getAllRoutes(),
    getAllVehicles(),
    getAllDrivers(),
  ])

  const availableVehicles = (vehicles as Vehicle[]).filter(v => v.status === 'available')
  const activeDrivers     = (drivers as Driver[]).filter(d => d.status === 'active')

  return (
    <div className="max-w-xl space-y-6 animate-fade-up">
      <h1 className="font-display font-bold text-2xl text-slate-900">Jadwal Baru</h1>
      <div
        className="bg-white p-6"
        style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
      >
        <NewScheduleForm
          routes={routes as Route[]}
          vehicles={availableVehicles}
          drivers={activeDrivers}
        />
      </div>
    </div>
  )
}
