'use client'

export default function TopBar() {
  return (
    <header className="h-16 bg-bg-card border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div />
      <div className="flex items-center gap-4">
        {/* TODO: notifikasi bell, avatar user */}
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
          A
        </div>
      </div>
    </header>
  )
}
