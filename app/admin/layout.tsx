import AdminSidebar from '@/components/AdminSidebar'
import TopBar from '@/components/TopBar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <AdminSidebar />
      <div className="flex flex-col min-h-screen lg:pl-64 transition-all duration-300">
        <TopBar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
