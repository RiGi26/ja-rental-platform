'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTransition } from 'react'
import { Check, X, ArrowRight, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { dismissChecklist, markStepDone } from '@/lib/actions/onboarding.actions'
import type { ChecklistItem } from '@/lib/onboarding/state'

// ============================================================
// OnboardingChecklist — "Misi Pertama" card on the admin dashboard (Activate phase).
// Derived steps auto-tick from real data; manual steps mark done on CTA click then
// navigate. Dismissal persists per-user in user_onboarding (server action). Hidden
// once all steps are complete (parent decides visibility via getOnboardingState()).
// ============================================================

interface OnboardingChecklistProps {
  items: ChecklistItem[]
  completed: number
  total: number
  progress: number
}

export function OnboardingChecklist({ items, completed, total, progress }: OnboardingChecklistProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleManual(key: string, href: string) {
    startTransition(async () => {
      await markStepDone(key)
      router.push(href)
    })
  }

  function replayTour() {
    window.dispatchEvent(new CustomEvent('onboarding:replay-tour'))
  }

  return (
    <div
      data-tour="onboarding-checklist"
      className="bg-white p-4 sm:p-5"
      style={{ borderRadius: 24, boxShadow: '0 5px 18px rgba(15,23,42,0.05)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold tracking-tight text-slate-800 sm:text-lg">
            Misi Pertama
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Selesaikan langkah ini untuk menyiapkan usahamu.
          </p>
        </div>
        <button
          onClick={() => startTransition(() => void dismissChecklist())}
          className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Sembunyikan Misi Pertama"
          title="Sembunyikan"
        >
          <X size={18} />
        </button>
      </div>

      {/* Progress */}
      <div className="mt-3.5">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
          <span className="text-[#1A56DB]">{completed} dari {total} selesai</span>
          <span className="text-slate-400 tabular-nums">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#1A56DB] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <ul className="mt-4 space-y-1.5">
        {items.map((item) => (
          <li
            key={item.key}
            className={cn(
              'flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors',
              item.done ? 'opacity-70' : 'hover:bg-slate-50'
            )}
          >
            {/* Status circle */}
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                item.done
                  ? 'border-[#1A56DB] bg-[#1A56DB] text-white'
                  : 'border-slate-300 bg-white text-transparent'
              )}
            >
              <Check size={14} strokeWidth={3} />
            </span>

            {/* Label */}
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-sm font-semibold',
                  item.done ? 'text-slate-500 line-through' : 'text-slate-800'
                )}
              >
                {item.title}
              </p>
              {!item.done && <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>}
            </div>

            {/* CTA — only while incomplete */}
            {!item.done &&
              (item.manual ? (
                <button
                  onClick={() => handleManual(item.key, item.href)}
                  disabled={pending}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#1A56DB] transition-colors hover:bg-[#1A56DB]/10 disabled:opacity-50"
                >
                  {item.ctaLabel}
                  <ArrowRight size={14} strokeWidth={2.2} />
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#1A56DB] transition-colors hover:bg-[#1A56DB]/10"
                >
                  {item.ctaLabel}
                  <ArrowRight size={14} strokeWidth={2.2} />
                </Link>
              ))}
          </li>
        ))}
      </ul>

      {/* Footer — replay tour */}
      <div className="mt-3 border-t border-slate-100 pt-3">
        <button
          onClick={replayTour}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-700"
        >
          <PlayCircle size={15} strokeWidth={1.8} />
          Putar ulang tur
        </button>
      </div>
    </div>
  )
}
