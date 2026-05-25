'use client'
import { Menu } from 'lucide-react'
import { useLayoutStore } from '@/store/useLayoutStore'

export default function TopBar() {
  const { toggleSidebar } = useLayoutStore()

  return (
    <header className="h-16 bg-bg-card border-b border-slate-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/80">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu size={22} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrator</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">
          A
        </div>
      </div>
    </header>
  )
}

