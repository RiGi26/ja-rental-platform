import type { Metadata } from 'next'
import {
  getAdminDashboardStats,
  getActiveSchedules,
  getVehicleReminders,
  getDriverPerformance,
} from '@/lib/actions/admin.actions'
import StatsCard            from '@/components/admin/StatsCard'
import TrackingTable        from '@/components/admin/TrackingTable'
import QuickActions         from '@/components/admin/QuickActions'
import VehicleReminderList  from '@/components/admin/VehicleReminderList'
import DriverPerformanceList from '@/components/admin/DriverPerformanceList'
import { formatRupiah }     from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard Admin' }

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white p-6 ${className}`}
      style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
    >
      <h2 className="font-display font-bold text-slate-800 mb-5">{title}</h2>
      {children}
    </div>
  )
}

export default async function AdminDashboardPage() {
  const [stats, schedules, reminders, drivers] = await Promise.all([
    getAdminDashboardStats(),
    getActiveSchedules(),
    getVehicleReminders(),
    getDriverPerformance(),
  ])

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Pendapatan Hari Ini"
          value={formatRupiah(stats.revenueToday)}
          subtext="dari transaksi terkonfirmasi"
          icon="💰"
          color="blue"
        />
        <StatsCard
          label="Armada Aktif"
          value={`${stats.vehicles.active}/${stats.vehicles.total}`}
          subtext="kendaraan beroperasi"
          icon="🚐"
          color="green"
        />
        <StatsCard
          label="Booking Hari Ini"
          value={String(stats.bookingsToday)}
          subtext="booking terkonfirmasi"
          icon="📅"
          color="purple"
        />
        <StatsCard
          label="Alert Kendaraan"
          value={String(stats.vehicleAlerts.length)}
          subtext="perlu perhatian dalam 30 hari"
          icon="⚠️"
          color="orange"
        />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">
        <Card title="Armada Aktif & Perjalanan">
          <TrackingTable schedules={schedules as unknown as Parameters<typeof TrackingTable>[0]['schedules']} />
        </Card>
        <Card title="Aksi Cepat">
          <QuickActions />
        </Card>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Reminder Kendaraan">
          <VehicleReminderList vehicles={reminders} />
        </Card>
        <Card title="Performa Driver">
          <DriverPerformanceList drivers={drivers} />
        </Card>
      </div>

    </div>
  )
}
