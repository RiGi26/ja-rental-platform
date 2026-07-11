'use client'

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Sparkles, Bus, CalendarDays, ClipboardList, ArrowRight } from 'lucide-react'

// ============================================================
// WelcomeModal — one-time first-run greeting (Orient phase).
// Presentational only: parent (OnboardingLauncher) owns open state + persistence.
// Click-outside is disabled (onPointerDownOutside/onInteractOutside) so a stray
// overlay misclick can't dismiss first-run — closing is only via a deliberate
// choice: the Skip/Start buttons or Escape.
// ============================================================

interface WelcomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  onStartTour: () => void
  onSkip: () => void
}

const POINTS: { icon: React.ElementType; text: string }[] = [
  { icon: Bus, text: 'Kelola armada, rute & driver' },
  { icon: ClipboardList, text: 'Terima dan proses booking' },
  { icon: CalendarDays, text: 'Atur jadwal & pantau perjalanan' },
]

export function WelcomeModal({ open, onOpenChange, userName, onStartTour, onSkip }: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        sheet
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Icon badge */}
        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#1A56DB]/10">
          <Sparkles className="h-6 w-6 text-[#1A56DB]" strokeWidth={2} />
        </div>

        <div className="mt-4">
          <DialogTitle>
            Selamat datang di Portal Rental
            {userName ? `, ${userName.split(' ')[0]}` : ''}
          </DialogTitle>
          <DialogDescription>
            Kami bantu siapkan usaha travel & rentalmu langkah demi langkah, supaya bisa mulai
            menerima booking hari ini.
          </DialogDescription>
        </div>

        {/* What you can do */}
        <ul className="mt-5 space-y-2.5">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-slate-700">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-slate-50 text-slate-500">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </span>
              {text}
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onSkip}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 sm:w-auto"
          >
            Lewati dulu
          </button>
          <button
            onClick={onStartTour}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#1A56DB] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1543ad]"
          >
            Mulai tur singkat
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
