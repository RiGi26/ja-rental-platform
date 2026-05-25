import DriverSidebar from '@/components/DriverSidebar'

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <DriverSidebar />
      <div className="rental-content">
        <main className="p-4">{children}</main>
      </div>
    </div>
  )
}
