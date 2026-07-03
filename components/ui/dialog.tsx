'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================
// Dialog — thin wrapper over Radix Dialog matching the admin chrome
// (rounded-24, soft shadow, blue #1A56DB accents). First consumer: onboarding
// WelcomeModal. Reusable for future modals.
// ============================================================

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { showClose?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2',
          'rounded-[24px] border border-slate-100 bg-white p-6 focus:outline-none',
          className
        )}
        style={{ boxShadow: '0 12px 40px rgba(15,23,42,0.16)' }}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup"
          >
            <X size={18} />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('font-display text-lg font-bold tracking-tight text-slate-800', className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('mt-1.5 text-sm leading-relaxed text-slate-500', className)}
      {...props}
    />
  )
}
